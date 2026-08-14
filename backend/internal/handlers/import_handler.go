package handlers

import (
	"net/http"
	"strings"

	"github.com/anushkasharma/lumora/internal/models"
	"github.com/anushkasharma/lumora/internal/repository"
	"github.com/anushkasharma/lumora/internal/services"

	"github.com/gin-gonic/gin"
)

type ImportRequest struct {
	SheetURL string `json:"sheetUrl" binding:"required"`
}

func ImportGoogleSheet(
	repo *repository.LeadRepository,
) gin.HandlerFunc {

	return func(c *gin.Context) {

		var request ImportRequest

		// Validate request
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "sheetUrl is required",
			})
			return
		}

		// Fetch Google Sheet
		rows, err := services.FetchGoogleSheetRows(request.SheetURL)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		// Need at least headers + one data row
		if len(rows) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Google Sheet contains no lead data",
			})
			return
		}

		// First row = headers
		headers := rows[0]

		headerIndex := make(map[string]int)

		for i, header := range headers {
			headerIndex[normalizeHeader(header)] = i
		}

		imported := 0
		skipped := 0

		// Process rows
		for _, row := range rows[1:] {

			// Ignore completely empty/template rows
			if isEmptyRow(row) {
				skipped++
				continue
			}

			company := getCell(
				row,
				headerIndex,
				"business potential client",
				"business",
				"company",
				"company name",
			)

			// Business name is required
			if strings.TrimSpace(company) == "" {
				skipped++
				continue
			}

			lead := models.Lead{
				Niche: getCell(
					row,
					headerIndex,
					"niche",
				),

				CompanyName: company,

				SubNiche: getCell(
					row,
					headerIndex,
					"sub niche",
				),

				Area: getCell(
					row,
					headerIndex,
					"area bhopal",
					"area",
					"location",
					"city",
				),

				ContactName: getCell(
					row,
					headerIndex,
					"contact person",
					"contact name",
				),

				Phone: getCell(
					row,
					headerIndex,
					"phone",
					"phone number",
					"mobile",
				),

				Email: getCell(
					row,
					headerIndex,
					"email",
					"email id",
				),

				Website: getCell(
					row,
					headerIndex,
					"website",
					"website url",
				),

				Pitch: getCell(
					row,
					headerIndex,
					"what waxa can pitch",
					"what lumora can pitch",
					"pitch",
				),

				MailStatus: getCell(
					row,
					headerIndex,
					"mail status",
					"email status",
				),

				Source: "google_sheet",

				Status: "new",

				OpportunityScore: 0,
			}

			// Default mail status
			if lead.MailStatus == "" {
				lead.MailStatus = "Not Sent"
			}

			// CreateLead now returns:
			// inserted bool
			// error
			inserted, err := repo.CreateLead(lead)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "failed to save lead",
				})
				return
			}

			if inserted {
				imported++
			} else {
				// Duplicate lead
				skipped++
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"message":  "Google Sheet imported successfully",
			"imported": imported,
			"skipped":  skipped,
		})
	}
}

// getCell safely gets a value from a row using possible header names.
func getCell(
	row []string,
	headers map[string]int,
	keys ...string,
) string {

	for _, key := range keys {

		index, exists := headers[normalizeHeader(key)]

		if !exists {
			continue
		}

		if index >= len(row) {
			continue
		}

		return strings.TrimSpace(row[index])
	}

	return ""
}

// isEmptyRow identifies completely empty spreadsheet/template rows.
//
// Google Sheets may return FALSE/TRUE for checkbox columns
// even when the actual row contains no lead information.
func isEmptyRow(row []string) bool {

	for _, value := range row {

		value = strings.TrimSpace(value)

		if value == "" {
			continue
		}

		if value == "FALSE" || value == "TRUE" {
			continue
		}

		return false
	}

	return true
}

// normalizeHeader makes different header formats comparable.
//
// Example:
// "Area, Bhopal"
// "Area Bhopal"
// "area_bhopal"
// "AREA-BHOPAL"
//
// all become:
// "area bhopal"
func normalizeHeader(value string) string {

	value = strings.TrimSpace(value)
	value = strings.ToLower(value)

	value = strings.ReplaceAll(value, "/", " ")
	value = strings.ReplaceAll(value, "_", " ")
	value = strings.ReplaceAll(value, "-", " ")
	value = strings.ReplaceAll(value, ",", " ")

	return strings.Join(strings.Fields(value), " ")
}
