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

const EditResearchPlan = ({ item, modal, fetchResearchPlans }) => {
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
  const statusRef = useRef();
  const remarksRef = useRef();

  const [formData, setFormData] = useState({
    title: item.title,
    overview: item.overview,
    goals: item.goals,
    deliverables: item.deliverables,
    target_audience: item.target_audience,
    sample_plan: item.sample_plan,
    research_methods: item.research_methods,
    timeline: item.timeline,
    budget: item.budget,
    status: item.status,
    remarks: item.remarks,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/marketing/research-plans/${item.id}`,
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
                ref={overviewRef}
                label="Overview"
                fullWidth
                multiline
                rows={4}
                defaultValue={formData.overview}
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
                rows={4}
                defaultValue={formData.goals}
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
                rows={4}
                defaultValue={formData.deliverables}
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
                defaultValue={formData.target_audience}
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
                defaultValue={formData.sample_plan}
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
                defaultValue={formData.research_methods}
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
                defaultValue={formData.timeline}
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
                defaultValue={formData.budget}
                onChange={(value) =>
                  setFormData({ ...formData, budget: value })
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

export default EditResearchPlan;
