// Package services contains the business logic layer for JobTrack.
package services

import (
	"errors"
	"time"

	"jobtrack-api/models"

	"gorm.io/gorm"
)

// ReminderService handles business logic for application reminders.
type ReminderService struct {
	db *gorm.DB
}

// NewReminderService creates a new ReminderService with the given database.
func NewReminderService(db *gorm.DB) *ReminderService {
	return &ReminderService{db: db}
}

// GetAll returns all reminders for a given application.
// Results are ordered by due date ascending.
func (s *ReminderService) GetAll(applicationID, userID uint) ([]models.Reminder, error) {
	var reminders []models.Reminder
	if err := s.db.
		Where("application_id = ? AND user_id = ?", applicationID, userID).
		Order("due_at ASC").
		Find(&reminders).Error; err != nil {
		return nil, errors.New("failed to fetch reminders")
	}
	return reminders, nil
}

// GetPending returns all unsent reminders whose due date has passed.
// Used by the background worker to find reminders that need to be dispatched.
func (s *ReminderService) GetPending() ([]models.Reminder, error) {
	var reminders []models.Reminder
	if err := s.db.
		Where("sent = ? AND due_at <= ?", false, time.Now()).
		Find(&reminders).Error; err != nil {
		return nil, errors.New("failed to fetch pending reminders")
	}
	return reminders, nil
}

// Create saves a new reminder attached to the given application.
// Returns an error if the application does not belong to the given user.
func (s *ReminderService) Create(applicationID, userID uint, input *CreateReminderInput) (*models.Reminder, error) {
	// Verify the application belongs to the user before creating a reminder.
	var application models.Application
	if err := s.db.
		Where("id = ? AND user_id = ?", applicationID, userID).
		First(&application).Error; err != nil {
		return nil, errors.New("application not found")
	}

	reminder := &models.Reminder{
		ApplicationID: applicationID,
		UserID:        userID,
		Title:         input.Title,
		DueAt:         input.DueAt,
	}

	if err := s.db.Create(reminder).Error; err != nil {
		return nil, errors.New("failed to create reminder")
	}

	return reminder, nil
}

// Update modifies an existing reminder.
// Only fields provided in the input are updated.
func (s *ReminderService) Update(id, userID uint, input *UpdateReminderInput) (*models.Reminder, error) {
	var reminder models.Reminder
	if err := s.db.
		Where("id = ? AND user_id = ?", id, userID).
		First(&reminder).Error; err != nil {
		return nil, errors.New("reminder not found")
	}

	updates := map[string]any{}

	if input.Title != "" {
		updates["title"] = input.Title
	}
	if !input.DueAt.IsZero() {
		updates["due_at"] = input.DueAt
	}

	if err := s.db.Model(&reminder).Updates(updates).Error; err != nil {
		return nil, errors.New("failed to update reminder")
	}

	return &reminder, nil
}

// MarkAsSent sets the Sent field to true for the given reminder.
// Called by the background worker after successfully dispatching an email.
func (s *ReminderService) MarkAsSent(id uint) error {
	if err := s.db.Model(&models.Reminder{}).
		Where("id = ?", id).
		Update("sent", true).Error; err != nil {
		return errors.New("failed to mark reminder as sent")
	}
	return nil
}

// Delete soft-deletes a reminder by ID.
// Returns an error if the reminder does not belong to the given user.
func (s *ReminderService) Delete(id, userID uint) error {
	result := s.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Reminder{})
	if result.Error != nil {
		return errors.New("failed to delete reminder")
	}
	if result.RowsAffected == 0 {
		return errors.New("reminder not found")
	}
	return nil
}

// CreateReminderInput holds validated data for creating a new reminder.
type CreateReminderInput struct {
	Title string    `json:"title" binding:"required"`
	DueAt time.Time `json:"due_at" binding:"required"`
}

// UpdateReminderInput holds validated data for updating an existing reminder.
// All fields are optional — only non-zero values are applied.
type UpdateReminderInput struct {
	Title string    `json:"title"`
	DueAt time.Time `json:"due_at"`
}
