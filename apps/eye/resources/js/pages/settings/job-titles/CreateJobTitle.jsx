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
import SelectClinic from "../../../components/SelectClinic";

import { usePost, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const CreateJobTitle = ({ modal, fetchJobTitles }) => {
  const addToast = useToast();

  const formRef = useRef();
  const clinicRef = useRef();
  const nameRef = useRef();
  const descriptionRef = useRef();

  const [formData, setFormData] = useState({
    clinic_id: undefined,
    name: undefined,
    description: undefined,
  });

  const { data, loading, error, handlePost } = usePost(
    "api/job-titles",
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchJobTitles();
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
                label="Job Title"
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

export default CreateJobTitle;
