import { Routes, Route, Navigate } from "react-router-dom";

import DashboardPage from "@/features/dashboard/DashboardPage";
import LeadsPage from "@/features/leads/LeadsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<DashboardPage />} />

      {/* Leads */}
      <Route path="/leads" element={<LeadsPage />} />

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}