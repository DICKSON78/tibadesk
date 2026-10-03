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
import Page, { Header as PageHeader } from "../../../components/Page";
import Table, { SearchTextField } from "../../../components/Table";
import Modal from "../../../components/Modal";
import CreateClinic from "./CreateClinic";
import EditClinic from "./EditClinic";

import { useFetch, useToast } from "../../../hooks";
import { formatError, throttle } from "../../../helpers";

const Clinics = () => {
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/clinics",
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
    document.title = `Clinics - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openCreateClinicModal = () => {
    let component = (
      <CreateClinic
        modal={modalRef.current}
        fetchClinics={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Clinic", component);
  };

  const openEditClinicModal = (item) => {
    let component = (
      <EditClinic
        item={item}
        modal={modalRef.current}
        fetchClinics={handleFetch}
      />
    );

    modalRef.current.open("Edit Clinic", component);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
    }

    return "neutral";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Settings" },
        { title: "Clinics" },
      ]}
    >
      <Card>
        <PageHeader
          title="Clinics"
          trailing={
            <React.Fragment>
              <SearchTextField
                onChange={(value) =>
                  throttle(() => setParams({ ...params, q: value }), 1000)
                }
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateClinicModal}
              >
                New Clinic
              </Button>
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
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
                field: "name",
                headerName: "Clinic Name",
              },
              {
                field: "phone",
                headerName: "Phone",
              },
              {
                field: "email",
                headerName: "Email",
              },
              {
                field: "address",
                headerName: "Address",
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
                show: false,
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
                        onClick={() => openEditClinicModal(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
    </Page>
  );
};

export default Clinics;
