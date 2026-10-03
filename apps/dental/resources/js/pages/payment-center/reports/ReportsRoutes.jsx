import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import DailyCashCollection from "./DailyCashCollection";
import DailyCreditCollection from "./DailyCreditCollection";
import Expenses from "../../financial-management/reports/Expenses";
import PartnerFramePayments from "./PartnerFramePayments";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/daily-cash-collection" />}
      />
      <Route
        path="/daily-cash-collection"
        element={<DailyCashCollection />}
      />
      <Route
        path="/daily-credit-collection"
        element={<DailyCreditCollection />}
      />
      <Route
        path="/expenses"
        element={
          <Expenses
            module="Payment Center"
            createdBy={window.user.id}
          />
        }
      />
      <Route
        path="/partner-frame-payments"
        element={<PartnerFramePayments />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
