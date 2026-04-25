package utils

import "github.com/gin-gonic/gin"

type SuccessResponse struct {
	Data    any    `json:"data"`
	Message string `json:"message,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func Success(c *gin.Context, status int, data any) {
	c.JSON(status, SuccessResponse{Data: data})
}

func SuccessMessage(c *gin.Context, status int, data any, message string) {
	c.JSON(status, SuccessResponse{Data: data, Message: message})
}

func Error(c *gin.Context, status int, message string) {
	c.JSON(status, ErrorResponse{Error: message})
}
