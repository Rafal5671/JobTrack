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
	applicationHandler := handlers.NewApplicationHandler(db)
	contactHandler := handlers.NewContactHandler(db)

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

		// Protected routes – require valid JWT
		protected := api.Group("/")
		protected.Use(middleware.AuthRequired(jwtSecret))
		{
			// Application routes
			applications := protected.Group("/applications")
			{
				applications.GET("", applicationHandler.GetAll)
				applications.GET("/:id", applicationHandler.GetByID)
				applications.POST("", applicationHandler.Create)
				applications.PUT("/:id", applicationHandler.Update)
				applications.PATCH("/:id/status", applicationHandler.UpdateStatus)
				applications.DELETE("/:id", applicationHandler.Delete)
			}

			// Contact routes
			contacts := protected.Group("/contacts")
			{
				contacts.GET("", contactHandler.GetAll)
				contacts.GET("/:id", contactHandler.GetByID)
				contacts.POST("", contactHandler.Create)
				contacts.PUT("/:id", contactHandler.Update)
				contacts.DELETE("/:id", contactHandler.Delete)
				contacts.POST("/:id/applications/:applicationID", contactHandler.LinkToApplication)
				contacts.DELETE("/:id/applications/:applicationID", contactHandler.UnlinkFromApplication)
			}

		}
	}

	return r
}
