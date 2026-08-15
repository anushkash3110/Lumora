package routes

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/anushkasharma/lumora/internal/handlers"
	"github.com/anushkasharma/lumora/internal/repository"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, db *sql.DB) {
	// Create repository using the existing database connection.
	leadRepo := repository.NewLeadRepository(db)

	// --------------------------------------------------
	// Health check
	// --------------------------------------------------
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Lumora backend is running",
		})
	})

	// --------------------------------------------------
	// Google Sheet import
	// --------------------------------------------------
	router.POST(
		"/api/import/google-sheet",
		handlers.ImportGoogleSheet(leadRepo),
	)

	// --------------------------------------------------
	// Get all leads
	// --------------------------------------------------
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

	// --------------------------------------------------
	// Update lead status
	// --------------------------------------------------
	router.PATCH("/api/leads/:id/status", func(c *gin.Context) {

		id, err := strconv.Atoi(c.Param("id"))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid lead id",
			})
			return
		}

		var request struct {
			Status string `json:"status" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "status is required",
			})
			return
		}

		status := strings.ToLower(strings.TrimSpace(request.Status))

		// Validate allowed CRM statuses.
		switch status {
		case "new":
		case "contacted":
		case "interested":
		case "converted":
		case "lost":
		default:
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid status",
			})
			return
		}

		err = leadRepo.UpdateLeadStatus(id, status)

		if err != nil {

			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "lead not found",
				})
				return
			}

			log.Printf(
				"PATCH /api/leads/%d/status ERROR: %v",
				id,
				err,
			)

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to update lead status",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Lead status updated successfully",
			"status":  status,
		})
	})
}
