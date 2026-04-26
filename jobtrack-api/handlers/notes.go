// Package handlers contains Gin HTTP handlers for JobTrack.
package handlers

import (
	"net/http"

	"jobtrack-api/services"
	"jobtrack-api/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// NoteHandler handles HTTP requests for application notes.
type NoteHandler struct {
	service *services.NoteService
}

// NewNoteHandler creates a new NoteHandler with the given database.
func NewNoteHandler(db *gorm.DB) *NoteHandler {
	return &NoteHandler{
		service: services.NewNoteService(db),
	}
}

// GetAll returns all notes for a given application.
// GET /api/applications/:id/notes
func (h *NoteHandler) GetAll(c *gin.Context) {
	userID := c.GetUint("userID")

	applicationID, err := utils.ParseParamID(c, "id")
	if err != nil {
		return
	}

	notes, err := h.service.GetAll(applicationID, userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, notes)
}

// Create creates a new note attached to a job application.
// POST /api/applications/:id/notes
func (h *NoteHandler) Create(c *gin.Context) {
	userID := c.GetUint("userID")

	applicationID, err := utils.ParseParamID(c, "id")
	if err != nil {
		return
	}

	var input services.CreateNoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	note, err := h.service.Create(applicationID, userID, &input)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusCreated, note, "Note created successfully")
}

// Update updates the content of an existing note.
// PUT /api/applications/:id/notes/:noteID
func (h *NoteHandler) Update(c *gin.Context) {
	userID := c.GetUint("userID")

	noteID, err := utils.ParseParamID(c, "noteID")
	if err != nil {
		return
	}

	var input services.UpdateNoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	note, err := h.service.Update(noteID, userID, &input)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, note)
}

// Delete soft-deletes a note by ID.
// DELETE /api/applications/:id/notes/:noteID
func (h *NoteHandler) Delete(c *gin.Context) {
	userID := c.GetUint("userID")

	noteID, err := utils.ParseParamID(c, "noteID")
	if err != nil {
		return
	}

	if err := h.service.Delete(noteID, userID); err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusOK, nil, "Note deleted successfully")
}
