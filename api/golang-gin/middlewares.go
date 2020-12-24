package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/TylerBrock/colorjson"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"strings"
)

const ColorReset = "\033[1;m"
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
	c.Next()
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
	c.Next()
}
