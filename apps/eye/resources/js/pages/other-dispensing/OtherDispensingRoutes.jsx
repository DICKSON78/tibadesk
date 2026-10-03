import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import DispensingRoutes from "../dispensing/DispensingRoutes";
import ReportsRoutes from "./ReportsRoutes";

const OtherDispensingRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="dispensing-requests/*"
        element={<DispensingRoutes consultationType="Others" stockItem="Yes" />}
      />
      <Route
        path=""
        element={<Navigate to="dashboard" />}
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default OtherDispensingRoutes;
