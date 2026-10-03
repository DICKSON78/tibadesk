import React from "react";
import { Route, Routes } from "react-router-dom";
import GlassPatients from "./GlassPatients";
import GlassPatientRoutes from "./GlassPatientRoutes";

const GlassPatientsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        exact
        element={<GlassPatients />}
      />
      <Route
        path="/:patientId/:consultationId/*"
        element={<GlassPatientRoutes />}
      />
    </Routes>
  );
};

export default GlassPatientsRoutes;
