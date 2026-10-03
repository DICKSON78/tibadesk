import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Skeleton } from "../../components/ui/index.jsx";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import PatientDetails from "../reception/patients/PatientDetails";
import DentalClinicalNotes from "./dental/DentalClinicalNotes";
import useFetch from "../../hooks/useFetch";

const ConsultationPatientRoutes = () => {
  const navigate = useNavigate();
  const { status, patientId, consultationId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();

  const { data: consultation, loading: loadingConsultation } = useFetch(
    `api/consultations/${consultationId}?with_diagnoses=Yes&with_items=Yes`,
    null,
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    if (!patientId || !consultationId) {
      navigate(`/consultation-room/consultation-patients/${status}`);
    }
  }, []);

  const getFromListTitle = () => {
    if (status === "pending") {
      return "Patients Sent to Doctor";
    }
    if (status === "consulted") {
      return "Consulted Patients";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: getFromListTitle() },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient || loadingConsultation ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}

      {patient && consultation ? (
        <Routes>
          <Route
            path="/clinical-notes"
            element={
              <DentalClinicalNotes
                patient={patient}
                consultation={consultation}
              />
            }
          />
        </Routes>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default ConsultationPatientRoutes;
