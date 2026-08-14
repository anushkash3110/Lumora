package repository

import (
	"database/sql"

	"github.com/anushkasharma/lumora/internal/models"
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
// Returns:
// true  -> new lead inserted
// false -> duplicate lead, so it was ignored
func (r *LeadRepository) CreateLead(lead models.Lead) (bool, error) {

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
			email,
			phone,
			website,
			pitch,
			mail_status,
			source,
			opportunity_score,
			status
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

	return leads, rows.Err()
}
