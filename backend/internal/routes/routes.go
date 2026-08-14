package routes

import (
	"database/sql"
	"net/http"

	"github.com/anushkasharma/lumora/internal/handlers"
	"github.com/anushkasharma/lumora/internal/repository"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(
	router *gin.Engine,
	db *sql.DB,
) {

	leadRepository := repository.NewLeadRepository(db)

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Lumora backend is running",
		})
	})

	api := router.Group("/api")

	api.POST(
		"/import/google-sheet",
		handlers.ImportGoogleSheet(leadRepository),
	)

	api.GET("/leads", func(c *gin.Context) {

		leads, err := leadRepository.GetAllLeads()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to fetch leads",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"leads": leads,
		})
	})
}
