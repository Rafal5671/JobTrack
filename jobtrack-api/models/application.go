package models

import (
	"time"

	"gorm.io/gorm"
)

type ApplicationStatus string

const (
	StatusSaved     ApplicationStatus = "saved"
	StatusApplied   ApplicationStatus = "applied"
	StatusScreening ApplicationStatus = "screening"
	StatusInterview ApplicationStatus = "interview"
	StatusOffer     ApplicationStatus = "offer"
	StatusRejected  ApplicationStatus = "rejected"
	StatusWithdrawn ApplicationStatus = "withdrawn"
)

type Application struct {
	ID        uint              `gorm:"primaryKey" json:"id"`
	UserID    uint              `gorm:"not null;index" json:"user_id"`
	Company   string            `gorm:"not null" json:"company"`
	Role      string            `gorm:"not null" json:"role"`
	Status    ApplicationStatus `gorm:"not null;default:'saved'" json:"status"`
	Location  string            `json:"location"`
	Salary    string            `json:"salary"`
	JobURL    string            `json:"job_url"`
	AppliedAt *time.Time        `json:"applied_at"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
	DeletedAt gorm.DeletedAt    `gorm:"index" json:"-"`

	User      User       `gorm:"foreignKey:UserID" json:"-"`
	Notes     []Note     `gorm:"foreignKey:ApplicationID" json:"notes,omitempty"`
	Contacts  []Contact  `gorm:"many2many:application_contacts;" json:"contacts,omitempty"`
	Reminders []Reminder `gorm:"foreignKey:ApplicationID" json:"reminders,omitempty"`
}
