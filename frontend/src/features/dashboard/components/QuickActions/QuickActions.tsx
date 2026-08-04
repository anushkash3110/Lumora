import {
    Upload,
    Search,
    Mail,
    Rocket
} from "lucide-react";

const actions = [
    {
        icon: Upload,
        title: "Import Leads",
    },
    {
        icon: Search,
        title: "Research",
    },
    {
        icon: Mail,
        title: "Generate Email",
    },
    {
        icon: Rocket,
        title: "Campaign",
    },
];

export default function QuickActions() {

    return (

        <section>

            <h2 className="text-2xl font-semibold mb-6">

                Quick Actions

            </h2>

            <div className="grid grid-cols-4 gap-5">

                {actions.map((action) => {

                    const Icon = action.icon;

                    return (

                        <button
                            key={action.title}
                            className="rounded-2xl border border-slate-200 bg-white p-8 hover:border-indigo-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                        >

                            <Icon
                                size={28}
                                className="text-indigo-600 mb-5"
                            />

                            <p className="font-semibold">

                                {action.title}

                            </p>

                        </button>

                    );

                })}

            </div>

        </section>

    );

}