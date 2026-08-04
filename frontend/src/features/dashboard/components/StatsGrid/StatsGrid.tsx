import {
  Users,
  Mail,
  TrendingUp,
  Rocket,
} from "lucide-react";

const stats = [
  {
    title: "Total Leads",
    value: "1,245",
    icon: Users,
  },
  {
    title: "Emails Sent",
    value: "367",
    icon: Mail,
  },
  {
    title: "Reply Rate",
    value: "42%",
    icon: TrendingUp,
  },
  {
    title: "Campaigns",
    value: "8",
    icon: Rocket,
  },
];

export default function StatsGrid() {
  return (
    <section>

      <h2 className="text-2xl font-semibold mb-6">
        Overview
      </h2>

      <div className="grid grid-cols-4 gap-5">

        {stats.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-slate-500">
                    {item.title}
                  </p>

                  <h3 className="text-4xl font-bold mt-4">
                    {item.value}
                  </h3>

                </div>

                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">

                  <Icon
                    size={24}
                    className="text-indigo-600"
                  />

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
}