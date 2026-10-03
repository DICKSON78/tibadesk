import React, { useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Grid, IconButton, LinearProgress, Paper, Stack, Typography,
} from "../../../components/ui/index.jsx";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import { useFetch, usePost, useToast } from "../../../hooks";
import { Delete as DeleteIcon } from "../../../components/ui/icons.jsx";

const PrescriptionForm = ({ consultationId, patientId, prescriptions, onPrescriptionAdded }) => {
  const addToast = useToast();
  const { handlePost: post, loading: saving } = usePost();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    medicine_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    route: "",
    instructions: "",
  });

  const handleSubmit = async () => {
    if (!form.medicine_name) {
      addToast("Medicine name is required", { variant: "warning" });
      return;
    }
    try {
      const res = await post("/api/prescriptions", {
        consultation_id: consultationId,
        patient_id: patientId,
        ...form,
      });
      if (res.success) {
        addToast("Prescription added", { variant: "success" });
        setForm({ medicine_name: "", dosage: "", frequency: "", duration: "", route: "", instructions: "" });
        setShowForm(false);
        if (onPrescriptionAdded) onPrescriptionAdded(res.data);
      }
    } catch (e) {
      addToast("Failed to save prescription", { variant: "error" });
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>Prescriptions</Typography>
          <Button size="small" variant="outlined" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Prescription"}
          </Button>
        </Box>

        {showForm && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Medicine Name"
                  value={form.medicine_name}
                  onChange={(v) => setForm({ ...form, medicine_name: v || "" })}
                  fullWidth size="small" required
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Dosage"
                  placeholder="e.g. 500mg"
                  value={form.dosage}
                  onChange={(v) => setForm({ ...form, dosage: v || "" })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Frequency"
                  placeholder="e.g. 3x daily"
                  value={form.frequency}
                  onChange={(v) => setForm({ ...form, frequency: v || "" })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Duration"
                  placeholder="e.g. 7 days"
                  value={form.duration}
                  onChange={(v) => setForm({ ...form, duration: v || "" })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Select
                  label="Route"
                  value={form.route}
                  category="prescriptionRoute"
                  onChange={(v) => setForm({ ...form, route: v || "" })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Instructions"
                  value={form.instructions}
                  onChange={(v) => setForm({ ...form, instructions: v || "" })}
                  multiline rows={2} fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" size="small" onClick={handleSubmit} disabled={saving}>
                    {saving ? <LinearProgress sx={{ width: 60 }} /> : "Save Prescription"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {prescriptions && prescriptions.length > 0 ? (
          <Stack spacing={1}>
            {prescriptions.map((rx) => (
              <Paper key={rx.id} variant="outlined" sx={{ p: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{rx.medicine_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[rx.dosage, rx.frequency, rx.duration, rx.route].filter(Boolean).join(" | ")}
                    </Typography>
                    {rx.instructions && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {rx.instructions}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={rx.status}
                    size="small"
                    color={rx.status === "Active" ? "success" : rx.status === "Completed" ? "default" : "error"}
                  />
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            No prescriptions added yet
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PrescriptionForm;
