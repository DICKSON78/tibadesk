import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Stocktaking from "./Stocktaking";
import StockAlerts from "./StockAlerts";
import LensStock from "./LensStock";
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
        path="stock-alerts"
        element={<StockAlerts />}
      />
      <Route
        path="lens-stock"
        element={<LensStock />}
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
