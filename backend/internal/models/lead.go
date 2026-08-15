package models

type Lead struct {
	ID               int64  `json:"id"`
	Niche            string `json:"niche"`
	CompanyName      string `json:"companyName"`
	SubNiche         string `json:"subNiche"`
	Area             string `json:"area"`
	ContactName      string `json:"contactName"`
	Email            string `json:"email"`
	Phone            string `json:"phone"`
	Website          string `json:"website"`
	Pitch            string `json:"pitch"`
	MailStatus       string `json:"mailStatus"`
	Source           string `json:"source"`
	OpportunityScore int    `json:"opportunityScore"`
	Status           string `json:"status"`
	Notes            string `json:"notes"`
	FollowUpDate     string `json:"followUpDate"`
}