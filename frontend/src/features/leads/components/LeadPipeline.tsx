import type { Lead } from "@/lib/leadsApi";

interface LeadPipelineProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const columns = [
  {
    key: "new",
    title: "New",
  },
  {
    key: "contacted",
    title: "Contacted",
  },
  {
    key: "interested",
    title: "Interested",
  },
  {
    key: "converted",
    title: "Converted",
  },
  {
    key: "lost",
    title: "Lost",
  },
];

export default function LeadPipeline({
  leads,
  onSelectLead,
}: LeadPipelineProps) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="grid min-w-300 grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnLeads = leads.filter(
            (lead) =>
              (lead.status || "new").toLowerCase() ===
              column.key
          );

          return (
            <div
              key={column.key}
              className="min-h-125 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]"
            >
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-4">
                <h3 className="text-sm font-semibold text-[#334155]">
                  {column.title}
                </h3>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#64748B]">
                  {columnLeads.length}
                </span>
              </div>

              {/* LEADS */}
              <div className="space-y-3 p-3">
                {columnLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white p-4 text-left shadow-sm transition hover:border-[#CBD5E1] hover:shadow-md"
                  >
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {lead.companyName || "Unnamed Business"}
                    </p>

                    {lead.niche && (
                      <p className="mt-1 text-xs text-[#64748B]">
                        {lead.niche}
                      </p>
                    )}

                    {lead.contactName && (
                      <p className="mt-3 text-xs text-[#475569]">
                        {lead.contactName}
                      </p>
                    )}

                    {lead.email && (
                      <p className="mt-1 truncate text-xs text-[#64748B]">
                        {lead.email}
                      </p>
                    )}

                    {lead.phone && (
                      <p className="mt-1 text-xs text-[#64748B]">
                        {lead.phone}
                      </p>
                    )}

                    {lead.area && (
                      <p className="mt-3 text-xs text-[#94A3B8]">
                        {lead.area}
                      </p>
                    )}
                  </button>
                ))}

                {/* EMPTY COLUMN */}
                {columnLeads.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[#CBD5E1] px-4 py-8 text-center">
                    <p className="text-xs text-[#94A3B8]">
                      No leads
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}