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

type FollowUpFilter =
  | "all"
  | "today"
  | "overdue"
  | "upcoming"
  | "none";

type FollowUpStatus =
  | "none"
  | "overdue"
  | "today"
  | "upcoming";

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

  const [scoreFilter, setScoreFilter] =
    useState("all");

  const [followUpFilter, setFollowUpFilter] =
    useState<FollowUpFilter>("all");

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
  // NOTES + FOLLOW-UP UPDATED
  // --------------------------------------------------

  function handleDetailsUpdated(
    leadId: number,
    notes: string,
    followUpDate: string
  ): void {
    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              notes,
              followUpDate,
            }
          : lead
      )
    );

    setSelectedLead((currentLead) =>
      currentLead &&
      currentLead.id === leadId
        ? {
            ...currentLead,
            notes,
            followUpDate,
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
  // SCORE HELPERS
  // --------------------------------------------------

  function getScoreLevel(
    score: number
  ): "high" | "medium" | "low" {
    if (score >= 80) {
      return "high";
    }

    if (score >= 50) {
      return "medium";
    }

    return "low";
  }

  function getScoreLabel(
    score: number
  ): string {
    const level =
      getScoreLevel(score);

    if (level === "high") {
      return "High";
    }

    if (level === "medium") {
      return "Medium";
    }

    return "Low";
  }

  function getScoreClasses(
    score: number
  ): string {
    const level =
      getScoreLevel(score);

    if (level === "high") {
      return "bg-red-50 text-red-700";
    }

    if (level === "medium") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
  }

  // --------------------------------------------------
  // DATE HELPERS
  // --------------------------------------------------

  function getTodayDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getFollowUpStatus(
    followUpDate?: string
  ): FollowUpStatus {
    if (!followUpDate?.trim()) {
      return "none";
    }

    const today = getTodayDate();

    if (followUpDate < today) {
      return "overdue";
    }

    if (followUpDate === today) {
      return "today";
    }

    return "upcoming";
  }

  function getFollowUpLabel(
    followUpDate?: string
  ): string {
    const status =
      getFollowUpStatus(
        followUpDate
      );

    switch (status) {
      case "overdue":
        return "Overdue";

      case "today":
        return "Due Today";

      case "upcoming":
        return "Upcoming";

      default:
        return "No Follow-up";
    }
  }

  function getFollowUpClasses(
    followUpDate?: string
  ): string {
    const status =
      getFollowUpStatus(
        followUpDate
      );

    switch (status) {
      case "overdue":
        return "bg-red-50 text-red-700";

      case "today":
        return "bg-emerald-50 text-emerald-700";

      case "upcoming":
        return "bg-blue-50 text-blue-700";

      default:
        return "bg-slate-100 text-slate-500";
    }
  }

  function formatFollowUpDate(
    followUpDate?: string
  ): string {
    if (!followUpDate) {
      return "—";
    }

    const parts =
      followUpDate.split("-");

    if (parts.length !== 3) {
      return followUpDate;
    }

    const [
      year,
      month,
      day,
    ] = parts;

    return `${day}/${month}/${year}`;
  }

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
        lead.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        query === "" ||
        searchableText.includes(query);

      const currentStatus =
        (
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

      const score =
        Number(
          lead.opportunityScore
        ) || 0;

      const matchesScore =
        scoreFilter === "all" ||
        getScoreLevel(score) ===
          scoreFilter;

      const currentFollowUpStatus =
        getFollowUpStatus(
          lead.followUpDate
        );

      const matchesFollowUp =
        followUpFilter === "all" ||
        currentFollowUpStatus ===
          followUpFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesEmail &&
        matchesPhone &&
        matchesScore &&
        matchesFollowUp
      );
    });
  }, [
    leads,
    search,
    statusFilter,
    categoryFilter,
    emailFilter,
    phoneFilter,
    scoreFilter,
    followUpFilter,
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
    setScoreFilter("all");
    setFollowUpFilter("all");
  }

  const filtersActive =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    emailFilter !== "all" ||
    phoneFilter !== "all" ||
    scoreFilter !== "all" ||
    followUpFilter !== "all";

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const totalLeads =
    leads.length;

  const highPriorityLeads =
    leads.filter((lead) =>
      getScoreLevel(
        Number(
          lead.opportunityScore
        ) || 0
      ) === "high"
    ).length;

  const dueTodayCount =
    leads.filter(
      (lead) =>
        getFollowUpStatus(
          lead.followUpDate
        ) === "today"
    ).length;

  const overdueCount =
    leads.filter(
      (lead) =>
        getFollowUpStatus(
          lead.followUpDate
        ) === "overdue"
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

            {/* TABLE / PIPELINE */}

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

      {/* FOLLOW-UP SUMMARY */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          label="Total Leads"
          value={totalLeads}
        />

        <StatCard
          label="High Priority"
          value={highPriorityLeads}
        />

        <StatCard
          label="Due Today"
          value={dueTodayCount}
        />

        <StatCard
          label="Overdue"
          value={overdueCount}
        />

      </div>

      {/* SEARCH + FILTERS */}

      <div className="mb-4 rounded-xl border border-[#E2E8F0] bg-white p-4">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search businesses, emails, categories, notes..."
          className="mb-4 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">

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

          {/* SCORE */}

          <select
            value={scoreFilter}
            onChange={(event) =>
              setScoreFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#475569]"
          >
            <option value="all">
              Score: All
            </option>

            <option value="high">
              Score: High
            </option>

            <option value="medium">
              Score: Medium
            </option>

            <option value="low">
              Score: Low
            </option>
          </select>

          {/* FOLLOW-UP */}

          <select
            value={followUpFilter}
            onChange={(event) =>
              setFollowUpFilter(
                event.target
                  .value as FollowUpFilter
              )
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#475569]"
          >
            <option value="all">
              Follow-up: All
            </option>

            <option value="today">
              Due Today
            </option>

            <option value="overdue">
              Overdue
            </option>

            <option value="upcoming">
              Upcoming
            </option>

            <option value="none">
              No Follow-up
            </option>
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

        {/* FILTER FOOTER */}

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
          <div className="lumora-scrollbar max-h-[600px] overflow-auto rounded-xl border border-[#E2E8F0] bg-white">

            <table className="w-full min-w-250 text-left">

              <thead className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-[#F8FAFC]">

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
                    Score
                  </TableHeader>

                  <TableHeader>
                    Follow-up
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                </tr>

              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">

                {filteredLeads.map(
                  (lead) => {
                    const score =
                      Number(
                        lead.opportunityScore
                      ) || 0;

                    const followUpStatus =
                      getFollowUpStatus(
                        lead.followUpDate
                      );

                    return (
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
                          {lead.niche ||
                            "—"}
                        </td>

                        {/* CONTACT */}

                        <td className="px-5 py-4 text-sm text-[#475569]">
                          {lead.contactName ||
                            "—"}
                        </td>

                        {/* PHONE */}

                        <td className="px-5 py-4 text-sm text-[#475569]">
                          {lead.phone ||
                            "—"}
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

                        {/* SCORE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreClasses(
                                score
                              )}`}
                            >
                              {score}
                            </span>

                            <span className="text-xs text-[#94A3B8]">
                              {getScoreLabel(
                                score
                              )}
                            </span>

                          </div>

                        </td>

                        {/* FOLLOW-UP */}

                        <td className="px-5 py-4">

                          {followUpStatus ===
                          "none" ? (
                            <span className="text-sm text-[#94A3B8]">
                              —
                            </span>
                          ) : (
                            <div className="flex flex-col items-start gap-1">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getFollowUpClasses(
                                  lead.followUpDate
                                )}`}
                              >
                                {getFollowUpLabel(
                                  lead.followUpDate
                                )}
                              </span>

                              <span className="text-xs text-[#64748B]">
                                {formatFollowUpDate(
                                  lead.followUpDate
                                )}
                              </span>

                            </div>
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
                    );
                  }
                )}

              </tbody>

            </table>

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
        onDetailsUpdated={
          handleDetailsUpdated
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

                <p className="mt-2 text-xs text-[#94A3B8]">
                  Make sure the Google Sheet is accessible to the importer.
                </p>

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