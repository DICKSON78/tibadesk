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

import { usePatch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const EditCommunicationLog = ({ item, modal, fetchCommunicationLogs }) => {
  const addToast = useToast();

  const formRef = useRef();
  const customerNameRef = useRef();
  const customerPhoneRef = useRef();
  const customerEmailRef = useRef();
  const communicationTypeRef = useRef();
  const communicationDirectionRef = useRef();
  const descriptionRef = useRef();

  const [formData, setFormData] = useState({
    customer_name: item.customer_name,
    customer_phone: item.customer_phone,
    customer_email: item.customer_email,
    communication_type: item.communication_type,
    communication_direction: item.communication_direction,
    description: item.description,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/marketing/communication-logs/${item.id}`,
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchCommunicationLogs();
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
              <TextField
                ref={customerNameRef}
                label="Customer Name"
                fullWidth
                defaultValue={formData.customer_name}
                onChange={(value) =>
                  setFormData({ ...formData, customer_name: value })
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
                ref={customerPhoneRef}
                label="Customer Phone"
                fullWidth
                defaultValue={formData.customer_phone}
                onChange={(value) =>
                  setFormData({ ...formData, customer_phone: value })
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
                ref={customerEmailRef}
                label="Customer Email"
                fullWidth
                defaultValue={formData.customer_email}
                onChange={(value) =>
                  setFormData({ ...formData, customer_email: value })
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
                ref={communicationTypeRef}
                label="Communication Type"
                fullWidth
                options={["Phone", "Chat", "Email"]}
                required
                value={formData.communication_type}
                onChange={(value) =>
                  setFormData({ ...formData, communication_type: value })
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
                ref={communicationDirectionRef}
                label="Communication Direction"
                fullWidth
                options={["Incoming", "Outgoing"]}
                required
                value={formData.communication_direction}
                onChange={(value) =>
                  setFormData({ ...formData, communication_direction: value })
                }
              />
            </Grid>
            <Grid
              item
              md={12}
              sm={12}
              xs={12}
            >
              <TextField
                ref={descriptionRef}
                label="Description"
                fullWidth
                multiline
                rows={3}
                required
                defaultValue={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
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

export default EditCommunicationLog;
