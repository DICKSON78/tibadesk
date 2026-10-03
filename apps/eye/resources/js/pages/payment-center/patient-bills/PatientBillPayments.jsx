import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import Table from "../../../components/Table";

import { useDelete, useFetch, usePost, useToast } from "../../../hooks";
import {
  formatError,
  getValidationRules,
  numberFormat,
} from "../../../helpers";

const validationRules = getValidationRules();

const PatientBillPayments = ({ bill, fetchBill, modal }) => {
  const addToast = useToast();

  const formRef = useRef();
  const paymentChannelRef = useRef();
  const amountRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();

  const { data: paymentChannels } = useFetch(
    "api/payment-channels",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const {
    data: billPayments,
    loading: loadingFetchBillPayments,
    error: errorFetchBillPayments,
    handleFetch: fetchBillPayments,
  } = useFetch(
    "api/patient-item-bill-payments",
    {
      bill_id: bill.id,
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [formData, setFormData] = useState({
    bill_id: bill.id,
    channel_id: undefined,
    amount: undefined,
  });

  const {
    data: dataPost,
    loading: loadingPost,
    error: errorPost,
    handlePost,
  } = usePost("api/patient-item-bill-payments", formData);
  const {
    data: dataDelete,
    loading: loadingDelete,
    error: errorDelete,
    handleDelete,
  } = useDelete();

  useEffect(() => {
    if (dataPost) {
      setData(dataPost);
      fetchBillPayments();
      fetchBill();
    }
  }, [dataPost]);

  useEffect(() => {
    if (dataDelete) {
      setData(dataDelete);
      fetchBillPayments();
      fetchBill();
    }
  }, [dataDelete]);

  useEffect(() => {
    if (errorFetchBillPayments) {
      setError(errorFetchBillPayments);
    }
  }, [errorFetchBillPayments]);

  useEffect(() => {
    if (errorPost) {
      setError(errorPost);
    }
  }, [errorPost]);

  useEffect(() => {
    if (errorDelete) {
      setError(errorDelete);
    }
  }, [errorDelete]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      setData(null);
      setError(null);
      handlePost();
    }
  };

  const handleSubmitDelete = (item) => {
    setData(null);
    setError(null);
    handleDelete(`api/patient-item-bill-payments/${item.id}`);
  };

  const getTotalAmount = () => {
    return billPayments.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  };

  return (
    <React.Fragment>
      {loadingFetchBillPayments || loadingPost || loadingDelete ? (
        <LinearProgress />
      ) : null}
      <CardContent>
        <Grid
          container
          spacing={2}
        >
          {bill.status === "Pending" ? (
            <Grid
              item
              md={4}
              sm={12}
              xs={12}
            >
              <Card variant="outlined">
                <CardHeader title="Add Bill Payment" />
                <Divider />
                <CardContent>
                  <Form ref={formRef}>
                    <Select
                      ref={paymentChannelRef}
                      label="Payment Channel"
                      fullWidth
                      required
                      options={paymentChannels}
                      optionsLabel="name"
                      optionsValue="id"
                      onChange={(value) =>
                        setFormData({ ...formData, channel_id: value })
                      }
                      containerProps={{ sx: { mb: 2 } }}
                    />
                    <TextField
                      ref={amountRef}
                      label="Amount"
                      fullWidth
                      required
                      rules={[validationRules.number]}
                      onChange={(value) =>
                        setFormData({ ...formData, amount: value })
                      }
                    />
                  </Form>
                </CardContent>
                <Divider />
                <Box p={2}>
                  <Button
                    disabled={loadingPost}
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                </Box>
              </Card>
            </Grid>
          ) : null}
          <Grid
            item
            md={bill.status === "Pending" ? 8 : 12}
            sm={12}
            xs={12}
          >
            <Card variant="outlined">
              {bill.status === "Pending" ? (
                <React.Fragment>
                  <CardHeader title="Bill Payments" />
                  <Divider />
                </React.Fragment>
              ) : null}
              <CardContent>
                <Table
                  loading={loadingFetchBillPayments}
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, index) => index + 1,
                    },
                    {
                      field: "channel_id",
                      headerName: "Payment Channel",
                      valueGetter: (item, index) => item.channel?.name,
                    },
                    {
                      field: "amount",
                      headerName: "Amount",
                      valueGetter: (item, index) =>
                        numberFormat(parseFloat(item.amount) || 0),
                    },
                    {
                      field: "created_by",
                      headerName: "Created By",
                      valueGetter: (item, index) => item.creator?.full_name,
                    },
                    {
                      field: "created_at",
                      headerName: "Date Created",
                    },
                    {
                      field: "actions",
                      headerName: "Actions",
                      renderCell: (item) => (
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              disabled={
                                loadingDelete || bill.status === "Cleared"
                              }
                              onClick={() => handleSubmitDelete(item)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ),
                    },
                  ]}
                  items={billPayments}
                  hidePaginationFooter
                  footerItems={[
                    [
                      { value: "TOTAL", tableCellProps: { colSpan: 2 } },
                      { value: numberFormat(getTotalAmount() || 0) },
                    ],
                  ]}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
      {modal && (
        <CardActions>
          <Box flexGrow={1} />
          <Button
            variant="outlined"
            size="large"
            color="secondary"
            onClick={() => modal.close()}
          >
            Close
          </Button>
        </CardActions>
      )}
    </React.Fragment>
  );
};

export default PatientBillPayments;