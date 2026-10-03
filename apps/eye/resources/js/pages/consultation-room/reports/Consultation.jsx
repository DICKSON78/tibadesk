import React, { useEffect, useState } from "react";

import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import Filters from "../PatientFilters";
import PatientFilePDF from "../../patient-records/patient-file/PatientFilePDF";

import { formatDateForDb, getAge, getDateRangeTitle } from "../../../helpers";

const Consultation = () => {
  const [params, setParams] = useState({
    with_diagnoses: "Yes",
    patient_direction: "Direct to Doctor",
    status: "Consulted",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    item_payment_mode_id: undefined,
    disease_id: undefined,
    item_id: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  useEffect(() => {
    document.title = `Consultation Report - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: "Reports" },
        { title: "Consultation Report" },
      ]}
    >
      <Report
        title="Consultation Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/consultations"
        params={{
          ...params,
          start_date: params.start_date
            ? formatDateForDb(params.start_date)
            : undefined,
          end_date: params.end_date
            ? formatDateForDb(params.end_date)
            : undefined,
        }}
        prependInner={
          <Filters
            params={params}
            setParams={setParams}
            showDiagnosis
            showConsultant
            sx={{ mb: 2 }}
          />
        }
        columns={[
          {
            field: "full_name",
            headerName: "Patient Name",
            valueGetter: (item, index) =>
              item.payment_cache_item.payment_cache.check_in.patient.full_name,
          },
          {
            field: "patient_id",
            headerName: "Patient Number",
            valueGetter: (item, index) =>
              item.payment_cache_item.payment_cache.check_in.patient_id,
          },
          {
            field: "date_of_birth",
            headerName: "Age",
            valueGetter: (item, index) =>
              getAge(
                item.payment_cache_item.payment_cache.check_in.patient
                  .date_of_birth
              ),
          },
          {
            field: "gender",
            headerName: "Gender",
            valueGetter: (item, index) =>
              item.payment_cache_item.payment_cache.check_in.patient.gender,
          },
          {
            field: "phone",
            headerName: "Phone Number",
            valueGetter: (item, index) =>
              item.payment_cache_item.payment_cache.check_in.patient.phone,
          },
          {
            field: "consultant",
            headerName: "Consultant",
            valueGetter: (item, index) =>
              item.payment_cache_item.consultant?.full_name,
          },
          {
            field: "served_at",
            headerName: "Date Consulted",
            valueGetter: (item) => item.payment_cache_item.served_at,
          },
          {
            field: "item_name",
            headerName: "Consultation Item",
            valueGetter: (item, index) => item.payment_cache_item.item.name,
          },
          {
            field: "diagnosis",
            headerName: "Diagnosis",
            valueGetter: (item, index) =>
              item.diagnoses
                .map((e) => `${e.disease.code || ""} ${e.disease.name}`.trim())
                .join("; "),
          },
          {
            field: "actions",
            headerName: "Actions",
            renderCell: (item) => (
              <Stack
                direction="row"
                alignItems="center"
                divider={
                  <Divider
                    orientation="vertical"
                    sx={{ height: 16 }}
                  />
                }
                spacing={1}
              >
                <PatientFilePDF
                  size="small"
                  patient={
                    item.payment_cache_item.payment_cache.check_in.patient
                  }
                  consultationId={item.id}
                />
              </Stack>
            ),
            webOnly: true,
          },
        ]}
      />
    </Page>
  );
};

export default Consultation;
