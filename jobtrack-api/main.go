// JobTrack API – backend service for tracking job applications.
// Starts the Gin HTTP server and a background reminder worker.
package main

import (
	"log"

	"jobtrack-api/config"
	"jobtrack-api/db"
	"jobtrack-api/router"
	"jobtrack-api/worker"
)

func main() {
	// Load configuration from .env or system environment.
	cfg := config.Load()

	// Connect to PostgreSQL and run migrations.
	database := db.Connect(cfg)

	// Start the reminder worker in a separate goroutine.
	go worker.StartReminderWorker(database)

	// Set up Gin router with all routes and middleware.
	r := router.Setup(cfg, database)

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
