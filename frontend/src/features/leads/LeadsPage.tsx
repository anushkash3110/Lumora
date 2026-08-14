import { useEffect, useMemo, useState } from "react";
import {
  getLeads,
  importGoogleSheet,
  type Lead,
} from "@/lib/leadsApi";

import LeadDetails from "./components/LeadDetails";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  const [showImport, setShowImport] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");

  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");

      const data = await getLeads();

      setLeads(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load leads. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleImport() {
    if (!sheetUrl.trim()) {
      setImportError("Please enter a Google Sheet URL.");
      return;
    }

    try {
      setImporting(true);
      setImportError("");
      setImportMessage("");

      const result = await importGoogleSheet(
        sheetUrl.trim()
      );

      setImportMessage(
        `${result.imported} leads imported successfully. ${result.skipped} rows skipped.`
      );

      // Refresh the table with newly imported leads
      await loadLeads();

      setSheetUrl("");

    } catch (err) {
      console.error(err);

      setImportError(
        err instanceof Error
          ? err.message
          : "Failed to import Google Sheet."
      );
    } finally {
      setImporting(false);
    }
  }

  const filteredLeads = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return leads;
    }

    return leads.filter((lead) =>
      [
        lead.companyName,
        lead.niche,
        lead.subNiche,
        lead.area,
        lead.contactName,
        lead.email,
        lead.phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [leads, search]);

  const totalLeads = leads.length;

  const emailsAvailable = leads.filter(
    (lead) => lead.email?.trim()
  ).length;

  const phonesAvailable = leads.filter(
    (lead) => lead.phone?.trim()
  ).length;

  const websitesAvailable = leads.filter(
    (lead) => lead.website?.trim()
  ).length;

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6">

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A]">
              Leads
            </h1>

            <p className="mt-1 text-sm text-[#64748B]">
              Manage and qualify your potential clients.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={loadLeads}
              className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]"
            >
              Refresh
            </button>

            <button
              onClick={() => {
                setShowImport(true);
                setImportMessage("");
                setImportError("");
              }}
              className="rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1E293B]"
            >
              + Import Leads
            </button>

          </div>

        </div>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">
            Total Leads
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0F172A]">
            {totalLeads}
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">
            Emails Available
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0F172A]">
            {emailsAvailable}
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">
            Phone Numbers
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0F172A]">
            {phonesAvailable}
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">
            Websites
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#0F172A]">
            {websitesAvailable}
          </p>
        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-4 rounded-xl border border-[#E2E8F0] bg-white p-4">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search businesses, emails, categories..."
          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#94A3B8]"
        />

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center">
          <p className="text-sm text-[#64748B]">
            Loading leads...
          </p>
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-left">

              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC]">

                <tr>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Business
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Email
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Website
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">

                {filteredLeads.map((lead) => (

                  <tr
                    key={lead.id}
                    onClick={() =>
                      setSelectedLead(lead)
                    }
                    className="cursor-pointer transition hover:bg-[#F8FAFC]"
                  >

                    <td className="px-5 py-4">

                      <div className="font-medium text-[#0F172A]">
                        {lead.companyName ||
                          "Unnamed business"}
                      </div>

                      {lead.area && (
                        <div className="mt-1 text-xs text-[#94A3B8]">
                          {lead.area}
                        </div>
                      )}

                    </td>

                    <td className="px-5 py-4 text-sm text-[#475569]">
                      {lead.niche || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#475569]">
                      {lead.contactName || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#475569]">
                      {lead.phone || "—"}
                    </td>

                    <td className="px-5 py-4">

                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className="text-sm text-[#2563EB] hover:underline"
                        >
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-sm text-[#94A3B8]">
                          —
                        </span>
                      )}

                    </td>

                    <td className="px-5 py-4">

                      {lead.website ? (
                        <a
                          href={
                            lead.website.startsWith("http")
                              ? lead.website
                              : `https://${lead.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className="text-sm text-[#2563EB] hover:underline"
                        >
                          Visit
                        </a>
                      ) : (
                        <span className="text-sm text-[#94A3B8]">
                          —
                        </span>
                      )}

                    </td>

                    <td className="px-5 py-4">

                      <span className="inline-flex rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-medium text-[#475569]">
                        {lead.status || "new"}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {filteredLeads.length === 0 && (
            <div className="p-10 text-center">

              <p className="text-sm font-medium text-[#475569]">
                No leads found
              </p>

              <p className="mt-1 text-xs text-[#94A3B8]">
                Try changing your search.
              </p>

            </div>
          )}

        </div>
      )}

      {/* FOOTER */}
      {!loading && !error && (
        <div className="mt-4 text-xs text-[#94A3B8]">
          Showing {filteredLeads.length} of{" "}
          {leads.length} leads
        </div>
      )}

      {/* LEAD DETAILS */}
      <LeadDetails
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />

      {/* IMPORT MODAL */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-5">

              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  Import Google Sheet
                </h2>

                <p className="mt-1 text-sm text-[#64748B]">
                  Import potential clients directly into Lumora.
                </p>
              </div>

              <button
                onClick={() => setShowImport(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#94A3B8] hover:bg-[#F1F5F9]"
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="space-y-5 p-6">

              <div>

                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Google Sheet URL
                </label>

                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(event) =>
                    setSheetUrl(event.target.value)
                  }
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full rounded-lg border border-[#CBD5E1] px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#64748B]"
                />

                <p className="mt-2 text-xs text-[#94A3B8]">
                  Make sure the Google Sheet is accessible to the importer.
                </p>

              </div>

              {/* SUCCESS */}
              {importMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {importMessage}
                </div>
              )}

              {/* ERROR */}
              {importError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {importError}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setShowImport(false)}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="rounded-lg bg-[#0F172A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importing
                    ? "Importing..."
                    : "Import Leads"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}