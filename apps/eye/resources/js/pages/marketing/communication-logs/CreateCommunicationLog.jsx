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
import FileInput from "../../../components/FileInput";

import { usePost, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const CreateCommunicationLog = ({ modal, fetchCommunicationLogs }) => {
  const addToast = useToast();

  const formRef = useRef();
  const customerNameRef = useRef();
  const customerPhoneRef = useRef();
  const customerEmailRef = useRef();
  const communicationTypeRef = useRef();
  const communicationDirectionRef = useRef();
  const descriptionRef = useRef();
  const attachmentRef = useRef();

  const [formData, setFormData] = useState({
    customer_name: undefined,
    customer_phone: undefined,
    customer_email: undefined,
    communication_type: undefined,
    communication_direction: undefined,
    description: undefined,
    attachment: undefined,
  });

  const { data, loading, error, handlePost } = usePost();

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
      const formData1 = new FormData();

      for (let k in formData) {
        if (formData[k]) {
          formData1.append(k, formData[k]);
        }
      }

      handlePost("api/marketing/communication-logs", formData1);
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
              <FileInput
                ref={attachmentRef}
                label="Attachment"
                fullWidth
                onChange={(value) =>
                  setFormData({ ...formData, attachment: value[0] })
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

export default CreateCommunicationLog;
