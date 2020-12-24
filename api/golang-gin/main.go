package main

import (
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	r := gin.Default()
	log.Println("Initializing gin4...")

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	log.Fatalln(r.Run()) // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
