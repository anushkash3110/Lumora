import Hero from "./components/Hero";
import QuickActions from "./components/QuickActions";
import StatsGrid from "./components/StatsGrid";
import AIWorkspace from "./components/AIWorkspace";

export default function DashboardPage() {
  return (
    <div className="space-y-10">

      <Hero />

      <QuickActions />

      <StatsGrid />

      <AIWorkspace />

    </div>
  );
}