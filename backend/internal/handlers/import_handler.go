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

		// -----------------------------
		// Validate request
		// -----------------------------
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "sheetUrl is required",
			})
			return
		}

		request.SheetURL = strings.TrimSpace(request.SheetURL)

		if request.SheetURL == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "sheetUrl is required",
			})
			return
		}

		// -----------------------------
		// Fetch Google Sheet
		// -----------------------------
		rows, err := services.FetchGoogleSheetRows(request.SheetURL)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		if len(rows) < 2 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Google Sheet contains no lead data",
			})
			return
		}

		// -----------------------------
		// Build header map
		// -----------------------------
		headers := rows[0]

		headerIndex := make(map[string]int)

		for i, header := range headers {
			normalized := normalizeHeader(header)

			if normalized == "" {
				continue
			}

			headerIndex[normalized] = i
		}

		// -----------------------------
		// Validate that the sheet has
		// at least one recognizable
		// lead/company column.
		// -----------------------------
		if !hasAnyHeader(
			headerIndex,
			"business potential client",
			"business",
			"company",
			"company name",
			"business name",
			"client",
			"organization",
			"organisation",
		) {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Could not find a business/company column in this Google Sheet",
			})
			return
		}

		imported := 0
		skipped := 0

		// -----------------------------
		// Process every data row
		// -----------------------------
		for _, row := range rows[1:] {

			// Ignore completely empty/template rows.
			if isEmptyRow(row) {
				skipped++
				continue
			}

			company := getCell(
				row,
				headerIndex,
				"business potential client",
				"business name",
				"business",
				"company name",
				"company",
				"client",
				"organization",
				"organisation",
			)

			company = cleanValue(company)

			// Business name is required.
			if company == "" {
				skipped++
				continue
			}

			lead := models.Lead{
				Niche: getCell(
					row,
					headerIndex,
					"niche",
					"category",
					"industry",
					"business category",
				),

				CompanyName: company,

				SubNiche: getCell(
					row,
					headerIndex,
					"sub niche",
					"subniche",
					"subcategory",
					"sub category",
				),

				Area: getCell(
					row,
					headerIndex,
					"area bhopal",
					"area",
					"location",
					"city",
					"address",
					"locality",
				),

				ContactName: getCell(
					row,
					headerIndex,
					"contact person",
					"contact name",
					"contact",
					"person",
					"owner",
					"owner name",
					"decision maker",
				),

				Phone: getCell(
					row,
					headerIndex,
					"phone",
					"phone number",
					"mobile",
					"mobile number",
					"contact number",
					"telephone",
				),

				Email: getCell(
					row,
					headerIndex,
					"email",
					"email id",
					"email address",
					"mail",
				),

				Website: getCell(
					row,
					headerIndex,
					"website",
					"website url",
					"website link",
					"url",
					"web",
				),

				Pitch: getCell(
					row,
					headerIndex,
					"what waxa can pitch",
					"what lumora can pitch",
					"what can lumora pitch",
					"pitch",
					"marketing pitch",
					"suggested pitch",
				),

				MailStatus: getCell(
					row,
					headerIndex,
					"mail status",
					"email status",
					"email sent",
					"mail sent",
				),

				Source: "google_sheet",

				Status: "new",

				OpportunityScore: 0,
			}

			// Clean all imported values.
			lead.Niche = cleanValue(lead.Niche)
			lead.SubNiche = cleanValue(lead.SubNiche)
			lead.Area = cleanValue(lead.Area)
			lead.ContactName = cleanValue(lead.ContactName)
			lead.Phone = cleanValue(lead.Phone)
			lead.Email = cleanValue(lead.Email)
			lead.Website = cleanValue(lead.Website)
			lead.Pitch = cleanValue(lead.Pitch)
			lead.MailStatus = cleanValue(lead.MailStatus)

			// Default mail status.
			if lead.MailStatus == "" {
				lead.MailStatus = "Not Sent"
			}

			// -----------------------------
			// Save lead
			// -----------------------------
			inserted, err := repo.CreateLead(lead)

			if err != nil {
				// IMPORTANT:
				// Do not kill the entire import because
				// one row failed.
				skipped++
				continue
			}

			if inserted {
				imported++
			} else {
				// Duplicate lead.
				skipped++
			}
		}

		// -----------------------------
		// Final response
		// -----------------------------
		c.JSON(http.StatusOK, gin.H{
			"message":  "Google Sheet imported successfully",
			"imported": imported,
			"skipped":  skipped,
		})
	}
}

// --------------------------------------
// Get cell using multiple possible headers
// --------------------------------------
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

		if index < 0 || index >= len(row) {
			continue
		}

		value := strings.TrimSpace(row[index])

		if value != "" {
			return value
		}
	}

	return ""
}

// --------------------------------------
// Check whether at least one known header
// exists.
// --------------------------------------
func hasAnyHeader(
	headers map[string]int,
	keys ...string,
) bool {

	for _, key := range keys {
		if _, exists := headers[normalizeHeader(key)]; exists {
			return true
		}
	}

	return false
}

// --------------------------------------
// Detect completely empty/template rows
// --------------------------------------
func isEmptyRow(row []string) bool {

	for _, value := range row {

		value = strings.TrimSpace(value)

		if value == "" {
			continue
		}

		// Ignore checkbox/template values.
		if strings.EqualFold(value, "FALSE") ||
			strings.EqualFold(value, "TRUE") {
			continue
		}

		return false
	}

	return true
}

// --------------------------------------
// Clean imported values
// --------------------------------------
func cleanValue(value string) string {

	value = strings.TrimSpace(value)

	if value == "" {
		return ""
	}

	// Treat common spreadsheet placeholders as empty.
	switch strings.ToLower(value) {
	case "null":
		return ""

	case "n/a":
		return ""

	case "na":
		return ""

	case "-":
		return ""
	}

	return value
}

// --------------------------------------
// Normalize spreadsheet headers
// --------------------------------------
func normalizeHeader(value string) string {

	value = strings.TrimSpace(value)
	value = strings.ToLower(value)

	value = strings.ReplaceAll(value, "/", " ")
	value = strings.ReplaceAll(value, "_", " ")
	value = strings.ReplaceAll(value, "-", " ")
	value = strings.ReplaceAll(value, ",", " ")
	value = strings.ReplaceAll(value, ".", " ")

	return strings.Join(strings.Fields(value), " ")
}