import React from "react";
import { Route, Routes } from "react-router-dom";
import UnitsOfMeasure from "./units-of-measure/UnitsOfMeasure";
import Items from "./items/Items";

const ItemManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="/units-of-measure"
        element={<UnitsOfMeasure />}
      />
      <Route
        path="/items"
        element={<Items />}
      />
    </Routes>
  );
};

export default ItemManagementRoutes;
