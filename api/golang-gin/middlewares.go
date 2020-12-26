package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/TylerBrock/colorjson"
	"github.com/gin-gonic/gin"
	csrf "github.com/utrack/gin-csrf"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

const ColorReset = "\033[1;m"
const Red = "\033[1;31m"
const Purple = "\033[1;35m"
const Yellow = "\033[1;33m"
const Grey = "\033[38;5;245m"

func debugRequestURL(c *gin.Context) {
	fmt.Print(Purple, "[DEBUG REQUEST URL]", ColorReset, "\n")
	fmt.Println(Grey, "  ", c.Request.URL, ColorReset)
}

func debugHeaders(c *gin.Context) {
	var headers []string
	fmt.Print(Yellow, "[DEBUG HEADERS]", ColorReset, "\n")
	for name, values := range c.Request.Header {
		for _, val := range values {
			headers = append(headers, fmt.Sprintf("   %v: %v", name, val))
		}
	}
	fmt.Print(strings.Join(headers, "\n"))
	fmt.Println()
}

func debugJsonBody(c *gin.Context) {
	fmt.Print(Purple, "[DEBUG JSON BODY]", ColorReset, "\n")
	jBytes, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		panic(err)
	}
	if len(jBytes) == 0 {
		fmt.Println(Grey, "  BODY IS EMPTY", ColorReset)

		c.Next()
		return
	}
	var j map[string]interface{}
	err = json.Unmarshal(jBytes, &j)
	if err != nil {
		panic(err)
	}
	s, err := colorjson.Marshal(j)
	if err != nil {
		panic(err)
	}
	fmt.Println("  ", string(s))
	c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(jBytes)) // reset body bytes
}

func setXsrfCookie(c *gin.Context) {
	log.Println("CSRF token is:", csrf.GetToken(c))
	c.SetCookie("XSRF-TOKEN", csrf.GetToken(c), 3600, "/", Domain, true, false)
	//c.Header("X-XSRF-TOKEN", csrf.GetToken(c))
}

func requireAuth(c *gin.Context) {
	session := mustGetSession(c.Request)
	if session.Values["userID"] == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "must login first",
		})
		c.Abort()
	}
}
