// Package handlers contains Gin HTTP handlers for JobTrack.
package handlers

import (
	"net/http"

	"jobtrack-api/services"
	"jobtrack-api/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ContactHandler handles HTTP requests for HR contacts.
type ContactHandler struct {
	service *services.ContactService
}

// NewContactHandler creates a new ContactHandler with the given database.
func NewContactHandler(db *gorm.DB) *ContactHandler {
	return &ContactHandler{
		service: services.NewContactService(db),
	}
}

// GetAll returns all contacts for the authenticated user ordered by name.
// GET /api/contacts
func (h *ContactHandler) GetAll(c *gin.Context) {
	userID := c.GetUint("userID")

	contacts, err := h.service.GetAll(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, contacts)
}

// GetByID returns a single contact with preloaded applications.
// GET /api/contacts/:id
func (h *ContactHandler) GetByID(c *gin.Context) {
	userID := c.GetUint("userID")

	id, err := parseID(c)
	if err != nil {
		return
	}

	contact, err := h.service.GetByID(id, userID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, contact)
}

// Create creates a new HR contact for the authenticated user.
// POST /api/contacts
func (h *ContactHandler) Create(c *gin.Context) {
	userID := c.GetUint("userID")

	var input services.CreateContactInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	contact, err := h.service.Create(userID, &input)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusCreated, contact, "Contact created successfully")
}

// Update updates an existing contact. Only provided fields are changed.
// PUT /api/contacts/:id
func (h *ContactHandler) Update(c *gin.Context) {
	userID := c.GetUint("userID")

	id, err := parseID(c)
	if err != nil {
		return
	}

	var input services.UpdateContactInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	contact, err := h.service.Update(id, userID, &input)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, contact)
}

// Delete soft-deletes a contact by ID.
// DELETE /api/contacts/:id
func (h *ContactHandler) Delete(c *gin.Context) {
	userID := c.GetUint("userID")

	id, err := parseID(c)
	if err != nil {
		return
	}

	if err := h.service.Delete(id, userID); err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusOK, nil, "Contact deleted successfully")
}

// LinkToApplication creates a many-to-many link between a contact and a job application.
// POST /api/contacts/:id/applications/:applicationID
func (h *ContactHandler) LinkToApplication(c *gin.Context) {
	userID := c.GetUint("userID")

	contactID, err := parseID(c)
	if err != nil {
		return
	}

	applicationID, err := utils.ParseParamID(c, "applicationID")
	if err != nil {
		return
	}

	if err := h.service.LinkToApplication(contactID, applicationID, userID); err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusOK, nil, "Contact linked to application")
}

// UnlinkFromApplication removes the many-to-many link between a contact and a job application.
// DELETE /api/contacts/:id/applications/:applicationID
func (h *ContactHandler) UnlinkFromApplication(c *gin.Context) {
	userID := c.GetUint("userID")

	contactID, err := parseID(c)
	if err != nil {
		return
	}

	applicationID, err := utils.ParseParamID(c, "applicationID")
	if err != nil {
		return
	}

	if err := h.service.UnlinkFromApplication(contactID, applicationID, userID); err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusOK, nil, "Contact unlinked from application")
}
