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

func RegisterRoutes(
	router *gin.Engine,
	db *sql.DB,
) {
	leadRepo :=
		repository.NewLeadRepository(db)

	// --------------------------------------------------
	// HEALTH CHECK
	// --------------------------------------------------

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message":
				"Lumora backend is running",
		})
	})

	// --------------------------------------------------
	// GOOGLE SHEET IMPORT
	// --------------------------------------------------

	router.POST(
		"/api/import/google-sheet",
		handlers.ImportGoogleSheet(
			leadRepo,
		),
	)

	// --------------------------------------------------
	// GET ALL LEADS
	// --------------------------------------------------

	router.GET(
		"/api/leads",
		func(c *gin.Context) {

			leads, err :=
				leadRepo.GetAllLeads()

			if err != nil {
				log.Printf(
					"GET /api/leads ERROR: %v",
					err,
				)

				c.JSON(
					http.StatusInternalServerError,
					gin.H{
						"error":
							"failed to fetch leads",
					},
				)

				return
			}

			c.JSON(
				http.StatusOK,
				gin.H{
					"leads": leads,
				},
			)
		},
	)

	// --------------------------------------------------
	// UPDATE LEAD STATUS
	// --------------------------------------------------

	router.PATCH(
		"/api/leads/:id/status",
		func(c *gin.Context) {

			id, err :=
				strconv.ParseInt(
					c.Param("id"),
					10,
					64,
				)

			if err != nil {

				c.JSON(
					http.StatusBadRequest,
					gin.H{
						"error":
							"invalid lead id",
					},
				)

				return
			}

			var request struct {
				Status string `json:"status" binding:"required"`
			}

			if err :=
				c.ShouldBindJSON(&request);
				err != nil {

				c.JSON(
					http.StatusBadRequest,
					gin.H{
						"error":
							"status is required",
					},
				)

				return
			}

			status :=
				strings.ToLower(
					strings.TrimSpace(
						request.Status,
					),
				)

			switch status {
			case "new",
				"contacted",
				"interested",
				"converted",
				"lost":
			default:

				c.JSON(
					http.StatusBadRequest,
					gin.H{
						"error":
							"invalid status",
					},
				)

				return
			}

			err =
				leadRepo.UpdateLeadStatus(
					int(id),
					status,
				)

			if err != nil {

				if err ==
					sql.ErrNoRows {

					c.JSON(
						http.StatusNotFound,
						gin.H{
							"error":
								"lead not found",
						},
					)

					return
				}

				log.Printf(
					"PATCH /api/leads/%d/status ERROR: %v",
					id,
					err,
				)

				c.JSON(
					http.StatusInternalServerError,
					gin.H{
						"error":
							"failed to update lead status",
					},
				)

				return
			}

			c.JSON(
				http.StatusOK,
				gin.H{
					"message":
						"Lead status updated successfully",
					"status": status,
				},
			)
		},
	)

	// --------------------------------------------------
	// UPDATE NOTES + FOLLOW-UP
	// --------------------------------------------------

	router.PATCH(
		"/api/leads/:id/details",
		func(c *gin.Context) {

			id, err :=
				strconv.ParseInt(
					c.Param("id"),
					10,
					64,
				)

			if err != nil {

				c.JSON(
					http.StatusBadRequest,
					gin.H{
						"error":
							"invalid lead id",
					},
				)

				return
			}

			var request struct {
				Notes        string `json:"notes"`
				FollowUpDate string `json:"followUpDate"`
			}

			if err :=
				c.ShouldBindJSON(&request);
				err != nil {

				c.JSON(
					http.StatusBadRequest,
					gin.H{
						"error":
							"invalid request",
					},
				)

				return
			}

			err =
				leadRepo.UpdateLeadDetails(
					id,
					request.Notes,
					request.FollowUpDate,
				)

			if err != nil {

				if err ==
					sql.ErrNoRows {

					c.JSON(
						http.StatusNotFound,
						gin.H{
							"error":
								"lead not found",
						},
					)

					return
				}

				log.Printf(
					"PATCH /api/leads/%d/details ERROR: %v",
					id,
					err,
				)

				c.JSON(
					http.StatusInternalServerError,
					gin.H{
						"error":
							"failed to update lead details",
					},
				)

				return
			}

			c.JSON(
				http.StatusOK,
				gin.H{
					"message":
						"Lead details updated successfully",
				},
			)
		},
	)

	// --------------------------------------------------
	// RECALCULATE ALL LEAD SCORES
	// --------------------------------------------------

	router.POST(
		"/api/leads/recalculate-scores",
		func(c *gin.Context) {

			updated, err :=
				leadRepo.
					RecalculateAllOpportunityScores()

			if err != nil {

				log.Printf(
					"POST /api/leads/recalculate-scores ERROR: %v",
					err,
				)

				c.JSON(
					http.StatusInternalServerError,
					gin.H{
						"error":
							"failed to recalculate lead scores",
					},
				)

				return
			}

			c.JSON(
				http.StatusOK,
				gin.H{
					"message":
						"Lead scores recalculated successfully",
					"updated":
						updated,
				},
			)
		},
	)

	// --------------------------------------------------
	// RECALCULATE ONE LEAD SCORE
	// --------------------------------------------------

	router.POST(
		"/api/leads/:id/recalculate-score",
		func(c *gin.Context) {

			id, err :=
				strconv.ParseInt(
					c.Param("id"),
					10,
					64,
				)

			if err != nil {

				c.JSON(
					http.StatusBadRequest,
					gin.H{
						"error":
							"invalid lead id",
					},
				)

				return
			}

			score, err :=
				leadRepo.UpdateLeadScore(id)

			if err != nil {

				if err ==
					sql.ErrNoRows {

					c.JSON(
						http.StatusNotFound,
						gin.H{
							"error":
								"lead not found",
						},
					)

					return
				}

				log.Printf(
					"POST /api/leads/%d/recalculate-score ERROR: %v",
					id,
					err,
				)

				c.JSON(
					http.StatusInternalServerError,
					gin.H{
						"error":
							"failed to calculate lead score",
					},
				)

				return
			}

			level := "low"

			switch {
			case score >= 80:
				level = "high"
			case score >= 50:
				level = "medium"
			}

			c.JSON(
				http.StatusOK,
				gin.H{
					"message":
						"Lead score calculated successfully",
					"score": score,
					"level": level,
				},
			)
		},
	)
}