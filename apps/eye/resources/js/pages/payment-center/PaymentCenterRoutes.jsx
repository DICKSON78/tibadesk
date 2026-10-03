import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import PendingCashPayments from "./pending-cash-patients/PendingCashPatients";
import PendingCashPatientItems from "./pending-cash-patients/PendingPatientItems";
import PendingCreditPatients from "./pending-credit-patients/PendingCreditPatients";
import PendingCreditPatientItems from "./pending-credit-patients/PendingPatientItems";
import PatientBills from "./patient-bills/PatientBills";
import PartialPatientBills from "./patient-bills/PartialPatientBills";
import PatientBill from "./patient-bills/PatientBill";
import CompletedPayments from "./completed-payments/CompletedPayments";
import InstallmentManagementRoutes from "./installment-management/InstallmentManagementRoutes";
import InstallmentManagementDashboard from "./installment-management/InstallmentManagementDashboard";
import Expenses from "../financial-management/expenses/Expenses";
import ReportsRoutes from "./reports/ReportsRoutes";

const PaymentCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        exact
        element={<Dashboard />}
      />
      <Route
        path="/pending-cash-patients"
        exact
        element={<PendingCashPayments />}
      />
      <Route
        path="/pending-cash-patients/:patientId/:paymentCacheId"
        element={<PendingCashPatientItems />}
      />
      <Route
        path="/pending-credit-patients"
        exact
        element={<PendingCreditPatients />}
      />
      <Route
        path="/pending-credit-patients/:patientId/:paymentCacheId"
        element={<PendingCreditPatientItems />}
      />
      <Route
        path="/patient-bills/partial"
        exact
        element={<PartialPatientBills />}
      />
      <Route
        path="/patient-bills/:status"
        exact
        element={<PatientBills />}
      />
      <Route
        path="/patient-bills/:status/:patientId/:billId"
        element={<PatientBill />}
      />
      <Route
        path="/installment-management"
        exact
        element={<InstallmentManagementDashboard />}
      />
      <Route
        path="/installment-management/*"
        element={<InstallmentManagementRoutes />}
      />
      <Route
        path="/completed-payments"
        exact
        element={<CompletedPayments />}
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
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default PaymentCenterRoutes;
