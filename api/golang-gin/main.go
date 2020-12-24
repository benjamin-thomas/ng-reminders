package main

import (
	"github.com/gin-gonic/gin"
	"log"
)

var AppEnv string
var Origin string

func init() {
	AppEnv = mustEnv("APP_ENV")
	Origin = mustEnv("ORIGIN")
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	r := gin.Default()

	if isDev() {
		r.Use(debugRequestURL)
		r.Use(debugHeaders)
		r.Use(debugJsonBody)
	}

	log.Printf("[INIT] APP_ENV=%s, ORIGIN=%s\n", AppEnv, Origin)

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
	log.Fatalln(r.Run())
}
