import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import DatePicker from "../../../components/DatePicker";

import { useFetch, usePost, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getValidationRules,
} from "../../../helpers";

const validationRules = getValidationRules();

const CreateExpense = ({ modal, fetchExpenses }) => {
  const addToast = useToast();

  const formRef = useRef();
  const categoryRef = useRef();
  const totalAmountRef = useRef();
  const paidAmountRef = useRef();
  const descriptionRef = useRef();
  const dateRef = useRef();

  const { data: categories } = useFetch(
    "api/expense-categories",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [formData, setFormData] = useState({
    category_id: undefined,
    total_amount: undefined,
    paid_amount: undefined,
    description: undefined,
    expense_date: new Date(),
  });

  const { data, loading, error, handlePost } = usePost("api/expenses", {
    ...formData,
    expense_date: formatDateForDb(formData.expense_date),
  });

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchExpenses();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <Select
                ref={categoryRef}
                label="Category"
                fullWidth
                required
                options={categories}
                optionsLabel="name"
                optionsValue="id"
                onChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={totalAmountRef}
                label="Total Amount"
                fullWidth
                required
                rules={[
                  validationRules.number,
                  (value) => value >= 0 || "Amount cannot be negative.",
                ]}
                onChange={(value) =>
                  setFormData({ ...formData, total_amount: value })
                }
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={paidAmountRef}
                label="Paid Amount"
                fullWidth
                required
                rules={[
                  validationRules.number,
                  (value) => value >= 0 || "Amount cannot be negative.",
                ]}
                onChange={(value) =>
                  setFormData({ ...formData, paid_amount: value })
                }
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
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
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <DatePicker
                ref={dateRef}
                label="Expense Date"
                fullWidth
                required
                value={formData.expense_date || null}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    expense_date: !isNaN(value) ? value : null,
                  })
                }
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          sx={{ mr: 1 }}
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default CreateExpense;
