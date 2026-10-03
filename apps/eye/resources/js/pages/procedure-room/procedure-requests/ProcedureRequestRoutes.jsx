import React, { useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";

import Skeleton from "@mui/material/Skeleton";

import Page from "../../../components/Page";
import PatientDetails from "../../reception/patients/PatientDetails";
import ProcedureRequestItems from "./ProcedureRequestItems";
import ProcedureRequestItemRoutes from "./ProcedureRequestItemRoutes";

const ProcedureRequestRoutes = () => {
  const { patientId, paymentCacheId } = useParams();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();

  return (
    <Page>
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
        <Routes>
          <Route
            path="/"
            exact
            element={
              <ProcedureRequestItems
                patient={patient}
                paymentCacheId={paymentCacheId}
              />
            }
          />
          <Route
            path="/:paymentCacheItemId/*"
            element={
              <ProcedureRequestItemRoutes
                patient={patient}
                paymentCacheId={paymentCacheId}
              />
            }
          />
        </Routes>
      ) : null}
    </Page>
  );
};

export default ProcedureRequestRoutes;
