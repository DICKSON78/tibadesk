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
import SelectClinic from "../../../components/SelectClinic";

import { usePost, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const CreatePaymentMode = ({ modal, fetchPaymentModes }) => {
  const addToast = useToast();

  const formRef = useRef();
  const clinicRef = useRef();
  const nameRef = useRef();
  const descriptionRef = useRef();
  const paymentTypeRef = useRef();

  const [formData, setFormData] = useState({
    name: undefined,
    description: undefined,
    transaction_type: undefined,
  });

  const { data, loading, error, handlePost } = usePost(
    "api/payment-modes",
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchPaymentModes();
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
      {loading ? <LinearProgress /> : null}
      <CardContent>
        <Form ref={formRef}>
          <Grid
            container
            spacing={2}
          >
            {window.user.role === "Admin" ? (
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                <SelectClinic
                  ref={clinicRef}
                  required
                  onChange={(value) =>
                    setFormData({ ...formData, clinic_id: value?.id })
                  }
                />
              </Grid>
            ) : null}
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={nameRef}
                label="Name"
                fullWidth
                required
                onChange={(value) => setFormData({ ...formData, name: value })}
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
              <Select
                ref={paymentTypeRef}
                label="Transaction Type"
                fullWidth
                required
                options={["Cash", "Credit"]}
                onChange={(value) =>
                  setFormData({ ...formData, transaction_type: value })
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

export default CreatePaymentMode;
