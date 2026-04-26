// Package models defines GORM database models for JobTrack.
package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a registered account in the system.
// The Password field is excluded from JSON responses to prevent leaking credentials.
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	Name      string         `gorm:"not null" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Applications []Application `gorm:"foreignKey:UserID" json:"applications,omitempty"`
}
