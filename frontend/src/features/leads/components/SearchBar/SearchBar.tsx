import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="relative">

        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          placeholder="Search company..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
        />

      </div>

    </div>
  );
}