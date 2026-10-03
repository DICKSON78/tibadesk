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
import CreatePaymentChannel from "./CreatePaymentChannel";
import EditPaymentChannel from "./EditPaymentChannel";

import { useFetch, useToast } from "../../../hooks";
import { formatError, throttle } from "../../../helpers";

const PaymentChannels = () => {
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/payment-channels",
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
    document.title = `Payment Channels - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openCreatePaymentChannelModal = () => {
    let component = (
      <CreatePaymentChannel
        modal={modalRef.current}
        fetchPaymentChannels={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Payment Channel", component);
  };

  const openEditPaymentChannelModal = (item) => {
    let component = (
      <EditPaymentChannel
        item={item}
        modal={modalRef.current}
        fetchPaymentChannels={handleFetch}
      />
    );

    modalRef.current.open("Edit Payment Channel", component);
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
        { title: "Payment Channels" },
      ]}
    >
      <Card>
        <PageHeader
          title="Payment Channels"
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
                onClick={openCreatePaymentChannelModal}
              >
                New Payment Channel
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
                headerName: "Name",
              },
              {
                field: "description",
                headerName: "Description",
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
                field: "clinic_id",
                headerName: "Clinic",
                valueGetter: (item) => item.clinic?.name,
                show: window.user.role === "Admin",
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
                        onClick={() => openEditPaymentChannelModal(item)}
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

export default PaymentChannels;
