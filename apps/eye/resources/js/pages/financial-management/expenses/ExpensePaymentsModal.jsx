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
import Table from "../../../components/Table";

import { useDelete, useFetch, usePost, useToast } from "../../../hooks";
import {
  formatError,
  getValidationRules,
  numberFormat,
} from "../../../helpers";

const validationRules = getValidationRules();

const ExpensePaymentsModal = ({ expense, fetchExpenses, modal }) => {
  const addToast = useToast();

  const formRef = useRef();
  const amountRef = useRef();
  const descriptionRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();

  const {
    data: expensePayments,
    loading: loadingFetchExpensePayments,
    error: errorFetchExpensePayments,
    handleFetch: fetchExpensePayments,
  } = useFetch(
    "api/expense-payments",
    {
      expense_id: expense.id,
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [formData, setFormData] = useState({
    expense_id: expense.id,
    amount: undefined,
    description: undefined,
  });

  const {
    data: dataPost,
    loading: loadingPost,
    error: errorPost,
    handlePost,
  } = usePost("api/expense-payments", formData);
  const {
    data: dataDelete,
    loading: loadingDelete,
    error: errorDelete,
    handleDelete,
  } = useDelete();

  useEffect(() => {
    if (dataPost) {
      setData(dataPost);
      fetchExpensePayments();
      fetchExpenses();
    }
  }, [dataPost]);

  useEffect(() => {
    if (dataDelete) {
      setData(dataDelete);
      fetchExpensePayments();
      fetchExpenses();
    }
  }, [dataDelete]);

  useEffect(() => {
    if (errorFetchExpensePayments) {
      setError(errorFetchExpensePayments);
    }
  }, [errorFetchExpensePayments]);

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
    handleDelete(`api/expense-payments/${item.id}`);
  };

  const getTotalAmount = () => {
    return expensePayments.reduce((acc, e) => acc + e.amount, 0);
  };

  return (
    <React.Fragment>
      {loadingPost || loadingDelete ? <LinearProgress /> : null}
      <CardContent>
        <Grid
          container
          spacing={2}
        >
          {expense.paid_amount < expense.total_amount ? (
            <Grid
              item
              md={4}
              sm={12}
              xs={12}
            >
              <Card variant="outlined">
                <CardHeader title="Add Expense Payment" />
                <Divider />
                <CardContent>
                  <Form ref={formRef}>
                    <TextField
                      ref={amountRef}
                      label="Amount"
                      fullWidth
                      required
                      rules={[validationRules.number]}
                      onChange={(value) =>
                        setFormData({ ...formData, amount: value })
                      }
                      containerProps={{ mb: 2 }}
                    />
                    <TextField
                      ref={descriptionRef}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      onChange={(value) =>
                        setFormData({ ...formData, description: value })
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
            md={expense.paid_amount < expense.total_amount ? 8 : 12}
            sm={12}
            xs={12}
          >
            <Card variant="outlined">
              {expense.status === "Pending" ? (
                <React.Fragment>
                  <CardHeader title="Expense Payments" />
                  <Divider />
                </React.Fragment>
              ) : null}
              <CardContent>
                <Table
                  loading={loadingFetchExpensePayments}
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, index) => index + 1,
                    },
                    {
                      field: "amount",
                      headerName: "Amount",
                      valueGetter: (item, index) =>
                        numberFormat(item.amount || 0),
                    },
                    {
                      field: "description",
                      headerName: "Description",
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
                                loadingDelete ||
                                expense.paid_amount >= expense.total_amount
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
                  items={expensePayments}
                  hidePaginationFooter
                  footerItems={[
                    [
                      { value: "TOTAL" },
                      { value: numberFormat(getTotalAmount() || 0) },
                    ],
                  ]}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
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
    </React.Fragment>
  );
};

export default ExpensePaymentsModal;
