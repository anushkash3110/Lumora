/**
 * ------------------------------------------------------------
 * Lumora
 * Dashboard
 * ------------------------------------------------------------
 */

const stats = [
  {
    title: "Leads",
    value: "1,245",
  },
  {
    title: "Emails",
    value: "367",
  },
  {
    title: "Replies",
    value: "42",
  },
  {
    title: "Campaigns",
    value: "8",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      <section>

        <h1
          className="text-5xl font-semibold text-slate-900"
          style={{
            fontFamily: "Newsreader",
          }}
        >
          Good Afternoon, Anushka 👋
        </h1>

        <p className="mt-3 text-slate-500 text-lg">
          Let's find your next client today.
        </p>

      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8">

        <h2 className="text-2xl font-semibold">
          AI Workspace
        </h2>

        <p className="text-slate-500 mt-2">
          What would you like to do today?
        </p>

        <div className="grid grid-cols-4 gap-4 mt-8">

          {[
            "Import Leads",
            "Research Companies",
            "Generate Emails",
            "Create Campaign",
          ].map((item) => (

            <button
              key={item}
              className="rounded-2xl border border-slate-200 py-6 hover:border-indigo-500 hover:bg-indigo-50 transition"
            >
              {item}
            </button>

          ))}

        </div>

      </section>

      <section className="grid grid-cols-4 gap-6">

        {stats.map((card) => (

          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
          >

            <p className="text-slate-500">
              {card.title}
            </p>

            <h2 className="text-4xl font-bold mt-4">
              {card.value}
            </h2>

          </div>

        ))}

      </section>

      <section className="grid grid-cols-2 gap-6">

        <div className="rounded-3xl border border-slate-200 bg-white p-8 h-[320px]">

          <h2 className="text-xl font-semibold">
            Recent Leads
          </h2>

        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 h-[320px]">

          <h2 className="text-xl font-semibold">
            Activity Timeline
          </h2>

        </div>

      </section>

    </div>
  );
}