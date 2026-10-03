import React, { useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";

import Skeleton from "@mui/material/Skeleton";

import Descriptions from "../../../components/Descriptions";
import SurgeryRecordReport from "./templates/SurgeryRecordReport";
import CataractSurgeryRecord from "./templates/CataractSurgeryRecord";

import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const ProcedureRequestItemRoutes = ({ patient }) => {
  const addToast = useToast();
  const { paymentCacheItemId } = useParams();

  const { data, setData, loading, error, handleFetch } = useFetch(
    `api/patient-payment-cache-items/${paymentCacheItemId}`,
    null,
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <React.Fragment>
      {loading ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}

      {data ? (
        <React.Fragment>
          <Descriptions
            columns={3}
            items={[
              { label: "Item Name", value: data.item.name },
              { label: "Quantity", value: numberFormat(data.quantity || 0) },
              { label: "Date Ordered", value: data.created_at },
            ]}
            containerProps={{
              variant: "outlined",
              sx: { p: 2, mb: 2 },
            }}
          />
          <Routes>
            <Route
              path="/surgery-record-report"
              element={
                <SurgeryRecordReport
                  patient={patient}
                  paymentCacheitem={data}
                />
              }
            />
            <Route
              path="/cataract-surgery-record"
              element={
                <CataractSurgeryRecord
                  patient={patient}
                  paymentCacheitem={data}
                />
              }
            />
          </Routes>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

export default ProcedureRequestItemRoutes;
