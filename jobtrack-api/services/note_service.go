// Package services contains the business logic layer for JobTrack.
package services

import (
	"errors"

	"jobtrack-api/models"

	"gorm.io/gorm"
)

// NoteService handles business logic for application notes.
type NoteService struct {
	db *gorm.DB
}

// NewNoteService creates a new NoteService with the given database.
func NewNoteService(db *gorm.DB) *NoteService {
	return &NoteService{db: db}
}

// GetAll returns all notes for a given application.
// Returns an error if the application does not belong to the given user.
func (s *NoteService) GetAll(applicationID, userID uint) ([]models.Note, error) {
	var notes []models.Note
	if err := s.db.
		Where("application_id = ? AND user_id = ?", applicationID, userID).
		Order("created_at DESC").
		Find(&notes).Error; err != nil {
		return nil, errors.New("failed to fetch notes")
	}
	return notes, nil
}

// Create saves a new note attached to the given application.
// Returns an error if the application does not belong to the given user.
func (s *NoteService) Create(applicationID, userID uint, input *CreateNoteInput) (*models.Note, error) {
	// Verify the application belongs to the user before creating a note.
	var application models.Application
	if err := s.db.
		Where("id = ? AND user_id = ?", applicationID, userID).
		First(&application).Error; err != nil {
		return nil, errors.New("application not found")
	}

	note := &models.Note{
		ApplicationID: applicationID,
		UserID:        userID,
		Content:       input.Content,
	}

	if err := s.db.Create(note).Error; err != nil {
		return nil, errors.New("failed to create note")
	}

	return note, nil
}

// Update modifies the content of an existing note.
// Returns an error if the note does not belong to the given user.
func (s *NoteService) Update(id, userID uint, input *UpdateNoteInput) (*models.Note, error) {
	var note models.Note
	if err := s.db.
		Where("id = ? AND user_id = ?", id, userID).
		First(&note).Error; err != nil {
		return nil, errors.New("note not found")
	}

	if err := s.db.Model(&note).Update("content", input.Content).Error; err != nil {
		return nil, errors.New("failed to update note")
	}

	return &note, nil
}

// Delete soft-deletes a note by ID.
// Returns an error if the note does not belong to the given user.
func (s *NoteService) Delete(id, userID uint) error {
	result := s.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Note{})
	if result.Error != nil {
		return errors.New("failed to delete note")
	}
	if result.RowsAffected == 0 {
		return errors.New("note not found")
	}
	return nil
}

// CreateNoteInput holds validated data for creating a new note.
type CreateNoteInput struct {
	Content string `json:"content" binding:"required,min=1,max=5000"`
}

// UpdateNoteInput holds validated data for updating an existing note.
type UpdateNoteInput struct {
	Content string `json:"content" binding:"required,min=1,max=5000"`
}
