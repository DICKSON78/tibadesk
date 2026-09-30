import React, { useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContextProvider } from "../contexts/ToastContext";
import { FilterProvider } from "../contexts/FilterContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import lightTheme from "../themes/light";
import darkTheme from "../themes/dark";

import AuthLayout from "../layouts/Auth";
import DefaultLayout from "../layouts/Default";
import PublicLayout from "../layouts/PublicLayout";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import HomePage from "../pages/public/HomePage";
import AboutPage from "../pages/public/AboutPage";
import ServicesPage from "../pages/public/ServicesPage";
import ProductsPage from "../pages/public/ProductsPage";
import FacilityPage from "../pages/public/FacilityPage";
import WhyChooseUsPage from "../pages/public/WhyChooseUsPage";
import TeamPage from "../pages/public/TeamPage";
import ContactPage from "../pages/public/ContactPage";
import BookAppointmentPage from "../pages/public/BookAppointmentPage";
import FAQPage from "../pages/public/FAQPage";
import PrivacyPage from "../pages/public/PrivacyPage";
import TermsPage from "../pages/public/TermsPage";
import OutreachPage from "../pages/public/OutreachPage";
import PartnersPage from "../pages/public/PartnersPage";
import BlogIndexPage from "../pages/public/BlogIndexPage";
import BlogShowPage from "../pages/public/BlogShowPage";
import ReceptionRoutes from "../pages/reception/ReceptionRoutes";
import PaymentCenterRoutes from "../pages/payment-center/PaymentCenterRoutes";
import ConsultationRoomRoutes from "../pages/consultation-room/ConsultationRoomRoutes";
import OpticianCenterRoutes from "../pages/optician-center/OpticianCenterRoutes";
import MedicineCenterRoutes from "../pages/medicine-center/MedicineCenterRoutes";
import ProcedureRoomRoutes from "../pages/procedure-room/ProcedureRoomRoutes";
import DispensingMainRoutes from "../pages/dispensing/DispensingMainRoutes";
import OtherDispensingRoutes from "../pages/other-dispensing/OtherDispensingRoutes";
import InventoryManagementRoutes from "../pages/inventory-management/InventoryManagementRoutes";
import MarketingRoutes from "../pages/marketing/MarketingRoutes";
import FinancialManagementRoutes from "../pages/financial-management/FinancialManagementRoutes";
import UserManagementRoutes from "../pages/user-management/UserManagementRoutes";
import PatientRecordsRoutes from "../pages/patient-records/PatientRecordsRoutes";
import SettingsRoutes from "../pages/settings/SettingsRoutes";

const App = () => {
  const [themeMode, setThemeMode] = useState(
    window.localStorage.getItem("theme_mode") || "light"
  );

  const theme = useMemo(() => {
    return themeMode === "light" ? lightTheme : darkTheme;
  }, [themeMode]);

  const [user, setUser] = useState();
  const [smsBalance, setSmsBalance] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <ToastContextProvider>
        <FilterProvider>
          <NotificationProvider>
            <CssBaseline />
            <GlobalStyles
              styles={{
                "*::selection": {
                  backgroundColor: theme.palette.primary.main,
                  color: "#fff",
                },
              }}
            />
            <Router
              // TibaDesk mounts this application at /apps/eye, so every route
              // the user is looking at is really /apps/eye/<route>. Without
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
            {/* Public website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/facility" element={<FacilityPage />} />
              <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/book" element={<BookAppointmentPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/outreach" element={<OutreachPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/blog" element={<BlogIndexPage />} />
              <Route path="/blog/:slug" element={<BlogShowPage />} />
            </Route>

            {/* Login */}
            <Route path="/login" element={<AuthLayout />}>
              <Route index element={<Login />} />
            </Route>

            {/* Admin */}
            <Route path="/*" element={<DefaultLayout
                  setThemeMode={setThemeMode}
                  setUser={setUser}
                  smsBalance={smsBalance}
                />
              }
            >
              <Route
                path="dashboard"
                element={
                  user?.privileges?.dashboard ? (
                    <Dashboard setSmsBalance={setSmsBalance} />
                  ) : null
                }
              />
              <Route
                path="patient-records/*"
                element={<PatientRecordsRoutes />}
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
                path="optician-center/*"
                element={
                  user?.privileges?.optician_center ? (
                    <OpticianCenterRoutes />
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
                  <>
                    {user?.privileges?.dispensing ? (
                      <DispensingMainRoutes />
                    ) : (
                      <div>No dispensing privileges</div>
                    )}
                  </>
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
            </Route>
          </Routes>
            </Router>
          </NotificationProvider>
        </FilterProvider>
      </ToastContextProvider>
    </ThemeProvider>
  );
};

export default App;
