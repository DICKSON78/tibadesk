import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import ConsultationPatients from "./GlassPatients";
import ConsultationPatientRoutes from "./GlassPatientRoutes";
import DispensingRoutes from "../dispensing/DispensingRoutes";
import ReportsRoutes from "./ReportsRoutes";

const OpticianCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/glass-patients"
        exact
        element={<ConsultationPatients />}
      />
      <Route
        path="/glass-patients/:patientId/:consultationId/*"
        element={<ConsultationPatientRoutes />}
      />
      <Route
        path="dispensing-requests/*"
        element={<DispensingRoutes consultationType="Glass" />}
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default OpticianCenterRoutes;
