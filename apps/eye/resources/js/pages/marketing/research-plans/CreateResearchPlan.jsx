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

const CreateResearchPlan = ({ modal, fetchResearchPlans }) => {
  const addToast = useToast();

  const formRef = useRef();
  const titleRef = useRef();
  const overviewRef = useRef();
  const goalsRef = useRef();
  const deliverablesRef = useRef();
  const targetAudienceRef = useRef();
  const samplePlanRef = useRef();
  const researchMethodsRef = useRef();
  const timelineRef = useRef();
  const budgetRef = useRef();

  const [formData, setFormData] = useState({
    title: undefined,
    overview: undefined,
    goals: undefined,
    deliverables: undefined,
    target_audience: undefined,
    sample_plan: undefined,
    research_methods: undefined,
    timeline: undefined,
    budget: undefined,
  });

  const { data, loading, error, handlePost } = usePost(
    "api/marketing/research-plans",
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchResearchPlans();
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
                ref={deliverablesRef}
                label="Deliverables"
                fullWidth
                multiline
                rows={3}
                onChange={(value) =>
                  setFormData({ ...formData, deliverables: value })
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
                ref={samplePlanRef}
                label="Sample Plan"
                fullWidth
                multiline
                rows={3}
                onChange={(value) =>
                  setFormData({ ...formData, sample_plan: value })
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
                ref={researchMethodsRef}
                label="Research Methods"
                fullWidth
                multiline
                rows={3}
                onChange={(value) =>
                  setFormData({ ...formData, research_methods: value })
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
                ref={timelineRef}
                label="Timeline"
                fullWidth
                multiline
                rows={3}
                onChange={(value) =>
                  setFormData({ ...formData, timeline: value })
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

export default CreateResearchPlan;
