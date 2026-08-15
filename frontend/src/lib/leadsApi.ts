const API_BASE_URL =
  "http://localhost:8080";

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

  notes: string;
  followUpDate: string;
}

interface LeadsResponse {
  leads: Lead[];
}

interface ImportResponse {
  imported: number;
  skipped: number;
  message: string;
}

export async function getLeads(): Promise<Lead[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/leads`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch leads."
    );
  }

  const data: LeadsResponse =
    await response.json();

  return data.leads;
}

export async function importGoogleSheet(
  sheetUrl: string
): Promise<ImportResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/import/google-sheet`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        sheetUrl,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        "Failed to import Google Sheet."
    );
  }

  return data;
}

export async function updateLeadStatus(
  leadId: number,
  status: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/leads/${leadId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    const data =
      await response.json().catch(
        () => null
      );

    throw new Error(
      data?.error ||
        "Failed to update lead status."
    );
  }
}

export async function updateLeadDetails(
  leadId: number,
  notes: string,
  followUpDate: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/leads/${leadId}/details`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        notes,
        followUpDate,
      }),
    }
  );

  if (!response.ok) {
    const data =
      await response.json().catch(
        () => null
      );

    throw new Error(
      data?.error ||
        "Failed to update lead details."
    );
  }
}