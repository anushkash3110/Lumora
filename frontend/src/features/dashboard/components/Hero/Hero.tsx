import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="rounded-3xl bg-white border border-slate-200 p-10 shadow-sm">

      <p className="text-sm uppercase tracking-widest text-indigo-600 font-semibold">
        Welcome Back
      </p>

      <h1
        className="mt-2 text-5xl font-semibold text-slate-900"
        style={{ fontFamily: "Newsreader" }}
      >
        Good Afternoon, Anushka 👋
      </h1>

      <p className="mt-4 max-w-2xl text-slate-500 text-lg leading-8">
        Discover businesses, research opportunities,
        generate personalized outreach and convert
        prospects into long-term clients.
      </p>

      <button className="mt-8 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-white transition hover:bg-indigo-700">

        Continue Workspace

        <ArrowRight size={18} />

      </button>

    </section>
  );
}