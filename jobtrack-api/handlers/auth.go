// Package handlers contains Gin HTTP handlers for JobTrack.
package handlers

import (
	"net/http"

	"jobtrack-api/services"
	"jobtrack-api/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AuthHandler handles HTTP requests for user authentication.
type AuthHandler struct {
	service *services.AuthService
	db      *gorm.DB
}

// NewAuthHandler creates a new AuthHandler with the given database and JWT secret.
func NewAuthHandler(db *gorm.DB, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		service: services.NewAuthService(db, jwtSecret),
		db:      db,
	}
}

// registerRequest holds the validated fields for a registration request.
type registerRequest struct {
	FirstName string `json:"first_name" binding:"required,min=2,max=50"`
	LastName  string `json:"last_name" binding:"required,min=2,max=50"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8,max=72"`
}

// loginRequest holds the validated fields for a login request.
type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register creates a new user account.
// POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.service.Register(req.FirstName, req.LastName, req.Email, req.Password)
	if err != nil {
		utils.Error(c, http.StatusConflict, err.Error())
		return
	}

	utils.SuccessMessage(c, http.StatusCreated, user, "Account created successfully")
}

// Login authenticates a user and returns a signed JWT token.
// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	user, token, err := h.service.Login(req.Email, req.Password)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

// Me returns the currently authenticated user's profile.
// GET /api/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetUint("userID")

	var user struct {
		ID    uint   `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	authService := services.NewAuthService(h.db, "")
	if err := authService.GetUserByID(userID, &user); err != nil {
		utils.Error(c, http.StatusNotFound, "User not found")
		return
	}

	utils.Success(c, http.StatusOK, user)
}
