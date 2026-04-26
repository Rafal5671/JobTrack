// Package handlers contains Gin HTTP handlers for JobTrack.
package handlers

import (
	"net/http"

	"jobtrack-api/services"
	"jobtrack-api/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ReminderHandler handles HTTP requests for application reminders.
type ReminderHandler struct {
	service *services.ReminderService
}

// NewReminderHandler creates a new ReminderHandler with the given database.
func NewReminderHandler(db *gorm.DB) *ReminderHandler {
	return &ReminderHandler{
		service: services.NewReminderService(db),
	}
}

// GetAll returns all reminders for a given application ordered by due date.
// GET /api/applications/:id/reminders
func (h *ReminderHandler) GetAll(c *gin.Context) {
	userID := c.GetUint("userID")

	applicationID, err := utils.ParseParamID(c, "id")
	if err != nil {
		return
	}

	reminders, err := h.service.GetAll(applicationID, userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, reminders)
}

// Create creates a new reminder attached to a job application.
// POST /api/applications/:id/reminders
func (h *ReminderHandler) Create(c *gin.Context) {
	userID := c.GetUint("userID")

	applicationID, err := utils.ParseParamID(c, "id")
	if err != nil {
		return
	}

	var input services.CreateReminderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	reminder, err := h.service.Create(applicationID, userID, &input)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusCreated, reminder, "Reminder created successfully")
}

// Update updates an existing reminder.
// PUT /api/applications/:id/reminders/:reminderID
func (h *ReminderHandler) Update(c *gin.Context) {
	userID := c.GetUint("userID")

	reminderID, err := utils.ParseParamID(c, "reminderID")
	if err != nil {
		return
	}

	var input services.UpdateReminderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	reminder, err := h.service.Update(reminderID, userID, &input)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, reminder)
}

// Delete soft-deletes a reminder by ID.
// DELETE /api/applications/:id/reminders/:reminderID
func (h *ReminderHandler) Delete(c *gin.Context) {
	userID := c.GetUint("userID")

	reminderID, err := utils.ParseParamID(c, "reminderID")
	if err != nil {
		return
	}

	if err := h.service.Delete(reminderID, userID); err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusOK, nil, "Reminder deleted successfully")
}
