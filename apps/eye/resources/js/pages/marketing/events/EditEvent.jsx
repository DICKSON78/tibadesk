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
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";

import { usePatch, useToast } from "../../../hooks";
import { formatDateForDb, formatError } from "../../../helpers";

const EditEvent = ({ eventType, item, modal, fetchEvents }) => {
  const addToast = useToast();

  const formRef = useRef();
  const dateRef = useRef();
  const titleRef = useRef();
  const locationRef = useRef();
  const descriptionRef = useRef();
  const statusRef = useRef();
  const remarksRef = useRef();

  const [formData, setFormData] = useState({
    event_date: new Date(item.event_date),
    title: item.title,
    location: item.location,
    description: item.description,
    status: item.status,
    remarks: item.remarks,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/marketing/events/${item.id}`,
    {
      ...formData,
      event_date: formatDateForDb(formData.event_date),
    }
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchEvents();
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
              <DatePicker
                ref={dateRef}
                label="Event Date"
                fullWidth
                required
                value={formData.event_date || null}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    event_date: !isNaN(value) ? value : null,
                  })
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
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={locationRef}
                label="Location"
                fullWidth
                required
                defaultValue={formData.location}
                onChange={(value) =>
                  setFormData({ ...formData, location: value })
                }
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            />
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
                options={["Pending", "Cancelled", "Completed"]}
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

export default EditEvent;
