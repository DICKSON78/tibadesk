import React from "react";
import { Route, Routes } from "react-router-dom";
import Consultation from "./Consultation";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/consultation"
        element={<Consultation />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
