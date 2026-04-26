package models

import (
	"time"

	"gorm.io/gorm"
)

// Contact represents an HR or recruiter contact associated with the user.
// A contact can be linked to multiple applications via a many-to-many relation.
type Contact struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;index" json:"user_id"`
	Name      string         `gorm:"not null" json:"name"`
	Role      string         `json:"role"`
	Company   string         `json:"company"`
	Email     string         `json:"email"`
	LinkedIn  string         `json:"linkedin"`
	Phone     string         `json:"phone"`
	Notes     string         `json:"notes"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	User         User          `gorm:"foreignKey:UserID" json:"-"`
	Applications []Application `gorm:"many2many:application_contacts;" json:"applications,omitempty"`
}
