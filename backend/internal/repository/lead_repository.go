package repository

import (
	"database/sql"
	"strings"

	"github.com/anushkasharma/lumora/internal/models"
	"github.com/anushkasharma/lumora/internal/services"
)

type LeadRepository struct {
	DB *sql.DB
}

func NewLeadRepository(db *sql.DB) *LeadRepository {
	return &LeadRepository{
		DB: db,
	}
}

// CreateLead inserts a lead into PostgreSQL.
//
// The opportunity score is calculated automatically before insertion.
//
// Returns:
// true  -> new lead inserted
// false -> duplicate lead, so it was ignored
func (r *LeadRepository) CreateLead(
	lead models.Lead,
) (bool, error) {

	// Calculate the score automatically.
	lead.OpportunityScore =
		services.CalculateOpportunityScore(lead)

	result, err := r.DB.Exec(`
		INSERT INTO leads (
			company_name,
			contact_name,
			email,
			phone,
			website,
			category,
			city,
			source,
			opportunity_score,
			status,
			sub_niche,
			pitch,
			mail_status
		)
		VALUES (
			$1,
			$2,
			NULLIF($3, ''),
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10,
			$11,
			$12,
			$13
		)
		ON CONFLICT (company_name, email) DO NOTHING
	`,
		lead.CompanyName,
		lead.ContactName,
		lead.Email,
		lead.Phone,
		lead.Website,
		lead.Niche,
		lead.Area,
		lead.Source,
		lead.OpportunityScore,
		lead.Status,
		lead.SubNiche,
		lead.Pitch,
		lead.MailStatus,
	)

	if err != nil {
		return false, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	return rowsAffected > 0, nil
}

// GetAllLeads returns all leads from PostgreSQL.
func (r *LeadRepository) GetAllLeads() ([]models.Lead, error) {

	rows, err := r.DB.Query(`
		SELECT
			id,
			category,
			company_name,
			sub_niche,
			city,
			contact_name,
			COALESCE(email, ''),
			COALESCE(phone, ''),
			COALESCE(website, ''),
			COALESCE(pitch, ''),
			COALESCE(mail_status, ''),
			COALESCE(source, ''),
			COALESCE(opportunity_score, 0),
			COALESCE(status, 'new')
		FROM leads
		ORDER BY id DESC
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	leads := []models.Lead{}

	for rows.Next() {

		var lead models.Lead

		err := rows.Scan(
			&lead.ID,
			&lead.Niche,
			&lead.CompanyName,
			&lead.SubNiche,
			&lead.Area,
			&lead.ContactName,
			&lead.Email,
			&lead.Phone,
			&lead.Website,
			&lead.Pitch,
			&lead.MailStatus,
			&lead.Source,
			&lead.OpportunityScore,
			&lead.Status,
		)

		if err != nil {
			return nil, err
		}

		leads = append(leads, lead)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return leads, nil
}

// UpdateLeadStatus updates the CRM status of a lead.
func (r *LeadRepository) UpdateLeadStatus(
	id int,
	status string,
) error {

	status = strings.ToLower(
		strings.TrimSpace(status),
	)

	switch status {
	case "new",
		"contacted",
		"interested",
		"converted",
		"lost":
		// valid
	default:
		return sql.ErrNoRows
	}

	result, err := r.DB.Exec(`
		UPDATE leads
		SET status = $1
		WHERE id = $2
	`, status, id)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// RecalculateAllOpportunityScores recalculates the score
// of every existing lead.
//
// This is useful once after introducing the scoring system
// because older leads may currently have a score of 0.
func (r *LeadRepository) RecalculateAllOpportunityScores() (
	int,
	error,
) {

	rows, err := r.DB.Query(`
		SELECT
			id,
			category,
			company_name,
			sub_niche,
			city,
			contact_name,
			COALESCE(email, ''),
			COALESCE(phone, ''),
			COALESCE(website, ''),
			COALESCE(pitch, ''),
			COALESCE(mail_status, ''),
			COALESCE(source, ''),
			COALESCE(status, 'new')
		FROM leads
	`)

	if err != nil {
		return 0, err
	}

	defer rows.Close()

	type leadScoreUpdate struct {
		ID    int64
		Score int
	}

	updates := []leadScoreUpdate{}

	for rows.Next() {

		var lead models.Lead

		err := rows.Scan(
			&lead.ID,
			&lead.Niche,
			&lead.CompanyName,
			&lead.SubNiche,
			&lead.Area,
			&lead.ContactName,
			&lead.Email,
			&lead.Phone,
			&lead.Website,
			&lead.Pitch,
			&lead.MailStatus,
			&lead.Source,
			&lead.Status,
		)

		if err != nil {
			return 0, err
		}

		score :=
			services.CalculateOpportunityScore(
				lead,
			)

		updates = append(
			updates,
			leadScoreUpdate{
				ID:    lead.ID,
				Score: score,
			},
		)
	}

	if err := rows.Err(); err != nil {
		return 0, err
	}

	updated := 0

	for _, item := range updates {

		result, err := r.DB.Exec(`
			UPDATE leads
			SET opportunity_score = $1
			WHERE id = $2
		`,
			item.Score,
			item.ID,
		)

		if err != nil {
			return updated, err
		}

		count, err := result.RowsAffected()

		if err != nil {
			return updated, err
		}

		updated += int(count)
	}

	return updated, nil
}

// UpdateLeadScore recalculates and saves the score
// for one specific lead.
func (r *LeadRepository) UpdateLeadScore(
	id int64,
) (int, error) {

	var lead models.Lead

	err := r.DB.QueryRow(`
		SELECT
			id,
			category,
			company_name,
			sub_niche,
			city,
			contact_name,
			COALESCE(email, ''),
			COALESCE(phone, ''),
			COALESCE(website, ''),
			COALESCE(pitch, ''),
			COALESCE(mail_status, ''),
			COALESCE(source, ''),
			COALESCE(status, 'new')
		FROM leads
		WHERE id = $1
	`, id).Scan(
		&lead.ID,
		&lead.Niche,
		&lead.CompanyName,
		&lead.SubNiche,
		&lead.Area,
		&lead.ContactName,
		&lead.Email,
		&lead.Phone,
		&lead.Website,
		&lead.Pitch,
		&lead.MailStatus,
		&lead.Source,
		&lead.Status,
	)

	if err != nil {
		return 0, err
	}

	score :=
		services.CalculateOpportunityScore(
			lead,
		)

	_, err = r.DB.Exec(`
		UPDATE leads
		SET opportunity_score = $1
		WHERE id = $2
	`,
		score,
		id,
	)

	if err != nil {
		return 0, err
	}

	return score, nil
}
