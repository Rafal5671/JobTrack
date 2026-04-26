// Package services contains the business logic layer for JobTrack.
// Handlers delegate all non-HTTP work to services.
package services

import (
	"errors"
	"time"

	"jobtrack-api/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthService handles user registration, login and JWT token generation.
type AuthService struct {
	db        *gorm.DB
	jwtSecret string
}

// NewAuthService creates a new AuthService with the given database and JWT secret.
func NewAuthService(db *gorm.DB, jwtSecret string) *AuthService {
	return &AuthService{db: db, jwtSecret: jwtSecret}
}

// Register creates a new user account after validating that the email is not taken.
// The password is hashed with bcrypt before being stored.
func (s *AuthService) Register(name, email, password string) (*models.User, error) {
	var existing models.User
	if err := s.db.Where("email = ?", email).First(&existing).Error; err == nil {
		return nil, errors.New("email already in use")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashed),
	}

	if err := s.db.Create(user).Error; err != nil {
		return nil, errors.New("failed to create user")
	}

	return user, nil
}

// Login verifies the user credentials and returns the user along with a signed JWT token.
// A generic error message is returned for both wrong email and wrong password
// to prevent email enumeration attacks.
func (s *AuthService) Login(email, password string) (*models.User, string, error) {
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	token, err := s.generateToken(user.ID)
	if err != nil {
		return nil, "", errors.New("failed to generate token")
	}

	return &user, token, nil
}

// GetUserByID fetches a user by ID and scans the result into dest.
// dest should be a pointer to a struct with the desired fields.
func (s *AuthService) generateToken(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

// generateToken creates a signed HS256 JWT token containing the user ID.
// The token expires after 24 hours.
func (s *AuthService) GetUserByID(id uint, dest any) error {
	return s.db.Model(&models.User{}).Where("id = ?", id).First(dest).Error
}
