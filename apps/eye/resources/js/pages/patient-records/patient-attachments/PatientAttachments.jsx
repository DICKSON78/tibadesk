import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import CreatePatientAttachment from "./CreatePatientAttachment";
import EditPatientAttachment from "./EditPatientAppointment";

import { useFetch, useToast } from "../../../hooks";
import { formatError, getFileExtension } from "../../../helpers";

const PatientAttachments = ({ patient, readOnly }) => {
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    patient_id: patient.id,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patient-attachments",
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
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openCreatePatientAttachmentModal = () => {
    let component = (
      <CreatePatientAttachment
        patient={patient}
        modal={modalRef.current}
        fetchPatientAttachments={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Attachment", component, "sm");
  };

  const openEditPatientAttachmentModal = (item) => {
    let component = (
      <EditPatientAttachment
        item={item}
        modal={modalRef.current}
        fetchPatientAttachments={handleFetch}
      />
    );

    modalRef.current.open("Edit Attachment", component, "sm");
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
                field: "title",
                headerName: "Title",
              },
              {
                field: "description",
                headerName: "Description",
              },
              {
                field: "path",
                headerName: "Attachment",
                renderCell: (item) => (
                  <Tooltip title="View attachment">
                    <Chip
                      size="small"
                      color="primary"
                      label={getFileExtension(item.path)}
                      clickable
                      onClick={() => window.open(`/${item.path}`, "_blank")}
                    />
                  </Tooltip>
                ),
              },
              {
                field: "created_by",
                headerName: "Created By",
                valueGetter: (item) => item.creator?.full_name,
              },
              {
                field: "created_at",
                headerName: "Date Created",
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
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditPatientAttachmentModal(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ),
                show: !readOnly,
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
            footerItems={
              !readOnly
                ? [
                    [
                      { value: "", tableCellProps: { colSpan: 6 } },
                      {
                        value: (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={openCreatePatientAttachmentModal}
                          >
                            New Attachment
                          </Button>
                        ),
                      },
                    ],
                  ]
                : null
            }
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default PatientAttachments;
