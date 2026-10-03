import React, { useState } from "react";
import {
  Box, Button, Card, CardContent, Grid, LinearProgress, Paper, Typography,
} from "../../../../components/ui/index.jsx";
import { Header as PageHeader } from "../../../../components/Page";
import TextField from "../../../../components/TextField";
import Select from "../../../../components/Select";
import { useFetch, usePatch, useToast, useOptions } from "../../../../hooks";

const DentalTreatmentTemplate = ({ patient, paymentCacheitem }) => {
  const addToast = useToast();
  const { handlePatch: patch, loading: saving } = usePatch();
  const { options } = useOptions();

  const [form, setForm] = useState({
    treatment_type: "",
    tooth_number: "",
    tooth_surface: "",
    anaesthesia_type: "",
    phase: "",
    preoperative_notes: "",
    intraoperative_notes: "",
    postoperative_notes: "",
    prescription: "",
    material_used: "",
    treated_by: "",
    treatment_date: "",
  });

  const handleSubmit = async () => {
    try {
      await patch("/api/dental-treatment-records", {
        payment_cache_item_id: paymentCacheitem.id,
        ...form,
      });
      addToast("Treatment record saved", { variant: "success" });
    } catch (e) {
      addToast("Failed to save", { variant: "error" });
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <PageHeader title="Dental Treatment Record" />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Patient: {patient?.first_name} {patient?.last_name} | Item: {paymentCacheitem?.item?.name}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Select
            label="Treatment Type"
            value={form.treatment_type}
            options={options.treatmentTypes || []}
            onChange={(v) => setForm({ ...form, treatment_type: v })}
            fullWidth size="small"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Select
            label="Treatment Phase"
            value={form.phase}
            options={options.treatmentPhases || []}
            onChange={(v) => setForm({ ...form, phase: v })}
            fullWidth size="small"
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <Select
            label="Tooth Number"
            value={form.tooth_number}
            options={options.toothNumbers || []}
            onChange={(v) => setForm({ ...form, tooth_number: v })}
            fullWidth size="small"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Select
            label="Tooth Surface"
            value={form.tooth_surface}
            options={options.toothSurfaces || []}
            onChange={(v) => setForm({ ...form, tooth_surface: v })}
            fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Select
            label="Anaesthesia"
            value={form.anaesthesia_type}
            options={options.anaesthesiaTypes || []}
            onChange={(v) => setForm({ ...form, anaesthesia_type: v })}
            fullWidth size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Pre-operative Notes"
            value={form.preoperative_notes}
            onChange={(v) => setForm({ ...form, preoperative_notes: v || "" })}
            multiline rows={3} fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Intra-operative Notes"
            value={form.intraoperative_notes}
            onChange={(v) => setForm({ ...form, intraoperative_notes: v || "" })}
            multiline rows={3} fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Post-operative Notes"
            value={form.postoperative_notes}
            onChange={(v) => setForm({ ...form, postoperative_notes: v || "" })}
            multiline rows={3} fullWidth size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Material Used"
            value={form.material_used}
            onChange={(v) => setForm({ ...form, material_used: v || "" })}
            fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Prescription"
            value={form.prescription}
            onChange={(v) => setForm({ ...form, prescription: v || "" })}
            multiline rows={3} fullWidth size="small"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Treatment Date"
            value={form.treatment_date}
            onChange={(v) => setForm({ ...form, treatment_date: v || "" })}
            type="date" fullWidth size="small"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Treated By (Doctor ID)"
            value={form.treated_by}
            onChange={(v) => setForm({ ...form, treated_by: v || "" })}
            fullWidth size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save Treatment Record"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DentalTreatmentTemplate;
