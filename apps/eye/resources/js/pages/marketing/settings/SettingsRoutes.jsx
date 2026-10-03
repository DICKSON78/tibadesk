import React from "react";
import { Route, Routes } from "react-router-dom";
import InformationSources from "./information-sources/InformationSources";

const SettingsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/information-sources"
        element={<InformationSources />}
      />
    </Routes>
  );
};

export default SettingsRoutes;
