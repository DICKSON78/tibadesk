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

import { useFetch, usePatch, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getValidationRules,
} from "../../../helpers";

const validationRules = getValidationRules();

const EditExpense = ({ item, modal, fetchExpenses }) => {
  const addToast = useToast();

  const formRef = useRef();
  const categoryRef = useRef();
  const totalAmountRef = useRef();
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
    category_id: item.category_id,
    total_amount: item.total_amount,
    description: item.description,
    expense_date: new Date(item.expense_date),
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/expenses/${item.id}`,
    {
      ...formData,
      expense_date: formatDateForDb(formData.expense_date),
    }
  );

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
      handlePatch();
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
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={categories.find((e) => e.id === formData.category_id)}
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
                defaultValue={formData.total_amount}
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
                ref={descriptionRef}
                label="Description"
                fullWidth
                multiline
                rows={3}
                defaultValue={formData.description}
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

export default EditExpense;
