import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import ProcedureRequests from "./procedure-requests/ProcedureRequests";
import ProcedureRequestRoutes from "./procedure-requests/ProcedureRequestRoutes";
import ReportsRoutes from "./ReportsRoutes";

const ProcedureRoomRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="procedure-requests"
        exact
        element={<ProcedureRequests />}
      />
      <Route
        path="procedure-requests/:patientId/:paymentCacheId/*"
        element={<ProcedureRequestRoutes />}
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

export default ProcedureRoomRoutes;
