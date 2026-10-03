import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Stocktaking from "./Stocktaking";
import StockOut from "./StockOut";
import StockMovements from "./StockMovements";
import StockAlerts from "./StockAlerts";
import DentalMaterialsStock from "./DentalMaterialsStock";
import ReportsRoutes from "./reports/ReportsRoutes";

const InventoryManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="stocktaking"
        element={<Stocktaking />}
      />
      <Route
        path="stock-out"
        element={<StockOut />}
      />
      <Route
        path="stock-movements"
        element={<StockMovements />}
      />
      <Route
        path="stock-alerts"
        element={<StockAlerts />}
      />
      <Route
        path="dental-materials-stock"
        element={<DentalMaterialsStock />}
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

export default InventoryManagementRoutes;
