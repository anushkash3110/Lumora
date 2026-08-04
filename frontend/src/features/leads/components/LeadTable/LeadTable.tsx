const leads = [
  {
    company: "Pin & Pan Cafe",
    city: "Bhopal",
    score: 91,
    status: "High",
  },
  {
    company: "Fusion Cafe",
    city: "Bhopal",
    score: 83,
    status: "Medium",
  },
  {
    company: "Green Valley Hospital",
    city: "Bhopal",
    score: 95,
    status: "High",
  },
];

export default function LeadTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="px-6 py-4 text-left">Company</th>

            <th className="px-6 py-4 text-left">City</th>

            <th className="px-6 py-4 text-left">Opportunity</th>

            <th className="px-6 py-4 text-left">Status</th>

          </tr>

        </thead>

        <tbody>

          {leads.map((lead) => (

            <tr
              key={lead.company}
              className="border-t hover:bg-indigo-50 transition"
            >

              <td className="px-6 py-5 font-medium">

                {lead.company}

              </td>

              <td className="px-6 py-5">

                {lead.city}

              </td>

              <td className="px-6 py-5">

                {lead.score}

              </td>

              <td className="px-6 py-5">

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">

                  {lead.status}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}