import {
  Sparkles,
  Upload,
  Search,
  Mail,
} from "lucide-react";

export default function AIWorkspace() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">

          <Sparkles
            className="text-indigo-600"
            size={24}
          />

        </div>

        <div>

          <h2 className="text-2xl font-semibold">

            AI Workspace

          </h2>

          <p className="text-slate-500">

            What do you want Lumora to do today?

          </p>

        </div>

      </div>

      <div className="grid grid-cols-3 gap-5 mt-8">

        <button className="rounded-2xl border border-slate-200 p-6 text-left hover:border-indigo-500 transition">

          <Upload className="mb-4 text-indigo-600"/>

          <h3 className="font-semibold">

            Import Google Sheet

          </h3>

        </button>

        <button className="rounded-2xl border border-slate-200 p-6 text-left hover:border-indigo-500 transition">

          <Search className="mb-4 text-indigo-600"/>

          <h3 className="font-semibold">

            Research Companies

          </h3>

        </button>

        <button className="rounded-2xl border border-slate-200 p-6 text-left hover:border-indigo-500 transition">

          <Mail className="mb-4 text-indigo-600"/>

          <h3 className="font-semibold">

            Generate Emails

          </h3>

        </button>

      </div>

    </section>
  );
}