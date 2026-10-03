import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Patients from "./patients/Patients";
import CheckInPatient from "./CheckInPatient";
import PatientRecords from "./patients/PatientRecords";
import GlassPatientsRoutes from "./glass-patients/GlassPatientsRoutes";
import PatientsToReturn from "./patients-to-return/PatientsToReturn";
import SentMessages from "./sent-messages/Messages";
import ReportsRoutes from "./reports/ReportsRoutes";
import VipPatients from "./vip-patients/VipPatients";
import PatientWaitingTime from "./patient-waiting-timePatientWaitingTime";
import Appointments from "./appointments/Appointments";

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
        path="/glass-patients/*"
        element={<GlassPatientsRoutes />}
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
      <Route
        path="/appointments"
        element={<Appointments />}
      />
    </Routes>
  );
};

export default ReceptionRoutes;
