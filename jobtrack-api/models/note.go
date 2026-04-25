package models

import (
	"time"

	"gorm.io/gorm"
)

type Note struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	ApplicationID uint           `gorm:"not null;index" json:"application_id"`
	UserID        uint           `gorm:"not null;index" json:"user_id"`
	Content       string         `gorm:"not null" json:"content"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
