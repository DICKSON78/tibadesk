import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import LabOrders from "./LabOrders";
import LabOrderRoutes from "./LabOrderRoutes";
import ReportsRoutes from "./ReportsRoutes";
import DentalMaterials from "./DentalMaterials";

const DentalLabRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/lab-orders" exact element={<LabOrders />} />
      <Route path="/lab-orders/:patientId/:consultationId/*" element={<LabOrderRoutes />} />
      <Route path="/materials" element={<DentalMaterials />} />
      <Route path="/reports/*" element={<ReportsRoutes />} />
      <Route path="" element={<Navigate to="dashboard" />} />
    </Routes>
  );
};

export default DentalLabRoutes;
