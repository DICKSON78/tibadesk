import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import PatientRegistration from "./PatientRegistration";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/reception/reports/patient-registration" replace />} />
      <Route
        path="/patient-registration"
        element={<PatientRegistration />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
