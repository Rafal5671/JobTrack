package main

import (
	"log"

	"jobtrack-api/config"
	"jobtrack-api/db"
	"jobtrack-api/router"
	"jobtrack-api/worker"
)

func main() {
	cfg := config.Load()

	database := db.Connect(cfg)

	go worker.StartReminderWorker(database)

	r := router.Setup(cfg, database)

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
