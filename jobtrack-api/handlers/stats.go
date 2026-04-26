// Package handlers contains Gin HTTP handlers for JobTrack.
package handlers

import (
	"net/http"

	"jobtrack-api/services"
	"jobtrack-api/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// StatsHandler handles HTTP requests for dashboard statistics.
type StatsHandler struct {
	service *services.StatsService
}

// NewStatsHandler creates a new StatsHandler with the given database.
func NewStatsHandler(db *gorm.DB) *StatsHandler {
	return &StatsHandler{
		service: services.NewStatsService(db),
	}
}

// GetStats returns aggregated statistics for the authenticated user.
// Includes total count, breakdown by status, weekly activity and conversion rates.
// GET /api/stats
func (h *StatsHandler) GetStats(c *gin.Context) {
	userID := c.GetUint("userID")

	stats, err := h.service.GetStats(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, stats)
}
