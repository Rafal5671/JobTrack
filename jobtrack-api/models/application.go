package models

import (
	"time"

	"gorm.io/gorm"
)

// ApplicationStatus represents the current stage of a job application
// in the recruitment pipeline.
type ApplicationStatus string

const (
	// StatusSaved means the job was bookmarked but not yet applied to.
	StatusSaved ApplicationStatus = "saved"
	// StatusApplied means the application was submitted.
	StatusApplied ApplicationStatus = "applied"
	// StatusScreening means the recruiter made initial contact.
	StatusScreening ApplicationStatus = "screening"
	// StatusInterview means at least one interview is scheduled.
	StatusInterview ApplicationStatus = "interview"
	// StatusOffer means a job offer was received.
	StatusOffer ApplicationStatus = "offer"
	// StatusRejected means the application was unsuccessful.
	StatusRejected ApplicationStatus = "rejected"
	// StatusWithdrawn means the user withdrew their application.
	StatusWithdrawn ApplicationStatus = "withdrawn"
)

// Application represents a single job application tracked by the user.
// It holds company details, current status and links to related notes,
// contacts and reminders.
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
