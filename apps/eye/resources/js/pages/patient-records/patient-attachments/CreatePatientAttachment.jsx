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
import FileInput from "../../../components/FileInput";
import TextField from "../../../components/TextField";

import { usePost, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const CreatePatientAttachment = ({
  modal,
  patient,
  fetchPatientAttachments,
}) => {
  const addToast = useToast();

  const formRef = useRef();
  const attachmentRef = useRef();
  const titleRef = useRef();
  const descriptionRef = useRef();

  const [formData, setFormData] = useState({
    patient_id: patient.id,
    attachment: undefined,
    title: undefined,
    description: undefined,
  });

  const { data, loading, error, handlePost } = usePost();

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchPatientAttachments();
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

      handlePost("api/patient-attachments", formData1);
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
              md={12}
              sm={12}
              xs={12}
            >
              <FileInput
                ref={attachmentRef}
                label="Attachment"
                fullWidth
                required
                onChange={(value) =>
                  setFormData({ ...formData, attachment: value[0] })
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
                ref={titleRef}
                label="Title"
                fullWidth
                required
                onChange={(value) => setFormData({ ...formData, title: value })}
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
          disabled={loading}
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

export default CreatePatientAttachment;
