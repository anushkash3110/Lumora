import { Routes, Route } from "react-router-dom";
import DashboardPage from "../../features/dashboard/DashboardPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
    </Routes>
  );
}