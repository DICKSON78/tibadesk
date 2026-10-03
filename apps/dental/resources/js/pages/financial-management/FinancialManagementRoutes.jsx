import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Expenses from "./expenses/Expenses";
import ExpensePayments from "./expenses/ExpensePayments";
import ReportsRoutes from "./reports/ReportsRoutes";

const FinancialManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="expenses"
        element={<Expenses />}
      />
      <Route
        path="expense-payments"
        element={<ExpensePayments />}
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

export default FinancialManagementRoutes;
