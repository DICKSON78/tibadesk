import React from "react";
import { Route, Routes } from "react-router-dom";
import Patients from "./Patients";
import PatientRoutes from "./PatientRoutes";

const PatientRecordsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/patients"
        exact
        element={<Patients />}
      />
      <Route
        path="/patients/:patientId/*"
        element={<PatientRoutes />}
      />
    </Routes>
  );
};

export default PatientRecordsRoutes;
