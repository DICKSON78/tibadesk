import React from "react";
import { Route, Routes } from "react-router-dom";
import PartialPatientBills from "../patient-bills/PartialPatientBills";
import CompletedPayments from "../completed-payments/CompletedPayments";

const InstallmentManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="/partial-payments"
        exact
        element={<PartialPatientBills />}
      />
      <Route
        path="/completed-payments"
        exact
        element={<CompletedPayments />}
      />
    </Routes>
  );
};

export default InstallmentManagementRoutes;
