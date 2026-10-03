import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import DispensingRoutes from "./DispensingRoutes";
import ReportsRoutes from "./reports/ReportsRoutes";

const DispensingMainRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="dispensing-requests/*"
        element={
          <DispensingRoutes consultationType="Pharmacy" stockItem="Yes" />
        }
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
      <Route
        path=""
        element={<Navigate to="dashboard" />}
      />
    </Routes>
  );
};

export default DispensingMainRoutes;
