import React from "react";
import { Route, Routes } from "react-router-dom";
import ItemQuantityDispensed from "./ItemQuantityDispensed";
import StockAlerts from "../StockAlerts";

const ReportsRoutes = () => {
  return (
    <Routes>
      {/* Stock Management Reports */}
      <Route
        path="/stock-management/item-quantity-dispensed"
        element={<ItemQuantityDispensed />}
      />
      
      {/* Stock Alerts */}
      <Route
        path="/stock-alerts"
        element={<StockAlerts />}
      />
      
      {/* Legacy routes for backward compatibility */}
      <Route
        path="/item-quantity-dispensed"
        element={<ItemQuantityDispensed />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
