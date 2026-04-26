// Package db handles database connection and schema migration.
package db

import (
	"fmt"
	"log"

	"jobtrack-api/config"
	"jobtrack-api/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the global database instance shared across the application.
var DB *gorm.DB

// Connect establishes a connection to the PostgreSQL database using
// the provided configuration and runs AutoMigrate for all models.
// Terminates the application if the connection or migration fails.
func Connect(cfg *config.Config) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")

	if err := db.AutoMigrate(
		&models.User{},
		&models.Application{},
		&models.Contact{},
		&models.Note{},
		&models.Reminder{},
	); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("Database migrations completed")
	DB = db
	return db
}
