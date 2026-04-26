// Package handlers contains Gin HTTP handlers for JobTrack.
package handlers

import (
	"net/http"
	"strconv"

	"jobtrack-api/models"
	"jobtrack-api/services"
	"jobtrack-api/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ApplicationHandler handles HTTP requests for job applications.
type ApplicationHandler struct {
	service *services.ApplicationService
}

// NewApplicationHandler creates a new ApplicationHandler with the given database.
func NewApplicationHandler(db *gorm.DB) *ApplicationHandler {
	return &ApplicationHandler{
		service: services.NewApplicationService(db),
	}
}

// GetAll
// GET /api/applications
// Returns all job applications for the authenticated user.
func (h *ApplicationHandler) GetAll(c *gin.Context) {
	userID := c.GetUint("userID")

	applications, err := h.service.GetAll(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, applications)
}

// GetByID
// GET /api/applications/:id
// Returns a single application with preloaded notes, contacts and reminders.
func (h *ApplicationHandler) GetByID(c *gin.Context) {
	userID := c.GetUint("userID")

	id, err := parseID(c)
	if err != nil {
		return
	}

	application, err := h.service.GetByID(id, userID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, application)
}

// Create
// POST /api/applications
// Creates a new job application for the authenticated user.
func (h *ApplicationHandler) Create(c *gin.Context) {
	userID := c.GetUint("userID")

	var input services.CreateApplicationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	application, err := h.service.Create(userID, &input)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusCreated, application, "Application created successfully")
}

// Update
// PUT /api/applications/:id
// Updates an existing application. Only provided fields are changed.
func (h *ApplicationHandler) Update(c *gin.Context) {
	userID := c.GetUint("userID")

	id, err := parseID(c)
	if err != nil {
		return
	}

	var input services.UpdateApplicationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	application, err := h.service.Update(id, userID, &input)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, application)
}

// UpdateStatus
// PATCH /api/applications/:id/status
// Updates only the status field. Used by the kanban board drag and drop.
func (h *ApplicationHandler) UpdateStatus(c *gin.Context) {
	userID := c.GetUint("userID")

	id, err := parseID(c)
	if err != nil {
		return
	}

	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	application, err := h.service.UpdateStatus(id, userID, models.ApplicationStatus(input.Status))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, application)
}

// Delete
// DELETE /api/applications/:id
// Soft-deletes an application by ID.
func (h *ApplicationHandler) Delete(c *gin.Context) {
	userID := c.GetUint("userID")

	id, err := parseID(c)
	if err != nil {
		return
	}

	if err := h.service.Delete(id, userID); err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusOK, nil, "Application deleted successfully")
}

// parseID extracts and validates the :id URL parameter.
// Writes a 400 error response and returns an error if the ID is invalid.
func parseID(c *gin.Context) (uint, error) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid ID")
		return 0, err
	}
	return uint(id), nil
}
