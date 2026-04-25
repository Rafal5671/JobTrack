package middleware

import (
	"net/http"
	"strings"

	"jobtrack-api/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthRequired(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			utils.Error(c, http.StatusUnauthorized, "Missing or invalid token")
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			utils.Error(c, http.StatusUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			utils.Error(c, http.StatusUnauthorized, "Invalid token claims")
			c.Abort()
			return
		}

		c.Set("userID", uint(claims["user_id"].(float64)))
		c.Next()
	}
}
