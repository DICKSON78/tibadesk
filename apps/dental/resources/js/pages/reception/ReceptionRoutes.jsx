import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Patients from "./patients/Patients";
import CheckInPatient from "./CheckInPatient";
import PatientRecords from "./patients/PatientRecords";
import PatientsToReturn from "./patients-to-return/PatientsToReturn";
import SentMessages from "./sent-messages/Messages";
import ReportsRoutes from "./reports/ReportsRoutes";
import VipPatients from "./vip-patients/VipPatients";
import PatientWaitingTime from "./patient-waiting-timePatientWaitingTime";

const ReceptionRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/patients"
        exact
        element={<Patients />}
      />
      <Route
        path="/patients/:patientId/check-in"
        element={<CheckInPatient />}
      />
      <Route
        path="/patients/:patientId/records/*"
        element={<PatientRecords />}
      />
      <Route
        path="/vip-patients"
        element={<VipPatients />}
      />
      <Route
        path="/patient-waiting-time"
        element={<PatientWaitingTime />}
      />
      <Route
        path="/to-return/patients"
        element={<PatientsToReturn />}
      />
      <Route
        path="/sent-messages"
        element={<SentMessages />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default ReceptionRoutes;
