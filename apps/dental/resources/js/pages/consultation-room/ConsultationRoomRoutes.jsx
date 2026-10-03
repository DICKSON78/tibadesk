import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import ConsultationPatients from "./ConsultationPatients";
import ConsultationPatientRoutes from "./ConsultationPatientRoutes";
import ReportsRoutes from "./reports/ReportsRoutes";
import ClinicalNotesList from "./clinical-notes/ClinicalNotesList";
import Prescriptions from "./prescriptions/Prescriptions";

const ConsultationRoomRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/consultation-patients/:status" exact element={<ConsultationPatients />} />
      <Route path="/consultation-patients/:status/:patientId/:consultationId/*" element={<ConsultationPatientRoutes />} />
      <Route path="/reports/*" element={<ReportsRoutes />} />
      <Route path="/clinical-notes" element={<ClinicalNotesList />} />
      <Route path="/prescriptions" element={<Prescriptions />} />
    </Routes>
  );
};

export default ConsultationRoomRoutes;
