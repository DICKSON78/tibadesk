import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import DispensingRoutes from "../dispensing/DispensingRoutes";
import MedicineAlerts from "./MedicineAlerts";
import Medicines from "./Medicines";
import EditMedicine from "./EditMedicine";
import AddMedicine from "./AddMedicine";
import MedicineTaking from "./MedicineTaking";
import CreateMedicineTaking from "./CreateMedicineTaking";
import MedicineItemBalance from "./reports/MedicineItemBalance";
import ReportsRoutes from "./ReportsRoutes";

const MedicineCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="dispensing-requests/*"
        element={<DispensingRoutes consultationType="Pharmacy" stockItem="Yes" />}
      />
              <Route
          path="medicine-alerts"
          element={<MedicineAlerts />}
        />
        <Route
          path="medicines"
          element={<Medicines />}
        />
        <Route
          path="medicines/:id/edit"
          element={<EditMedicine />}
        />
        <Route
          path="add-medicine"
          element={<AddMedicine />}
        />
        <Route
          path="medicine-taking"
          element={<MedicineTaking />}
        />
      <Route
        path="medicine-taking/create"
        element={<CreateMedicineTaking />}
      />
      <Route
        path="item-balance"
        element={
          <MedicineItemBalance
            module="Medicine Center"
            consultationType="Pharmacy"
          />
        }
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

export default MedicineCenterRoutes;
