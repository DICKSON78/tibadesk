import React from "react";
import { Route, Routes } from "react-router-dom";
import PatientItems from "../reports/PatientItems";
import MedicineItemBalance from "./reports/MedicineItemBalance";
import MedicineQuantityDispensed from "./reports/MedicineQuantityDispensed";
import MedicineAlerts from "./MedicineAlerts";

const ReportsRoutes = () => {
  return (
    <Routes>
      {/* Dispensing Reports */}
      <Route
        path="/dispensing/medicines-dispensed"
        element={
          <PatientItems
            module="Medicine Center"
            title="Medicines Dispensed Report"
            consultationType="Pharmacy"
            status="Served"
          />
        }
      />
      <Route
        path="/dispensing/medicines-not-dispensed"
        element={
          <PatientItems
            module="Medicine Center"
            title="Medicines Not Dispensed Report"
            consultationType="Pharmacy"
            status="Pending,Paid,Billed"
          />
        }
      />
      
      {/* Medicine Stock Management Reports */}
      <Route
        path="/stock-management/item-balance"
        element={
          <MedicineItemBalance
            module="Medicine Center"
            consultationType="Pharmacy"
          />
        }
      />
      <Route
        path="/stock-management/item-quantity-dispensed"
        element={
          <MedicineQuantityDispensed
            module="Medicine Center"
            consultationType="Pharmacy"
          />
        }
      />
      
      {/* Medicine Alerts */}
      <Route
        path="/medicine-alerts"
        element={<MedicineAlerts />}
      />
      
      {/* Legacy routes for backward compatibility */}
      <Route
        path="/medicines-dispensed"
        element={
          <PatientItems
            module="Medicine Center"
            title="Medicines Dispensed Report"
            consultationType="Pharmacy"
            status="Served"
          />
        }
      />
      <Route
        path="/medicines-not-dispensed"
        element={
          <PatientItems
            module="Medicine Center"
            title="Medicines Not Dispensed Report"
            consultationType="Pharmacy"
            status="Pending,Paid,Billed"
          />
        }
      />
      <Route
        path="/item-balance"
        element={
          <MedicineItemBalance
            module="Medicine Center"
            consultationType="Pharmacy"
          />
        }
      />
      <Route
        path="/item-quantity-dispensed"
        element={
          <MedicineQuantityDispensed
            module="Medicine Center"
            consultationType="Pharmacy"
          />
        }
      />
    </Routes>
  );
};

export default ReportsRoutes;
