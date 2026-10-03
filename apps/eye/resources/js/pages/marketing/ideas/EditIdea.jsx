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

const EditIdea = ({ item, modal, fetchIdeas }) => {
  const addToast = useToast();

  const formRef = useRef();
  const descriptionRef = useRef();
  const statusRef = useRef();
  const remarksRef = useRef();

  const [formData, setFormData] = useState({
    description: item.description,
    status: item.status,
    remarks: item.remarks,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/marketing/ideas/${item.id}`,
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchIdeas();
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
                ref={descriptionRef}
                label="Description"
                fullWidth
                multiline
                rows={4}
                required
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
              <Select
                ref={statusRef}
                label="Status"
                fullWidth
                options={["Pending", "Cancelled", "Implemented"]}
                required
                value={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              />
            </Grid>
            {formData.status !== "Pending" ? (
              <Grid
                item
                md={12}
                sm={12}
                xs={12}
              >
                <TextField
                  ref={remarksRef}
                  label="Remarks"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  defaultValue={formData.remarks}
                  onChange={(value) =>
                    setFormData({ ...formData, remarks: value })
                  }
                />
              </Grid>
            ) : null}
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

export default EditIdea;
