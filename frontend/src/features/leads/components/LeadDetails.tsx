import { useState } from "react";
import type { Lead } from "@/lib/leadsApi";

interface LeadDetailsProps {
  lead: Lead | null;
  onClose: () => void;
  onStatusUpdated?: (
    leadId: number,
    newStatus: string
  ) => void;
}

const STATUS_OPTIONS = [
  "new",
  "contacted",
  "interested",
  "converted",
  "lost",
];

export default function LeadDetails({
  lead,
  onClose,
  onStatusUpdated,
}: LeadDetailsProps) {
  const [savingStatus, setSavingStatus] =
    useState(false);

  const [statusError, setStatusError] =
    useState("");

  if (lead === null) {
    return null;
  }

  const leadId = lead.id;
  const currentStatus = lead.status || "new";

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Failed to update status.";

        try {
          const data = await response.json();

          if (
            data &&
            typeof data.error === "string"
          ) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      /*
       * The parent component owns the lead state.
       * Updating it here makes the table,
       * pipeline and details panel stay in sync.
       */
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
                (statusOption) => (
                  <option
                    key={statusOption}
                    value={statusOption}
                  >
                    {statusOption}
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

          {/* CONTACT INFORMATION */}

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

              {/* EMAIL */}

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

              {/* WEBSITE */}

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