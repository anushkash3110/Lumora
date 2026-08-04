/**
 * ------------------------------------------------------------
 * Lumora
 * Component: Header
 * Purpose : Top Navigation
 * ------------------------------------------------------------
 */

import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="h-[72px] bg-white border-b border-slate-200 px-8 flex items-center justify-between">

      <div className="relative w-[420px]">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search businesses, campaigns..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
        />

      </div>

      <div className="flex items-center gap-6">

        <button className="p-2 rounded-xl hover:bg-slate-100 transition">

          <Bell size={20} />

        </button>

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
            A
          </div>

          <div>

            <p className="font-semibold text-slate-900">
              Anushka
            </p>

            <p className="text-xs text-slate-500">
              Founder
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}