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

import { usePost, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const CreateCollaborator = ({ modal, fetchCollaborators }) => {
  const addToast = useToast();

  const formRef = useRef();
  const nameRef = useRef();
  const phoneRef = useRef();
  const descriptionRef = useRef();

  const [formData, setFormData] = useState({
    name: undefined,
    phone: undefined,
    description: undefined,
  });

  const { data, loading, error, handlePost } = usePost(
    "api/collaborators",
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchCollaborators();
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
          <Grid container spacing={2}>
            <Grid item md={12} sm={12} xs={12}>
              <TextField
                ref={nameRef}
                label="Name"
                fullWidth
                required
                onChange={(value) => setFormData({ ...formData, name: value })}
              />
            </Grid>
            <Grid item md={12} sm={12} xs={12}>
              <TextField
                ref={phoneRef}
                label="Phone"
                fullWidth
                onChange={(value) => setFormData({ ...formData, phone: value })}
              />
            </Grid>
            <Grid item md={12} sm={12} xs={12}>
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
        <Button variant="contained" size="large" onClick={handleSubmit}>
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default CreateCollaborator;
