// Package services contains the business logic layer for JobTrack.
package services

import (
	"errors"

	"jobtrack-api/models"

	"gorm.io/gorm"
)

// StatsService handles business logic for dashboard statistics.
type StatsService struct {
	db *gorm.DB
}

// NewStatsService creates a new StatsService with the given database.
func NewStatsService(db *gorm.DB) *StatsService {
	return &StatsService{db: db}
}

// StatusCount holds the count of applications for a single status.
type StatusCount struct {
	Status models.ApplicationStatus `json:"status"`
	Count  int64                    `json:"count"`
}

// WeeklyCount holds the count of applications created in a single week.
type WeeklyCount struct {
	Week  string `json:"week"`
	Count int64  `json:"count"`
}

// StatsResult holds all aggregated statistics for the dashboard.
type StatsResult struct {
	Total        int64         `json:"total"`
	ByStatus     []StatusCount `json:"by_status"`
	Weekly       []WeeklyCount `json:"weekly"`
	ResponseRate float64       `json:"response_rate"`
	OfferRate    float64       `json:"offer_rate"`
}

// GetStats returns aggregated statistics for the authenticated user.
// Includes total count, breakdown by status, weekly activity
// and conversion rates for the funnel chart.
func (s *StatsService) GetStats(userID uint) (*StatsResult, error) {
	var total int64
	if err := s.db.Model(&models.Application{}).
		Where("user_id = ?", userID).
		Count(&total).Error; err != nil {
		return nil, errors.New("failed to count applications")
	}

	// Count applications grouped by status.
	var byStatus []StatusCount
	if err := s.db.Model(&models.Application{}).
		Select("status, COUNT(*) as count").
		Where("user_id = ?", userID).
		Group("status").
		Scan(&byStatus).Error; err != nil {
		return nil, errors.New("failed to fetch status breakdown")
	}

	// Count applications created per week for the last 8 weeks.
	var weekly []WeeklyCount
	if err := s.db.Model(&models.Application{}).
		Select("TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') as week, COUNT(*) as count").
		Where("user_id = ? AND created_at >= NOW() - INTERVAL '8 weeks'", userID).
		Group("week").
		Order("week ASC").
		Scan(&weekly).Error; err != nil {
		return nil, errors.New("failed to fetch weekly breakdown")
	}

	// Calculate response rate: applications that moved past applied stage.
	responseRate := calculateRate(byStatus, total, []models.ApplicationStatus{
		models.StatusScreening,
		models.StatusInterview,
		models.StatusOffer,
	})

	// Calculate offer rate: applications that reached offer stage.
	offerRate := calculateRate(byStatus, total, []models.ApplicationStatus{
		models.StatusOffer,
	})

	return &StatsResult{
		Total:        total,
		ByStatus:     byStatus,
		Weekly:       weekly,
		ResponseRate: responseRate,
		OfferRate:    offerRate,
	}, nil
}

// calculateRate returns the percentage of applications matching any of the given statuses.
// Returns 0 if total is 0 to avoid division by zero.
func calculateRate(byStatus []StatusCount, total int64, statuses []models.ApplicationStatus) float64 {
	if total == 0 {
		return 0
	}

	var count int64
	for _, s := range byStatus {
		for _, status := range statuses {
			if s.Status == status {
				count += s.Count
			}
		}
	}

	return float64(count) / float64(total) * 100
}
