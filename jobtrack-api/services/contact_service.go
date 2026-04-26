// Package services contains the business logic layer for JobTrack.
package services

import (
	"errors"

	"jobtrack-api/models"

	"gorm.io/gorm"
)

// ContactService handles business logic for HR contacts.
type ContactService struct {
	db *gorm.DB
}

// NewContactService creates a new ContactService with the given database.
func NewContactService(db *gorm.DB) *ContactService {
	return &ContactService{db: db}
}

// GetAll returns all contacts belonging to the given user.
// Results are ordered by name ascending.
func (s *ContactService) GetAll(userID uint) ([]models.Contact, error) {
	var contacts []models.Contact
	if err := s.db.
		Where("user_id = ?", userID).
		Order("name ASC").
		Find(&contacts).Error; err != nil {
		return nil, errors.New("failed to fetch contacts")
	}
	return contacts, nil
}

// GetByID returns a single contact by ID.
// Returns an error if the contact does not belong to the given user.
func (s *ContactService) GetByID(id, userID uint) (*models.Contact, error) {
	var contact models.Contact
	if err := s.db.
		Preload("Applications").
		Where("id = ? AND user_id = ?", id, userID).
		First(&contact).Error; err != nil {
		return nil, errors.New("contact not found")
	}
	return &contact, nil
}

// Create saves a new contact for the given user.
func (s *ContactService) Create(userID uint, input *CreateContactInput) (*models.Contact, error) {
	contact := &models.Contact{
		UserID:   userID,
		Name:     input.Name,
		Role:     input.Role,
		Company:  input.Company,
		Email:    input.Email,
		LinkedIn: input.LinkedIn,
		Phone:    input.Phone,
		Notes:    input.Notes,
	}

	if err := s.db.Create(contact).Error; err != nil {
		return nil, errors.New("failed to create contact")
	}

	return contact, nil
}

// Update modifies an existing contact.
// Only fields provided in the input are updated.
func (s *ContactService) Update(id, userID uint, input *UpdateContactInput) (*models.Contact, error) {
	contact, err := s.GetByID(id, userID)
	if err != nil {
		return nil, err
	}

	updates := map[string]any{}

	if input.Name != "" {
		updates["name"] = input.Name
	}
	if input.Role != "" {
		updates["role"] = input.Role
	}
	if input.Company != "" {
		updates["company"] = input.Company
	}
	if input.Email != "" {
		updates["email"] = input.Email
	}
	if input.LinkedIn != "" {
		updates["linkedin"] = input.LinkedIn
	}
	if input.Phone != "" {
		updates["phone"] = input.Phone
	}
	if input.Notes != "" {
		updates["notes"] = input.Notes
	}

	if err := s.db.Model(contact).Updates(updates).Error; err != nil {
		return nil, errors.New("failed to update contact")
	}

	return contact, nil
}

// Delete soft-deletes a contact by ID.
// Returns an error if the contact does not belong to the given user.
func (s *ContactService) Delete(id, userID uint) error {
	result := s.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Contact{})
	if result.Error != nil {
		return errors.New("failed to delete contact")
	}
	if result.RowsAffected == 0 {
		return errors.New("contact not found")
	}
	return nil
}

// LinkToApplication creates a many-to-many association
// between a contact and a job application.
func (s *ContactService) LinkToApplication(contactID, applicationID, userID uint) error {
	contact, err := s.GetByID(contactID, userID)
	if err != nil {
		return err
	}

	var application models.Application
	if err := s.db.
		Where("id = ? AND user_id = ?", applicationID, userID).
		First(&application).Error; err != nil {
		return errors.New("application not found")
	}

	if err := s.db.Model(contact).Association("Applications").Append(&application); err != nil {
		return errors.New("failed to link contact to application")
	}

	return nil
}

// UnlinkFromApplication removes the many-to-many association
// between a contact and a job application.
func (s *ContactService) UnlinkFromApplication(contactID, applicationID, userID uint) error {
	contact, err := s.GetByID(contactID, userID)
	if err != nil {
		return err
	}

	var application models.Application
	if err := s.db.
		Where("id = ? AND user_id = ?", applicationID, userID).
		First(&application).Error; err != nil {
		return errors.New("application not found")
	}

	if err := s.db.Model(contact).Association("Applications").Delete(&application); err != nil {
		return errors.New("failed to unlink contact from application")
	}

	return nil
}

// CreateContactInput holds validated data for creating a new contact.
type CreateContactInput struct {
	Name     string `json:"name" binding:"required"`
	Role     string `json:"role"`
	Company  string `json:"company"`
	Email    string `json:"email"`
	LinkedIn string `json:"linkedin"`
	Phone    string `json:"phone"`
	Notes    string `json:"notes"`
}

// UpdateContactInput holds validated data for updating an existing contact.
// All fields are optional — only non-zero values are applied.
type UpdateContactInput struct {
	Name     string `json:"name"`
	Role     string `json:"role"`
	Company  string `json:"company"`
	Email    string `json:"email"`
	LinkedIn string `json:"linkedin"`
	Phone    string `json:"phone"`
	Notes    string `json:"notes"`
}
