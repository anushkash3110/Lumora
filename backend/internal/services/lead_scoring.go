package services

import (
	"strings"

	"github.com/anushkasharma/lumora/internal/models"
)

// CalculateOpportunityScore calculates a lead's opportunity
// score from the information already available in the lead.
func CalculateOpportunityScore(lead models.Lead) int {
	score := 0

	// Contactability
	if strings.TrimSpace(lead.Email) != "" {
		score += 20
	}

	if strings.TrimSpace(lead.Phone) != "" {
		score += 15
	}

	// Online presence
	if strings.TrimSpace(lead.Website) != "" {
		score += 15
	}

	// Identifiable contact person
	if strings.TrimSpace(lead.ContactName) != "" {
		score += 15
	}

	// Useful pitch information means we have
	// already identified a marketing opportunity.
	if strings.TrimSpace(lead.Pitch) != "" {
		score += 15
	}

	// High-value target niches for Lumora's
	// marketing/agency workflow.
	if isHighValueNiche(lead.Niche, lead.SubNiche) {
		score += 20
	}

	if score > 100 {
		score = 100
	}

	return score
}

// OpportunityLevel converts a numeric score into
// a simple qualification level for the UI.
func OpportunityLevel(score int) string {
	switch {
	case score >= 80:
		return "high"
	case score >= 50:
		return "medium"
	default:
		return "low"
	}
}

func isHighValueNiche(
	niche string,
	subNiche string,
) bool {
	value := strings.ToLower(
		strings.TrimSpace(
			niche + " " + subNiche,
		),
	)

	targetKeywords := []string{
		"healthcare",
		"hospital",
		"clinic",
		"education",
		"coaching",
		"real estate",
		"interior",
		"architecture",
		"fitness",
		"wellness",
		"beauty",
		"salon",
		"hospitality",
		"hotel",
		"professional services",
		"financial",
		"automotive",
		"events",
		"wedding",
	}

	for _, keyword := range targetKeywords {
		if strings.Contains(value, keyword) {
			return true
		}
	}

	return false
}
