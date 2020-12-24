package main

import (
	"log"
	"os"
)

func mustEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Panicln("Required env var not set:", key)
	}
	return val
}

func isDev() bool {
	return AppEnv == "development"
}
