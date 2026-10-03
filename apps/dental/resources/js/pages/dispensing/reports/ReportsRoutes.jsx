import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ItemsDispensed from "./ItemsDispensed";
import ItemsNotDispensed from "./ItemsNotDispensed";
import ItemBalance from "./ItemBalance";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="items-dispensed"
        element={<ItemsDispensed />}
      />
      <Route
        path="items-not-dispensed"
        element={<ItemsNotDispensed />}
      />
      <Route
        path="item-balance"
        element={<ItemBalance />}
      />
      <Route
        path=""
        element={<Navigate to="items-dispensed" />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
