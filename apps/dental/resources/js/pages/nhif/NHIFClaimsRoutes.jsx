import React from "react";
import { Route, Routes } from "react-router-dom";
import NHIFClaims from "./NHIFClaims";

const NHIFClaimsRoutes = () => {
  return (
    <Routes>
      <Route path="" element={<NHIFClaims />} />
    </Routes>
  );
};

export default NHIFClaimsRoutes;
