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

import { usePatch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const EditPatientAttachment = ({ modal, item, fetchPatientAttachments }) => {
  const addToast = useToast();

  const formRef = useRef();
  const titleRef = useRef();
  const descriptionRef = useRef();

  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/patient-attachments/${item.id}`,
    formData
  );

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
              md={12}
              sm={12}
              xs={12}
            >
              <TextField
                ref={titleRef}
                label="Title"
                fullWidth
                required
                defaultValue={formData.title}
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

export default EditPatientAttachment;
