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

const CreateMarketingStrategy = ({ modal, fetchMarketingStrategies }) => {
  const addToast = useToast();

  const formRef = useRef();
  const titleRef = useRef();
  const overviewRef = useRef();
  const goalsRef = useRef();
  const targetAudienceRef = useRef();
  const budgetRef = useRef();
  const channelsRef = useRef();

  const [formData, setFormData] = useState({
    title: undefined,
    overview: undefined,
    goals: undefined,
    target_audience: undefined,
    budget: undefined,
    channels: undefined,
  });

  const { data, loading, error, handlePost } = usePost(
    "api/marketing/marketing-strategies",
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchMarketingStrategies();
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
                ref={overviewRef}
                label="Overview"
                fullWidth
                multiline
                rows={3}
                onChange={(value) =>
                  setFormData({ ...formData, overview: value })
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
                ref={goalsRef}
                label="Goals"
                fullWidth
                multiline
                rows={3}
                onChange={(value) => setFormData({ ...formData, goals: value })}
              />
            </Grid>
            <Grid
              item
              md={12}
              sm={12}
              xs={12}
            >
              <TextField
                ref={targetAudienceRef}
                label="Target Audience"
                fullWidth
                multiline
                rows={3}
                onChange={(value) =>
                  setFormData({ ...formData, target_audience: value })
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
                ref={budgetRef}
                label="Budget"
                fullWidth
                multiline
                rows={3}
                onChange={(value) =>
                  setFormData({ ...formData, budget: value })
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
                ref={channelsRef}
                label="Channels"
                fullWidth
                multiline
                rows={3}
                onChange={(value) =>
                  setFormData({ ...formData, channels: value })
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

export default CreateMarketingStrategy;
