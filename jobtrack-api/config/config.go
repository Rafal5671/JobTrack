// Package config handles loading and storing application configuration
// from environment variables and .env files.
package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all application configuration values
// loaded from environment variables.
type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	Port       string
}

// Load reads configuration from a .env file if present,
// falling back to system environment variables.
// Returns a pointer to a populated Config struct.
func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	return &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "jobtrack"),
		JWTSecret:  getEnv("JWT_SECRET", "changeme"),
		Port:       getEnv("PORT", "8080"),
	}
}

// getEnv returns the value of the environment variable named by key.
// Falls back to the provided default value if the variable is not set.
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
