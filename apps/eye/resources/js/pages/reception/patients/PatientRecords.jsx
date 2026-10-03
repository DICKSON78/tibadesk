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

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import PatientDetails from "./PatientDetails";
import PatientFile from "../../patient-records/patient-file/PatientFile";
import PatientPaymentHistory from "../../patient-records/PatientPaymentHistory";
import PatientAttachments from "../../patient-records/patient-attachments/PatientAttachments";

const PatientRecords = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (!patientId) {
      return navigate("/reception/patients");
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
        { title: "Reception" },
        { title: "Patients/Customers" },
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
        <React.Fragment>
          <Tabs
            value={selectedTab}
            sx={{ mt: 2 }}
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
        </React.Fragment>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PatientRecords;
