import SearchBar from "./components/SearchBar";
import LeadTable from "./components/LeadTable";
import LeadStats from "./components/LeadStats";

export default function LeadsPage() {
  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>

          <h1
            className="text-5xl font-semibold"
            style={{ fontFamily: "Newsreader" }}
          >
            Leads
          </h1>

          <p className="mt-2 text-slate-500">
            Manage and track your prospects.
          </p>

        </div>

        <button className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition">

          + Import Leads

        </button>

      </div>

      <LeadStats />

      <SearchBar />

      <LeadTable />

    </div>
  );
}