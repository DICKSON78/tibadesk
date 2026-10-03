import React from "react";
import { Route, Routes } from "react-router-dom";
import PatientItems from "../reports/PatientItems";
import ItemBalance from "../inventory-management/reports/ItemBalance";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/items-dispensed"
        element={
          <PatientItems
            module="Other Dispensing"
            title="Items Dispensed Report"
            consultationType="Others"
            stockItem="Yes"
            status="Served"
          />
        }
      />
      <Route
        path="/items-not-dispensed"
        element={
          <PatientItems
            module="Other Dispensing"
            title="Items Not Dispensed Report"
            consultationType="Others"
            stockItem="Yes"
            status="Pending,Paid,Billed"
          />
        }
      />
      <Route
        path="/item-balance"
        element={
          <ItemBalance
            module="Other Dispensing"
            consultationType="Others"
          />
        }
      />
    </Routes>
  );
};

export default ReportsRoutes;
