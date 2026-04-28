// Package services contains the business logic layer for JobTrack.
package services

import (
	"errors"

	"jobtrack-api/models"

	"time"

	"gorm.io/gorm"
)

// ApplicationService handles business logic for job applications.
type ApplicationService struct {
	db *gorm.DB
}

// NewApplicationService creates a new ApplicationService with the given database.
func NewApplicationService(db *gorm.DB) *ApplicationService {
	return &ApplicationService{db: db}
}

// GetAll returns all applications belonging to the given user.
// Results are ordered by creation date descending.
func (s *ApplicationService) GetAll(userID uint) ([]models.Application, error) {
	var applications []models.Application
	if err := s.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&applications).Error; err != nil {
		return nil, errors.New("failed to fetch applications")
	}
	return applications, nil
}

// GetByID returns a single application by ID.
// Returns an error if the application does not belong to the given user.
func (s *ApplicationService) GetByID(id, userID uint) (*models.Application, error) {
	var application models.Application
	if err := s.db.
		Preload("Notes").
		Preload("Contacts").
		Preload("Reminders").
		Where("id = ? AND user_id = ?", id, userID).
		First(&application).Error; err != nil {
		return nil, errors.New("application not found")
	}
	return &application, nil
}

// Create saves a new application for the given user.
func (s *ApplicationService) Create(userID uint, input *CreateApplicationInput) (*models.Application, error) {
	application := &models.Application{
		UserID:    userID,
		Company:   input.Company,
		Role:      input.Role,
		Status:    models.StatusSaved,
		Location:  input.Location,
		Salary:    input.Salary,
		JobURL:    input.JobURL,
		AppliedAt: input.AppliedAt,
	}

	if err := s.db.Create(application).Error; err != nil {
		return nil, errors.New("failed to create application")
	}

	return application, nil
}

// Update modifies an existing application.
// Only fields provided in the input are updated.
func (s *ApplicationService) Update(id, userID uint, input *UpdateApplicationInput) (*models.Application, error) {
	application, err := s.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	updates := map[string]any{}

	if input.Company != "" {
		updates["company"] = input.Company
	}
	if input.Role != "" {
		updates["role"] = input.Role
	}
	if input.Status != "" {
		updates["status"] = input.Status
	}
	if input.Location != "" {
		updates["location"] = input.Location
	}
	if input.Salary != "" {
		updates["salary"] = input.Salary
	}
	if input.JobURL != "" {
		updates["job_url"] = input.JobURL
	}
	if input.AppliedAt != nil {
		updates["applied_at"] = input.AppliedAt
	}

	if err := s.db.Model(application).Updates(updates).Error; err != nil {
		return nil, errors.New("failed to update application")
	}

	return application, nil
}

// UpdateStatus changes only the status field of an application.
// Used by the kanban board drag and drop.
func (s *ApplicationService) UpdateStatus(id, userID uint, status models.ApplicationStatus) (*models.Application, error) {
	application, err := s.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	if err := s.db.Model(application).Update("status", status).Error; err != nil {
		return nil, errors.New("failed to update status")
	}

	application.Status = status
	return application, nil
}

// Delete soft-deletes an application by ID.
// Returns an error if the application does not belong to the given user.
func (s *ApplicationService) Delete(id, userID uint) error {
	result := s.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Application{})
	if result.Error != nil {
		return errors.New("failed to delete application")
	}
	if result.RowsAffected == 0 {
		return errors.New("application not found")
	}
	return nil
}

// CreateApplicationInput holds validated data for creating a new application.
type CreateApplicationInput struct {
	Company   string     `json:"company" binding:"required,min=2,max=100"`
	Role      string     `json:"role" binding:"required,min=2,max=100"`
	Location  string     `json:"location" binding:"omitempty,max=100"`
	Salary    string     `json:"salary" binding:"omitempty,max=50"`
	JobURL    string     `json:"job_url" binding:"omitempty,url"`
	AppliedAt *time.Time `json:"applied_at"`
}

// UpdateApplicationInput holds validated data for updating an existing application.
// All fields are optional — only non-zero values are applied.
type UpdateApplicationInput struct {
	Company   string                   `json:"company" binding:"omitempty,min=2,max=100"`
	Role      string                   `json:"role" binding:"omitempty,min=2,max=100"`
	Status    models.ApplicationStatus `json:"status" binding:"omitempty,oneof=saved applied screening interview offer rejected withdrawn"`
	Location  string                   `json:"location" binding:"omitempty,max=100"`
	Salary    string                   `json:"salary" binding:"omitempty,max=50"`
	JobURL    string                   `json:"job_url" binding:"omitempty,url"`
	AppliedAt *time.Time               `json:"applied_at"`
}
