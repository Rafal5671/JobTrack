package router

import (
	"jobtrack-api/handlers"
	"jobtrack-api/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(jwtSecret string, db *gorm.DB) *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORS())

	authHandler := handlers.NewAuthHandler(db, jwtSecret)

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthRequired(jwtSecret), authHandler.Me)
		}
	}

	return r
}
