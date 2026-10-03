import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Expenses from "./Expenses";
import ExpensePayments from "./ExpensePayments";
import CashCollection from "../../payment-center/reports/CashCollection";
import CreditCollection from "../../payment-center/reports/CreditCollection";
import PatientBills from "../../payment-center/reports/PatientBills";
import BillPayments from "../../payment-center/reports/BillPayments";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/cash-collection"
        element={<CashCollection module="Financial Management" />}
      />
      <Route
        path="/credit-collection"
        element={<CreditCollection module="Financial Management" />}
      />
      <Route
        path="/pending-patient-bills"
        element={
          <PatientBills
            status="Pending"
            module="Financial Management"
          />
        }
      />
      <Route
        path="/cleared-patient-bills"
        element={
          <PatientBills
            status="Cleared"
            module="Financial Management"
          />
        }
      />
      <Route
        path="/patient-bill-payments"
        element={<BillPayments module="Financial Management" />}
      />
      <Route
        path="/expenses"
        element={<Expenses />}
      />
      <Route
        path="/expense-payments"
        element={<ExpensePayments />}
      />
      <Route
        path=""
        element={<Navigate to="/cash-collection" />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
