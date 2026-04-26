// Package utils provides shared helper functions used across handlers.
package utils

import "github.com/gin-gonic/gin"

// SuccessResponse is the standard envelope for successful API responses.
type SuccessResponse struct {
	Data    any    `json:"data"`
	Message string `json:"message,omitempty"`
}

// ErrorResponse is the standard envelope for failed API responses.
type ErrorResponse struct {
	Error string `json:"error"`
}

// Success writes a JSON response with the given status code and data payload.
func Success(c *gin.Context, status int, data any) {
	c.JSON(status, SuccessResponse{Data: data})
}

// SuccessMessage writes a JSON response with a data payload and a human-readable message.
func SuccessMessage(c *gin.Context, status int, data any, message string) {
	c.JSON(status, SuccessResponse{Data: data, Message: message})
}

// Error writes a JSON error response with the given status code and message.
func Error(c *gin.Context, status int, message string) {
	c.JSON(status, ErrorResponse{Error: message})
}
