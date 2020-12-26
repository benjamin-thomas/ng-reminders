package main

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/antonlindstrom/pgstore"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"net/http"

	// Dependency of gin-csrf, name clashes with gorilla sessions so renamed
	// See: ./utils.go
	ginSessions "github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"
	"github.com/utrack/gin-csrf"
	"log"
	"time"
)

var AppEnv string
var Origin string
var Domain string
var DbURL string
var sessionStore *pgstore.PGStore
var db *sql.DB

func debugChain(msg string) func(*gin.Context) {
	return func(*gin.Context) {
		log.Println(Red, "---> DEBUG :", msg, ColorReset)
	}
}

func init() {
	AppEnv = mustEnv("APP_ENV")
	Origin = mustEnv("ORIGIN")
	Domain = mustEnv("DOMAIN")
	DbURL = mustEnv("DATABASE_URL")
	setupPgStore()
}

func setupPgStore() {
	var err error
	sessionStore, err = pgstore.NewPGStore(DbURL, []byte(mustEnv("SESSION_SECRET")))
	if err != nil {
		panic(err)
	}

	sessionStore.Options.Domain = Domain
	sessionStore.Options.Secure = true
	sessionStore.Options.HttpOnly = true
	sessionStore.Options.SameSite = http.SameSiteStrictMode
}

func main() {
	defer sessionStore.Close()

	var dbErr error
	db, dbErr = sql.Open("postgres", mustEnv("DATABASE_URL"))
	if dbErr != nil {
		panic(dbErr)
	}
	defer func() {
		panicIf(db.Close())
	}()

	// Run a background goroutine to clean up expired sessions from the database.
	defer sessionStore.StopCleanup(sessionStore.Cleanup(time.Minute * 5))

	log.SetFlags(log.LstdFlags | log.Lshortfile)
	r := gin.Default()

	if isDev() {
		r.Use(debugRequestURL)
		r.Use(debugHeaders)
		r.Use(debugJsonBody)
	}
	r.Use(debugChain("After dev middlewares"))

	store := cookie.NewStore([]byte(mustEnv("COOKIES_SIGNING_SECRET")))
	store.Options(ginSessions.Options{ // SameSite not available
		Domain:   Domain,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode, // v.0.0.3
	})
	r.Use(ginSessions.Sessions("csrf-session", store)) // dependency, ugly
	r.Use(debugChain("After csrf session"))

	r.Use(csrf.Middleware(csrf.Options{
		Secret: mustEnv("COOKIES_SIGNING_SECRET"),
		ErrorFunc: func(c *gin.Context) {
			c.String(400, "CSRF token mismatch")
			c.Abort()
		},
	}))
	r.Use(debugChain("After CSRF"))
	r.Use(setXsrfCookie)
	r.Use(debugChain("After XSRF"))

	c := cors.New(cors.Options{
		AllowedOrigins: []string{Origin},
		AllowedHeaders: []string{
			"X-XSRF-TOKEN",
			"Content-Type", // front end sends application/json
		},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE"},

		// Enable Debugging for testing, consider disabling in production
		Debug: true,
	})
	//cc := cors.Default()
	r.Use(c)
	r.Use(debugChain("After Cors"))

	r.GET("/csrf", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "OK",
		})
	})

	log.Printf("[INIT] APP_ENV=%s, DOMAIN=%s, ORIGIN=%s, DATABASE_URL=%s\n", AppEnv, Domain, Origin, DbURL)

	r.POST("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong POST",
		})
	})

	r.GET("/session", func(c *gin.Context) {

		r := c.Request
		w := c.Writer

		session := mustGetSession(c.Request)
		// Add a value.
		vc, found := session.Values["viewCount"].(int)
		if !found {
			vc = 0
		}
		session.Values["viewCount"] = vc + 1

		// Save.
		if err := session.Save(r, w); err != nil {
			log.Fatalf("Error saving session: %v", err)
		}
		c.JSON(200, gin.H{
			"viewCount": session.Values["viewCount"],
			"csrfToken": csrf.GetToken(c),
		})

	})

	type CredentialsParams struct {
		Email    string `binding:"required"`
		Password string `binding:"required"`
	}
	r.POST("/login", func(c *gin.Context) {
		fmt.Println("---> Entering login...")
		var p CredentialsParams
		panicIf(c.BindJSON(&p))

		row := db.QueryRow("SELECT id, email, pw_hash FROM users WHERE email = $1", p.Email)

		var userID, email, pwHash string
		switch err := row.Scan(&userID, &email, &pwHash); err {
		case nil:
			// NOOP
		case sql.ErrNoRows:
			c.JSON(http.StatusUnauthorized, gin.H{"status": "invalid credentials"})
			c.Abort()
			return
		default:
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"status": "unknown err"})
			c.Abort()
			return
		}

		err := bcrypt.CompareHashAndPassword([]byte(pwHash), []byte(p.Password))
		if err != nil {
			log.Println(err)
			panicIf(c.AbortWithError(500, errors.New("something went wrong")))
			return
		}

		session := mustGetSession(c.Request)
		session.Values["userID"] = userID
		panicIf(session.Save(c.Request, c.Writer))
		c.JSON(200, gin.H{"status": "logged in"})
	})

	r.POST("/logout", func(c *gin.Context) {
		session := mustGetSession(c.Request)
		session.Values["userID"] = nil
		panicIf(session.Save(c.Request, c.Writer))
		c.JSON(200, gin.H{"status": "logged out"})
	})

	r.POST("/register", func(c *gin.Context) {
		var p CredentialsParams
		panicIf(c.BindJSON(&p))

		hash, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Println(err)
			panicIf(c.AbortWithError(500, errors.New("something went wrong")))
			return
		}

		var userID int
		row := db.QueryRow("INSERT INTO users (email, pw_hash) VALUES ($1, $2) RETURNING id", p.Email, hash)
		err = row.Scan(&userID)
		if err != nil {
			fmt.Println("--> Err:", err)
			panicIf(c.AbortWithError(500, errors.New("something went wrong")))
			return
		}
		c.JSON(200, gin.H{
			"status": fmt.Sprintf("created with id: %d", userID),
		})
	})

	r.Use(requireAuth)
	r.Use(debugChain("After Auth"))

	r.GET("/ping2", func(c *gin.Context) {
		session := mustGetSession(c.Request)
		c.JSON(200, gin.H{
			"csrfToken":     csrf.GetToken(c),
			"authenticated": true,
			"userID":        session.Values["userID"],
		})
	})

	r.GET("/reminders", getReminders)
	r.POST("/reminders", createReminder)
	r.DELETE("/reminders", deleteManyReminders)
	r.GET("/reminders/:id", getReminder)
	r.PATCH("/reminders/:id", patchReminder)
	r.DELETE("/reminders/:id", deleteReminder)

	log.Fatalln(r.Run())
}
