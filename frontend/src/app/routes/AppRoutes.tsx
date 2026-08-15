import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DashboardPage from "@/features/dashboard/DashboardPage";
import LeadsPage from "@/features/leads/LeadsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<DashboardPage />}
      />

      <Route
        path="/leads"
        element={<LeadsPage />}
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}