/**
 * ------------------------------------------------------------
 * Lumora
 * Component: Sidebar
 * Purpose : Main Navigation
 * ------------------------------------------------------------
 */

import {
  LayoutDashboard,
  Users,
  Search,
  Mail,
  BarChart3,
  Settings,
  HelpCircle
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    icon: Users,
  },
  {
    title: "Research",
    icon: Search,
  },
  {
    title: "Campaigns",
    icon: Mail,
  },
  {
    title: "Analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    icon: Settings,
  },
];

export default function Sidebar() {

  return (

    <aside className="w-[272px] bg-white border-r border-slate-200 flex flex-col">

      <div className="h-[72px] border-b border-slate-200 px-6 flex items-center gap-3">

        {/* LOGO PLACEHOLDER */}

        <div className="w-11 h-11 rounded-xl bg-indigo-600"></div>

        <h1
          className="text-3xl font-semibold"
          style={{
            fontFamily: "Newsreader",
          }}
        >
          Lumora
        </h1>

      </div>

      <nav className="flex-1 px-4 py-6">

        {menu.map((item, index) => {

          const Icon = item.icon;

          return (

            <button
              key={item.title}
              className={`w-full flex items-center gap-4 rounded-xl px-4 py-3 mb-2 transition-all duration-200

              ${
                index === 0
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >

              <Icon size={20} />

              <span className="font-medium">

                {item.title}

              </span>

            </button>

          );

        })}

      </nav>

      <div className="border-t border-slate-200 p-4">

        <button className="w-full flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-slate-100 transition">

          <HelpCircle size={20} />

          Help

        </button>

      </div>

    </aside>

  );

}