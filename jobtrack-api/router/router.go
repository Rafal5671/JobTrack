// Package router configures the Gin HTTP router with all application routes
// and middleware for JobTrack.
package router

import (
	"jobtrack-api/handlers"
	"jobtrack-api/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Setup creates and returns a configured Gin engine with all routes registered.
// All protected routes require a valid JWT token via the AuthRequired middleware.
func Setup(jwtSecret string, db *gorm.DB) *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORS())

	authHandler := handlers.NewAuthHandler(db, jwtSecret)

	api := r.Group("/api")
	{
		// Auth routes – public
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)

			// Protected – requires valid JWT
			auth.GET("/me", middleware.AuthRequired(jwtSecret), authHandler.Me)
		}
	}

	return r
}
