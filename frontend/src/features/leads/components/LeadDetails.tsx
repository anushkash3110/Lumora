import type { Lead } from "@/lib/leadsApi";

interface LeadDetailsProps {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadDetails({
  lead,
  onClose,
}: LeadDetailsProps) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Lead Details
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {lead.companyName || "Unnamed Business"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">

          {/* Status */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>

            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {lead.status || "new"}
            </span>
          </div>

          {/* Basic Information */}
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

          {/* Contact */}
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
                <p className="text-xs text-slate-400">Email</p>

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
                <p className="text-xs text-slate-400">Website</p>

                {lead.website ? (
                  <a
                    href={
                      lead.website.startsWith("http")
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

          {/* Pitch */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Suggested Pitch
            </h3>

            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {lead.pitch || "No pitch available for this lead."}
            </div>
          </section>

          {/* Actions */}
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