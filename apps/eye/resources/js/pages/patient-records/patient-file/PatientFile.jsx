import React, { useEffect, useRef, useState } from "react";

import { Card, CardContent, Chip, Divider, Stack } from "@mui/material";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import PatientFilePDF from "./PatientFilePDF";

import { useFetch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const PatientFile = ({ patient }) => {
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    patient_id: patient.id,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Patient File - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Consulted":
        return "success";
    }

    return "warning";
  };

  return (
    <React.Fragment>
      <Card sx={{ 
        borderTopLeftRadius: 0,
        width: "100%",
        bgcolor: "background.paper",
        boxShadow: 1,
      }}>
        <CardContent sx={{ p: 3 }}>
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
              },
              {
                field: "item_name",
                headerName: "Consultation Item",
                valueGetter: (item, index) => item.payment_cache_item.item.name,
              },
              {
                field: "consultant",
                headerName: "Consultant",
                valueGetter: (item, index) =>
                  item.payment_cache_item.consultant?.full_name,
              },
              {
                field: "created_at",
                headerName: "Date",
                valueGetter: (item) =>
                  item.payment_cache_item.served_at || item.created_at,
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={getStatusColor(item.status)}
                    label={item.status}
                  />
                ),
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
                      patient={patient}
                      consultationId={item.id}
                    />
                  </Stack>
                ),
              },
            ]}
            items={data.data}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default PatientFile;
