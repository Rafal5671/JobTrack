package models

import (
	"time"

	"gorm.io/gorm"
)

// Note stores a free-text observation or log entry attached to a job application.
// Notes are append-only by convention — edit support can be added later.
type Note struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	ApplicationID uint           `gorm:"not null;index" json:"application_id"`
	UserID        uint           `gorm:"not null;index" json:"user_id"`
	Content       string         `gorm:"not null" json:"content"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
