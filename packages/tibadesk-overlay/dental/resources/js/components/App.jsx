import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { ToastContextProvider } from "../contexts/ToastContext";
import { FilterProvider } from "../contexts/FilterContext";
import { NotificationProvider } from "../contexts/NotificationContext";

import AuthLayout from "../layouts/Auth";
import DefaultLayout from "../layouts/Default";
import Login from "../pages/auth/Login";
import NoAccess from "../pages/NoAccess";
import Dashboard from "../pages/dashboard/Dashboard";
import ReceptionRoutes from "../pages/reception/ReceptionRoutes";
import PaymentCenterRoutes from "../pages/payment-center/PaymentCenterRoutes";
import ConsultationRoomRoutes from "../pages/consultation-room/ConsultationRoomRoutes";
import DentalLabRoutes from "../pages/dental-lab/DentalLabRoutes";
import MedicineCenterRoutes from "../pages/medicine-center/MedicineCenterRoutes";
import ProcedureRoomRoutes from "../pages/procedure-room/ProcedureRoomRoutes";
import DispensingMainRoutes from "../pages/dispensing/DispensingMainRoutes";
import OtherDispensingRoutes from "../pages/other-dispensing/OtherDispensingRoutes";
import InventoryManagementRoutes from "../pages/inventory-management/InventoryManagementRoutes";
import MarketingRoutes from "../pages/marketing/MarketingRoutes";
import FinancialManagementRoutes from "../pages/financial-management/FinancialManagementRoutes";
import DentalMorbidityReport from "../pages/reports/dental/DentalMorbidityReport";
import DentalAppointments from "../pages/appointments/DentalAppointments";
import UserManagementRoutes from "../pages/user-management/UserManagementRoutes";
import PatientRecordsRoutes from "../pages/patient-records/PatientRecordsRoutes";
import SettingsRoutes from "../pages/settings/SettingsRoutes";
import MohReportsRoutes from "../pages/moh-reports/MohReportsRoutes";
import NHIFClaimsRoutes from "../pages/nhif/NHIFClaimsRoutes";
import DentalDHIS2Summary from "../pages/reports/dental/DentalDHIS2Summary";
import TIBADeskDashboard from "../tibadesk/Dashboard";
import SessionGate from "./SessionGate";

const MODULE_DASHBOARD_MAP = {
  reception: "/reception/dashboard",
  payment_center: "/payment-center/dashboard",
  consultation_room: "/consultation-room/dashboard",
  dental_lab: "/dental-lab/dashboard",
  medicine_center: "/medicine-center/dashboard",
  procedure_room: "/procedure-room/dashboard",
  dispensing: "/dispensing/dashboard",
  other_dispensing: "/other-dispensing/dashboard",
  inventory_management: "/inventory-management/dashboard",
  marketing: "/marketing/dashboard",
  financial_management: "/financial-management/dashboard",
};

const getHomeRoute = (user) => {
  // While the user/privileges are still loading, don't redirect yet
  if (!user) return null;
  if (user?.privileges?.dashboard) return "/dashboard";
  const privs = Object.keys(user?.privileges || {});
  for (const key of Object.keys(MODULE_DASHBOARD_MAP)) {
    if (privs.includes(key)) return MODULE_DASHBOARD_MAP[key];
  }
  return "/login";
};

