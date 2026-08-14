export interface Lead {
  id: number;
  niche: string;
  companyName: string;
  subNiche: string;
  area: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  pitch: string;
  mailStatus: string;
  source: string;
  opportunityScore: number;
  status: string;
}

interface LeadsResponse {
  leads: Lead[];
}

interface ImportResponse {
  message: string;
  imported: number;
  skipped: number;
}

const API_URL = "http://localhost:8080";

export async function getLeads(): Promise<Lead[]> {
  const response = await fetch(`${API_URL}/api/leads`);

  if (!response.ok) {
    throw new Error("Failed to fetch leads");
  }

  const data: LeadsResponse | Lead[] = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  return data.leads ?? [];
}

export async function importGoogleSheet(
  sheetUrl: string
): Promise<ImportResponse> {
  const response = await fetch(
    `${API_URL}/api/import/google-sheet`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sheetUrl,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || "Failed to import Google Sheet"
    );
  }

  return data;
}