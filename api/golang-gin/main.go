package main

import (
  "database/sql"
  "errors"
  "fmt"
  "github.com/antonlindstrom/pgstore"
  "github.com/k0kubun/pp"
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
  defer db.Close()

  // Run a background goroutine to clean up expired sessions from the database.
  defer sessionStore.StopCleanup(sessionStore.Cleanup(time.Minute * 5))

  log.SetFlags(log.LstdFlags | log.Lshortfile)
  r := gin.Default()

  if isDev() {
    pp.Println("Starting up...") // keeping import for ref
    r.Use(debugRequestURL)
    r.Use(debugHeaders)
    r.Use(debugJsonBody)
  }

  store := cookie.NewStore([]byte(mustEnv("COOKIES_SIGNING_SECRET")))
  store.Options(ginSessions.Options{ // SameSite not available
    Domain:   Domain,
    Secure:   true,
    HttpOnly: true,
    SameSite: http.SameSiteStrictMode, // v.0.0.3
  })
  r.Use(ginSessions.Sessions("csrf-session", store)) // dependency, ugly

  r.Use(csrf.Middleware(csrf.Options{
    Secret: mustEnv("COOKIES_SIGNING_SECRET"),
    ErrorFunc: func(c *gin.Context) {
      c.String(400, "CSRF token mismatch")
      c.Abort()
    },
  }))
  r.Use(setXsrfHeader)

  c := cors.New(cors.Options{
    AllowedOrigins: []string{Origin},
    AllowedHeaders: []string{
      "X-XSRF-TOKEN",
      "Content-Type", // front end sends application/json
    },
    AllowCredentials: true,
    AllowedMethods: []string{"PATCH"},

    // Enable Debugging for testing, consider disabling in production
    Debug: true,
  })
  //cc := cors.Default()
  r.Use(c)

  //config := cors.DefaultConfig()
  //config.AllowOrigins = []string{"*"}
  //r.Use(cors.New(config))
  //r.Use(cors.New(cors.Config{
  //  AllowOrigins:     []string{Origin},
  //  AllowMethods:     []string{"GET", "POST", "PUT", "PATCH"},
  //  AllowHeaders:     []string{"X-XSRF-TOKEN", "Content-Type"},
  //  AllowCredentials: true,
  //  MaxAge: 12 * time.Hour,
  //}))

  r.GET("/ping", func(c *gin.Context) {
    c.JSON(200, gin.H{
      "message": "pong GET",
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
    pp.Println("session -->", session.ID)
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
    var p CredentialsParams
    c.BindJSON(&p)
    pp.Println(p)

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

    pp.Println("email:", email, "pwHash:", pwHash)

    err := bcrypt.CompareHashAndPassword([]byte(pwHash), []byte(p.Password))
    if err != nil {
      log.Println(err)
      c.AbortWithError(500, errors.New("Something went wrong!!"))
      return
    }

    session := mustGetSession(c.Request)
    session.Values["userID"] = userID
    session.Save(c.Request, c.Writer)
    c.JSON(200, gin.H{"status": "logged in"})
  })

  r.POST("/logout", func(c *gin.Context) {
    session := mustGetSession(c.Request)
    session.Values["userID"] = nil
    session.Save(c.Request, c.Writer)
    c.JSON(200, gin.H{"status": "logged out"})
  })

  r.POST("/register", func(c *gin.Context) {
    var p CredentialsParams
    c.BindJSON(&p)

    hash, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
    if err != nil {
      log.Println(err)
      c.AbortWithError(500, errors.New("Something went wrong!!"))
      return
    }

    pp.Println("--> hash", hash)
    pp.Println("--> p", p)

    var userID int
    row := db.QueryRow("INSERT INTO users (email, pw_hash) VALUES ($1, $2) RETURNING id", p.Email, hash)
    err = row.Scan(&userID)
    if err != nil {
      fmt.Println("--> Err:", err)
      c.AbortWithError(500, errors.New("Something went wrong!"))
      return
    }
    pp.Println("--> userID", userID)

    c.JSON(200, gin.H{
      "status": fmt.Sprintf("created with id: %d", userID),
    })
  })

  r.Use(requireAuth)

  r.GET("/ping2", func(c *gin.Context) {
    session := mustGetSession(c.Request)
    c.JSON(200, gin.H{
      "csrfToken":     csrf.GetToken(c),
      "authenticated": true,
      "userID": session.Values["userID"],
    })
  })

  r.GET("/reminders", getReminders)
  r.POST("/reminders", createReminder)
  r.GET("/reminders/:id", getReminder)
  r.PATCH("/reminders/:id", patchReminder)
  r.DELETE("/reminders/:id", deleteReminder)

  log.Fatalln(r.Run())
}