const App = () => {
  const [user, setUser] = useState();
  const [smsBalance, setSmsBalance] = useState(0);

  return (
    <ToastContextProvider>
      <FilterProvider>
        <NotificationProvider>
          <Router
            // TibaDesk mounts this application at /apps/dental, so every route
            // the user is looking at is really /apps/dental/<route>. Without
            // this the router reads the mount as the route name, matches
            // nothing, and the application falls through to its own 404 on
            // every navigation — including the first one.
            basename={import.meta.env.VITE_APP_MOUNT ?? ''}
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route
                path="/"
                exact
                element={<SessionGate />}
              />
            <Route
              path="/tibadesk"
              element={<TIBADeskDashboard />}
            />
            <Route
              path="/"
              element={<AuthLayout />}
            >
                <Route
                  path="/login"
                  element={<Login />}
                />

                {/* Where the session gate sends a signed-in user who holds no
                    module. Without this the gate navigates to a route that does
                    not exist, and they get a blank page rather than an
                    explanation. */}
                <Route
                  path="/no-access"
                  element={<NoAccess />}
                />
              </Route>
            <Route
              path="/"
              element={
                <DefaultLayout
                  setUser={setUser}
                  smsBalance={smsBalance}
                />
              }
            >
              <React.Fragment>
                <Route
                  path="dashboard"
                  element={
                    user ? (
                      user?.privileges?.dashboard ? (
                        <Dashboard setSmsBalance={setSmsBalance} />
                      ) : (
                        <Navigate to={getHomeRoute(user)} />
                      )
                    ) : null
                  }
                />
                <Route
                  path="patient-records/*"
                  element={
                    user?.privileges?.reception || user?.privileges?.consultation_room ? (
                      <PatientRecordsRoutes />
                    ) : null
                  }
                />
                <Route
                  path="reception/*"
                  element={
                    user?.privileges?.reception ? <ReceptionRoutes /> : null
                  }
                />
                <Route
                  path="payment-center/*"
                  element={
                    user?.privileges?.payment_center ? (
                      <PaymentCenterRoutes />
                    ) : null
                  }
                />
                <Route
                  path="consultation-room/*"
                  element={
                    user?.privileges?.consultation_room ? (
                      <ConsultationRoomRoutes />
                    ) : null
                  }
                />
                <Route
                  path="dental-lab/*"
                  element={
                    user?.privileges?.dental_lab ? (
                      <DentalLabRoutes />
                    ) : null
                  }
                />
                <Route
                  path="medicine-center/*"
                  element={
                    user?.privileges?.medicine_center ? (
                      <MedicineCenterRoutes />
                    ) : null
                  }
                />
                <Route
                  path="dispensing/*"
                  element={
                    user?.privileges?.dispensing ? (
                      <DispensingMainRoutes />
                    ) : null
                  }
                />
                <Route
                  path="procedure-room/*"
                  element={
                    user?.privileges?.procedure_room ? (
                      <ProcedureRoomRoutes />
                    ) : null
                  }
                />
                <Route
                  path="other-dispensing/*"
                  element={
                    user?.privileges?.other_dispensing ? (
                      <OtherDispensingRoutes />
                    ) : null
                  }
                />
                <Route
                  path="inventory-management/*"
                  element={
                    user?.privileges?.inventory_management ? (
                      <InventoryManagementRoutes />
                    ) : null
                  }
                />
                <Route
                  path="marketing/*"
                  element={
                    user?.privileges?.marketing ? <MarketingRoutes /> : null
                  }
                />
                <Route
                  path="financial-management/*"
                  element={
                    user?.privileges?.financial_management ? (
                      <FinancialManagementRoutes />
                    ) : null
                  }
                />
                <Route
                  path="user-management/*"
                  element={
                    user?.privileges?.user_management ? (
                      <UserManagementRoutes />
                    ) : null
                  }
                />
                <Route
                  path="settings/*"
                  element={
                    user?.privileges?.settings ? <SettingsRoutes /> : null
                  }
                />
                <Route
                  path="reports/dental-morbidity"
                  element={
                    user?.privileges?.consultation_room ? (
                      <DentalMorbidityReport />
                    ) : null
                  }
                />
                <Route
                  path="reports/dental-dhis2-summary"
                  element={
                    user?.privileges?.consultation_room ? (
                      <DentalDHIS2Summary />
                    ) : null
                  }
                />
                <Route
                  path="dental-appointments"
                  element={
                    user?.privileges?.consultation_room ? (
                      <DentalAppointments />
                    ) : null
                  }
                />
                <Route
                  path="moh-reports/*"
                  element={
                    user?.privileges?.consultation_room ? (
                      <MohReportsRoutes />
                    ) : null
                  }
                />
                <Route
                  path="nhif-claims/*"
                  element={
                    user?.privileges?.payment_center ? (
                      <NHIFClaimsRoutes />
                    ) : null
                  }
                />
              </React.Fragment>
            </Route>
          </Routes>
          </Router>
        </NotificationProvider>
      </FilterProvider>
    </ToastContextProvider>
  );
};

export default App;
