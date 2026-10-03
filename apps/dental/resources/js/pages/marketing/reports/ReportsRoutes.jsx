import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import PatientRegistration from "./PatientRegistration";
import Consultation from "../../consultation-room/reports/Consultation";
import CampaignPerformance from "./CampaignPerformance";
import LeadGeneration from "./LeadGeneration";
import CommunicationAnalytics from "./CommunicationAnalytics";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/marketing/reports/patient-registration" replace />} />
      <Route
        path="/patient-registration"
        element={<PatientRegistration />}
      />
      <Route
        path="/consultation"
        element={<Consultation />}
      />
      <Route
        path="/campaign-performance"
        element={<CampaignPerformance />}
      />
      <Route
        path="/lead-generation"
        element={<LeadGeneration />}
      />
      <Route
        path="/communication-analytics"
        element={<CommunicationAnalytics />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
