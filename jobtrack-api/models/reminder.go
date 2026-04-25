package models

import (
	"time"

	"gorm.io/gorm"
)

type Reminder struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	ApplicationID uint           `gorm:"not null;index" json:"application_id"`
	UserID        uint           `gorm:"not null;index" json:"user_id"`
	Title         string         `gorm:"not null" json:"title"`
	DueAt         time.Time      `gorm:"not null" json:"due_at"`
	Sent          bool           `gorm:"default:false" json:"sent"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
