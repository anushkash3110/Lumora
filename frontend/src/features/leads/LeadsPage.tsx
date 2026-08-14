import { useEffect, useMemo, useState } from "react";
import { getLeads, type Lead } from "@/lib/leadsApi";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true);
        setError("");

        const data = await getLeads();
        setLeads(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load leads. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

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

          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1E293B]"
          >
            Refresh
          </button>

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
          onChange={(event) => setSearch(event.target.value)}
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
                    className="transition hover:bg-[#F8FAFC]"
                  >

                    <td className="px-5 py-4">

                      <div className="font-medium text-[#0F172A]">
                        {lead.companyName || "Unnamed business"}
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

          {/* NO RESULTS */}
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

      {/* FOOTER COUNT */}
      {!loading && !error && (
        <div className="mt-4 text-xs text-[#94A3B8]">
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
      )}

    </div>
  );
}