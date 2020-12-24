package main

import (
	"github.com/gin-gonic/gin"
	"log"
)

var appEnv string
var origin string

func init() {
	appEnv = mustEnv("APP_ENV")
	origin = mustEnv("ORIGIN")
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	r := gin.Default()

	if isDev() {
		r.Use(debugRequestURL)
		r.Use(debugHeaders)
		r.Use(debugJsonBody)
	}

	log.Printf("[INIT] APP_ENV=%s, ORIGIN=%s\n", appEnv, origin)

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong GET",
		})
	})
	r.POST("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong POST",
		})
	})
	log.Fatalln(r.Run()) // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
