import { useState } from "react";

import {
  type Lead,
  updateLeadDetails,
} from "@/lib/leadsApi";

interface LeadDetailsProps {
  lead: Lead | null;
  onClose: () => void;
  onStatusUpdated?: (
    leadId: number,
    newStatus: string
  ) => void;
  onDetailsUpdated?: (
    leadId: number,
    notes: string,
    followUpDate: string
  ) => void;
}

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "interested",
  "converted",
  "lost",
];

function getScoreLabel(
  score: number
): string {
  if (score >= 80) {
    return "High";
  }

  if (score >= 50) {
    return "Medium";
  }

  return "Low";
}

function getScoreClasses(
  score: number
): string {
  if (score >= 80) {
    return "bg-red-50 text-red-700";
  }

  if (score >= 50) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function LeadDetails({
  lead,
  onClose,
  onStatusUpdated,
  onDetailsUpdated,
}: LeadDetailsProps) {
  const [savingStatus, setSavingStatus] =
    useState(false);

  const [statusError, setStatusError] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [followUpDate, setFollowUpDate] =
    useState("");

  const [savingDetails, setSavingDetails] =
    useState(false);

  const [detailsMessage, setDetailsMessage] =
    useState("");

  const [detailsError, setDetailsError] =
    useState("");

  if (lead === null) {
    return null;
  }

  const leadId = lead.id;

  const currentStatus =
    lead.status || "new";

  const score =
    Number(lead.opportunityScore) || 0;

  async function handleStatusChange(
    newStatus: string
  ): Promise<void> {
    try {
      setSavingStatus(true);
      setStatusError("");

      const response = await fetch(
        `http://localhost:8080/api/leads/${leadId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        const message =
          await response.json().catch(
            () => null
          );

        throw new Error(
          message?.error ||
            "Failed to update status."
        );
      }

      onStatusUpdated?.(
        leadId,
        newStatus
      );
    } catch (error) {
      console.error(
        "Failed to update lead status:",
        error
      );

      setStatusError(
        error instanceof Error
          ? error.message
          : "Failed to update status."
      );
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSaveDetails(): Promise<void> {
    try {
      setSavingDetails(true);
      setDetailsError("");
      setDetailsMessage("");

      await updateLeadDetails(
        leadId,
        notes,
        followUpDate
      );

      onDetailsUpdated?.(
        leadId,
        notes,
        followUpDate
      );

      setDetailsMessage(
        "Notes and follow-up saved."
      );
    } catch (error) {
      console.error(
        "Failed to save lead details:",
        error
      );

      setDetailsError(
        error instanceof Error
          ? error.message
          : "Failed to save lead details."
      );
    } finally {
      setSavingDetails(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20">

      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Lead Details
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {lead.companyName ||
                "Unnamed Business"}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>

        </div>

        <div className="space-y-6 p-6">

          {/* SCORE */}

          <section>

            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Opportunity Score
            </p>

            <div className="flex items-center gap-3">

              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${getScoreClasses(
                  score
                )}`}
              >
                {score}
              </span>

              <span className="text-sm font-medium text-slate-600">
                {getScoreLabel(score)} opportunity
              </span>

            </div>

          </section>

          {/* STATUS */}

          <section>

            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>

            <select
              value={currentStatus}
              disabled={savingStatus}
              onChange={(event) => {
                void handleStatusChange(
                  event.target.value
                );
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium capitalize text-slate-700 outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                )
              )}

            </select>

            {savingStatus && (
              <p className="mt-2 text-xs text-slate-400">
                Saving status...
              </p>
            )}

            {statusError && (
              <p className="mt-2 text-xs text-red-500">
                {statusError}
              </p>
            )}

            {!savingStatus &&
              !statusError && (
                <p className="mt-2 text-xs text-green-600">
                  Status is saved automatically.
                </p>
              )}

          </section>

          {/* BUSINESS INFORMATION */}

          <section>

            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Business Information
            </h3>

            <div className="space-y-3 rounded-xl border border-slate-200 p-4">

              <DetailRow
                label="Category"
                value={lead.niche}
              />

              <DetailRow
                label="Sub-Niche"
                value={lead.subNiche}
              />

              <DetailRow
                label="Area"
                value={lead.area}
              />

              <DetailRow
                label="Source"
                value={lead.source}
              />

            </div>

          </section>

          {/* CONTACT */}

          <section>

            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Contact Information
            </h3>

            <div className="space-y-3 rounded-xl border border-slate-200 p-4">

              <DetailRow
                label="Contact Person"
                value={lead.contactName}
              />

              <DetailRow
                label="Phone"
                value={lead.phone}
              />

              <div>

                <p className="text-xs text-slate-400">
                  Email
                </p>

                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="mt-1 block text-sm text-blue-600 hover:underline"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">
                    Not available
                  </p>
                )}

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Website
                </p>

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
                    className="mt-1 block text-sm text-blue-600 hover:underline"
                  >
                    {lead.website}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">
                    Not available
                  </p>
                )}

              </div>

            </div>

          </section>

          {/* NOTES */}

          <section>

            <div className="mb-3 flex items-center justify-between">

              <h3 className="text-sm font-semibold text-slate-900">
                Notes
              </h3>

              <span className="text-xs text-slate-400">
                Internal
              </span>

            </div>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Add notes about this lead, conversations, requirements, objections..."
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-200 p-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
            />

          </section>

          {/* FOLLOW-UP */}

          <section>

            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Follow-up
            </h3>

            <input
              type="date"
              value={followUpDate}
              onChange={(event) =>
                setFollowUpDate(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            />

          </section>

          {/* SAVE DETAILS */}

          <section>

            <button
              type="button"
              onClick={() =>
                void handleSaveDetails()
              }
              disabled={savingDetails}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingDetails
                ? "Saving..."
                : "Save Notes & Follow-up"}
            </button>

            {detailsMessage && (
              <p className="mt-2 text-center text-xs text-green-600">
                {detailsMessage}
              </p>
            )}

            {detailsError && (
              <p className="mt-2 text-center text-xs text-red-500">
                {detailsError}
              </p>
            )}

          </section>

          {/* PITCH */}

          <section>

            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Suggested Pitch
            </h3>

            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {lead.pitch ||
                "No pitch available for this lead."}
            </div>

          </section>

          {/* ACTIONS */}

          <div className="grid grid-cols-2 gap-3">

            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-800"
              >
                Email Lead
              </a>
            )}

            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Call Lead
              </a>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-700">
        {value || "Not available"}
      </p>

    </div>
  );
}