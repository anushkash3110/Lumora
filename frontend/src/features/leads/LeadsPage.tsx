import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getLeads,
  importGoogleSheet,
  type Lead,
} from "@/lib/leadsApi";

import LeadDetails from "./components/LeadDetails";
import LeadPipeline from "./components/LeadPipeline";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [emailFilter, setEmailFilter] =
    useState("all");

  const [phoneFilter, setPhoneFilter] =
    useState("all");

  const [viewMode, setViewMode] = useState<
    "table" | "pipeline"
  >("table");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedLead, setSelectedLead] =
    useState<Lead | null>(null);

  const [showImport, setShowImport] =
    useState(false);

  const [sheetUrl, setSheetUrl] =
    useState("");

  const [importing, setImporting] =
    useState(false);

  const [importMessage, setImportMessage] =
    useState("");

  const [importError, setImportError] =
    useState("");

  // --------------------------------------------------
  // LOAD LEADS
  // --------------------------------------------------

  async function loadLeads(): Promise<void> {
    try {
      setLoading(true);
      setError("");

      const data = await getLeads();

      setLeads(data);
    } catch (err) {
      console.error(
        "Failed to load leads:",
        err
      );

      setError(
        "Unable to load leads. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    const fetchLeads = async () => {
      await loadLeads();
    };

    void fetchLeads();
  }, []);

  // --------------------------------------------------
  // GOOGLE SHEET IMPORT
  // --------------------------------------------------

  async function handleImport(): Promise<void> {
    if (!sheetUrl.trim()) {
      setImportError(
        "Please enter a Google Sheet URL."
      );
      return;
    }

    try {
      setImporting(true);
      setImportError("");
      setImportMessage("");

      const result =
        await importGoogleSheet(
          sheetUrl.trim()
        );

      setImportMessage(
        `${result.imported} leads imported successfully. ${result.skipped} rows skipped.`
      );

      await loadLeads();

      setSheetUrl("");
    } catch (err) {
      console.error(
        "Failed to import Google Sheet:",
        err
      );

      setImportError(
        err instanceof Error
          ? err.message
          : "Failed to import Google Sheet."
      );
    } finally {
      setImporting(false);
    }
  }

  // --------------------------------------------------
  // STATUS UPDATED
  // --------------------------------------------------

  function handleStatusUpdated(
    leadId: number,
    newStatus: string
  ): void {
    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status: newStatus,
            }
          : lead
      )
    );

    setSelectedLead((currentLead) =>
      currentLead &&
      currentLead.id === leadId
        ? {
            ...currentLead,
            status: newStatus,
          }
        : currentLead
    );
  }

  // --------------------------------------------------
  // CATEGORIES
  // --------------------------------------------------

  const categories = useMemo(() => {
    const uniqueCategories =
      new Set<string>();

    for (const lead of leads) {
      const category =
        lead.niche?.trim();

      if (category) {
        uniqueCategories.add(category);
      }
    }

    return Array.from(
      uniqueCategories
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [leads]);

  // --------------------------------------------------
  // FILTER LEADS
  // --------------------------------------------------

  const filteredLeads = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return leads.filter((lead) => {
      const searchableText = [
        lead.companyName,
        lead.niche,
        lead.subNiche,
        lead.area,
        lead.contactName,
        lead.email,
        lead.phone,
        lead.website,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        query === "" ||
        searchableText.includes(query);

      const currentStatus = (
        lead.status || "new"
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        currentStatus === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        (lead.niche || "").trim() ===
          categoryFilter;

      const hasEmail =
        Boolean(lead.email?.trim());

      const hasPhone =
        Boolean(lead.phone?.trim());

      const matchesEmail =
        emailFilter === "all" ||
        (emailFilter === "available" &&
          hasEmail) ||
        (emailFilter === "missing" &&
          !hasEmail);

      const matchesPhone =
        phoneFilter === "all" ||
        (phoneFilter === "available" &&
          hasPhone) ||
        (phoneFilter === "missing" &&
          !hasPhone);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesEmail &&
        matchesPhone
      );
    });
  }, [
    leads,
    search,
    statusFilter,
    categoryFilter,
    emailFilter,
    phoneFilter,
  ]);

  // --------------------------------------------------
  // RESET FILTERS
  // --------------------------------------------------

  function resetFilters(): void {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setEmailFilter("all");
    setPhoneFilter("all");
  }

  const filtersActive =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    emailFilter !== "all" ||
    phoneFilter !== "all";

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const totalLeads = leads.length;

  const emailsAvailable =
    leads.filter((lead) =>
      Boolean(lead.email?.trim())
    ).length;

  const phonesAvailable =
    leads.filter((lead) =>
      Boolean(lead.phone?.trim())
    ).length;

  const websitesAvailable =
    leads.filter((lead) =>
      Boolean(lead.website?.trim())
    ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6">

      {/* HEADER */}

      <div className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A]">
              Leads
            </h1>

            <p className="mt-1 text-sm text-[#64748B]">
              Manage and qualify your potential clients.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* VIEW MODE */}

            <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white p-1">

              <button
                type="button"
                onClick={() =>
                  setViewMode("table")
                }
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  viewMode === "table"
                    ? "bg-[#0F172A] text-white"
                    : "text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                Table
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode("pipeline")
                }
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  viewMode === "pipeline"
                    ? "bg-[#0F172A] text-white"
                    : "text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                Pipeline
              </button>

            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                void loadLeads()
              }
              className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
            >
              Refresh
            </button>

            {/* IMPORT */}

            <button
              type="button"
              onClick={() => {
                setShowImport(true);
                setImportMessage("");
                setImportError("");
              }}
              className="rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E293B]"
            >
              + Import Leads
            </button>

          </div>
        </div>
      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          label="Total Leads"
          value={totalLeads}
        />

        <StatCard
          label="Emails Available"
          value={emailsAvailable}
        />

        <StatCard
          label="Phone Numbers"
          value={phonesAvailable}
        />

        <StatCard
          label="Websites"
          value={websitesAvailable}
        />

      </div>

      {/* SEARCH + FILTERS */}

      <div className="mb-4 rounded-xl border border-[#E2E8F0] bg-white p-4">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search businesses, emails, categories..."
          className="mb-4 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#475569]"
          >
            <option value="all">
              All Statuses
            </option>

            <option value="new">
              New
            </option>

            <option value="contacted">
              Contacted
            </option>

            <option value="interested">
              Interested
            </option>

            <option value="converted">
              Converted
            </option>

            <option value="lost">
              Lost
            </option>
          </select>

          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#475569]"
          >
            <option value="all">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          {/* EMAIL */}

          <select
            value={emailFilter}
            onChange={(event) =>
              setEmailFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#475569]"
          >
            <option value="all">
              Email: All
            </option>

            <option value="available">
              Email: Available
            </option>

            <option value="missing">
              Email: Missing
            </option>
          </select>

          {/* PHONE */}

          <select
            value={phoneFilter}
            onChange={(event) =>
              setPhoneFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#475569]"
          >
            <option value="all">
              Phone: All
            </option>

            <option value="available">
              Phone: Available
            </option>

            <option value="missing">
              Phone: Missing
            </option>
          </select>

        </div>

        <div className="mt-4 flex items-center justify-between">

          <p className="text-xs text-[#94A3B8]">
            Showing{" "}
            {filteredLeads.length} of{" "}
            {leads.length} leads
          </p>

          {filtersActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-medium text-[#475569] hover:bg-[#F8FAFC]"
            >
              Reset Filters
            </button>
          )}

        </div>
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

      {!loading &&
        !error &&
        viewMode === "table" && (
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">

            <div className="overflow-x-auto">

              <table className="w-full min-w-250 text-left">

                <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC]">

                  <tr>

                    <TableHeader>
                      Business
                    </TableHeader>

                    <TableHeader>
                      Category
                    </TableHeader>

                    <TableHeader>
                      Contact
                    </TableHeader>

                    <TableHeader>
                      Phone
                    </TableHeader>

                    <TableHeader>
                      Email
                    </TableHeader>

                    <TableHeader>
                      Website
                    </TableHeader>

                    <TableHeader>
                      Status
                    </TableHeader>

                  </tr>

                </thead>

                <tbody className="divide-y divide-[#E2E8F0]">

                  {filteredLeads.map(
                    (lead) => (
                      <tr
                        key={lead.id}
                        onClick={() =>
                          setSelectedLead(
                            lead
                          )
                        }
                        className="cursor-pointer hover:bg-[#F8FAFC]"
                      >

                        {/* BUSINESS */}

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

                        {/* CATEGORY */}

                        <td className="px-5 py-4 text-sm text-[#475569]">
                          {lead.niche || "—"}
                        </td>

                        {/* CONTACT */}

                        <td className="px-5 py-4 text-sm text-[#475569]">
                          {lead.contactName ||
                            "—"}
                        </td>

                        {/* PHONE */}

                        <td className="px-5 py-4 text-sm text-[#475569]">
                          {lead.phone || "—"}
                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-4">

                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              onClick={(
                                event
                              ) =>
                                event.stopPropagation()
                              }
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-sm text-[#94A3B8]">
                              —
                            </span>
                          )}

                        </td>

                        {/* WEBSITE */}

                        <td className="px-5 py-4">

                          {lead.website ? (
                            <a
                              href={
                                lead.website.startsWith(
                                  "http"
                                )
                                  ? lead.website
                                  : `https://${lead.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              onClick={(
                                event
                              ) =>
                                event.stopPropagation()
                              }
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Visit
                            </a>
                          ) : (
                            <span className="text-sm text-[#94A3B8]">
                              —
                            </span>
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span className="inline-flex rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-medium capitalize text-[#475569]">
                            {lead.status ||
                              "new"}
                          </span>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {filteredLeads.length ===
              0 && (
              <EmptyState
                onReset={
                  filtersActive
                    ? resetFilters
                    : undefined
                }
              />
            )}

          </div>
        )}

      {/* PIPELINE */}

      {!loading &&
        !error &&
        viewMode === "pipeline" && (
          <LeadPipeline
            leads={filteredLeads}
            onSelectLead={
              setSelectedLead
            }
          />
        )}

      {/* FOOTER */}

      {!loading && !error && (
        <div className="mt-4 text-xs text-[#94A3B8]">
          Showing{" "}
          {filteredLeads.length} of{" "}
          {leads.length} leads
        </div>
      )}

      {/* LEAD DETAILS */}

      <LeadDetails
        lead={selectedLead}
        onClose={() =>
          setSelectedLead(null)
        }
        onStatusUpdated={
          handleStatusUpdated
        }
      />

      {/* IMPORT MODAL */}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

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
                type="button"
                onClick={() =>
                  setShowImport(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#94A3B8] hover:bg-[#F1F5F9]"
              >
                ×
              </button>

            </div>

            <div className="space-y-5 p-6">

              <div>

                <label className="mb-2 block text-sm font-medium text-[#334155]">
                  Google Sheet URL
                </label>

                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(event) =>
                    setSheetUrl(
                      event.target.value
                    )
                  }
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full rounded-lg border border-[#CBD5E1] px-4 py-3 text-sm outline-none"
                />

              </div>

              {importMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {importMessage}
                </div>
              )}

              {importError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {importError}
                </div>
              )}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowImport(false)
                  }
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm font-medium text-[#475569]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleImport()
                  }
                  disabled={importing}
                  className="rounded-lg bg-[#0F172A] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
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

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">

      <p className="text-sm text-[#64748B]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-[#0F172A]">
        {value}
      </p>

    </div>
  );
}

// --------------------------------------------------
// TABLE HEADER
// --------------------------------------------------

function TableHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
      {children}
    </th>
  );
}

// --------------------------------------------------
// EMPTY STATE
// --------------------------------------------------

function EmptyState({
  onReset,
}: {
  onReset?: () => void;
}) {
  return (
    <div className="p-10 text-center">

      <p className="text-sm font-medium text-[#475569]">
        No leads found
      </p>

      <p className="mt-1 text-xs text-[#94A3B8]">
        Try changing your search or filters.
      </p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-lg border border-[#E2E8F0] px-4 py-2 text-xs font-medium text-[#475569]"
        >
          Reset Filters
        </button>
      )}

    </div>
  );
}