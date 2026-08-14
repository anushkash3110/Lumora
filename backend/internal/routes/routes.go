package routes

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/anushkasharma/lumora/internal/handlers"
	"github.com/anushkasharma/lumora/internal/repository"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, db *sql.DB) {
	// Create repository using the existing database connection.
	leadRepo := repository.NewLeadRepository(db)

	// Health check
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Lumora backend is running",
		})
	})

	// Google Sheet import
	router.POST(
		"/api/import/google-sheet",
		handlers.ImportGoogleSheet(leadRepo),
	)

	// Get all leads
	router.GET("/api/leads", func(c *gin.Context) {
		leads, err := leadRepo.GetAllLeads()

		if err != nil {
			log.Printf("GET /api/leads ERROR: %v", err)

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"leads": leads,
		})
	})
}
