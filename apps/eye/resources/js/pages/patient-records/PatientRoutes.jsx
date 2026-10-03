import React, { useEffect, useRef, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import Skeleton from "@mui/material/Skeleton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import PatientDetails from "../reception/patients/PatientDetails";
import PatientFile from "./patient-file/PatientFile";
import PatientPaymentHistory from "./PatientPaymentHistory";
import PatientAttachments from "./patient-attachments/PatientAttachments";

const PatientRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (!patientId) {
      return navigate("/patient-records/patients");
    }

    document.title = `Patient Records - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (location.pathname.indexOf("/patient-file") !== -1) {
      setSelectedTab(0);
    } else if (location.pathname.indexOf("/payment-history") !== -1) {
      setSelectedTab(1);
    } else if (location.pathname.indexOf("/attachments") !== -1) {
      setSelectedTab(2);
    }
  }, [location.pathname]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Patient Records" },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}

      {patient ? (
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={selectedTab}
            sx={{ 
              mt: 2,
              mb: 2,
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "0.7875rem",
                textTransform: "none",
                minHeight: 48,
              },
              "& .Mui-selected": {
                color: "primary.main",
              },
            }}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              label="Patient File"
              onClick={() => navigate("patient-file")}
            />
            <Tab
              label="Payment History"
              onClick={() => navigate("payment-history")}
            />
            <Tab
              label="Attachments"
              onClick={() => navigate("attachments")}
            />
          </Tabs>
          <Routes>
            <Route
              path="/patient-file"
              element={<PatientFile patient={patient} />}
            />
            <Route
              path="/payment-history"
              element={<PatientPaymentHistory patient={patient} />}
            />
            <Route
              path="/attachments"
              element={<PatientAttachments patient={patient} />}
            />
          </Routes>
        </Box>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PatientRoutes;
