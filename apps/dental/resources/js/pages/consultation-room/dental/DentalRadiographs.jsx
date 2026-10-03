import React, { useState, useRef } from "react";
import {
  Box, Button, Card, CardContent, Chip, Grid, IconButton, ImageList, ImageListItem,
  ImageListItemBar, LinearProgress, Stack, Typography,
} from "../../../components/ui/index.jsx";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import DatePicker from "../../../components/DatePicker";
import { useFetch, usePost, useToast } from "../../../hooks";
import { Delete as DeleteIcon, Visibility as VisibilityIcon } from "../../../components/ui/icons.jsx";
import { getToken } from '../../../lib/session';

const DentalRadiographs = ({ consultationId, patientId, radiographs, onRadiographAdded }) => {
  const addToast = useToast();
  const { handlePost: post, loading: saving } = usePost();
  const fileInputRef = useRef();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    radiograph_type: "",
    tooth_number: "",
    findings: "",
    impression: "",
    taken_date: new Date().toISOString().split("T")[0],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.radiograph_type) {
      addToast("Radiograph type is required", { variant: "warning" });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("consultation_id", consultationId);
      formData.append("patient_id", patientId);
      formData.append("radiograph_type", form.radiograph_type);
      formData.append("tooth_number", form.tooth_number);
      formData.append("findings", form.findings);
      formData.append("impression", form.impression);
      formData.append("taken_date", form.taken_date);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await fetch("/api/dental-radiographs", {
        method: "POST",
        headers: { Authorization: "Bearer " + getToken() },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        addToast("Radiograph saved", { variant: "success" });
        setForm({ radiograph_type: "", tooth_number: "", findings: "", impression: "", taken_date: new Date().toISOString().split("T")[0] });
        setSelectedFile(null);
        setPreview(null);
        setShowForm(false);
        if (onRadiographAdded) onRadiographAdded(json.data);
      } else {
        addToast("Failed to save", { variant: "error" });
      }
    } catch (e) {
      addToast("Failed to save radiograph", { variant: "error" });
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>Radiographs / X-rays</Typography>
          <Button size="small" variant="outlined" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add X-ray"}
          </Button>
        </Box>

        {showForm && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Select
                  label="Radiograph Type"
                  value={form.radiograph_type}
                  category="radiographTypes"
                  onChange={(v) => setForm({ ...form, radiograph_type: v || "" })}
                  fullWidth size="small" required
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  label="Tooth Number"
                  value={form.tooth_number}
                  onChange={(v) => setForm({ ...form, tooth_number: v || "" })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Taken Date"
                  type="date"
                  value={form.taken_date}
                  onChange={(v) => setForm({ ...form, taken_date: v || "" })}
                  fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button variant="outlined" component="label" fullWidth sx={{ height: 40 }}>
                  {selectedFile ? selectedFile.name : "Upload Image"}
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Findings"
                  value={form.findings}
                  onChange={(v) => setForm({ ...form, findings: v || "" })}
                  multiline rows={2} fullWidth size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Impression"
                  value={form.impression}
                  onChange={(v) => setForm({ ...form, impression: v || "" })}
                  multiline rows={2} fullWidth size="small"
                />
              </Grid>
              {preview && (
                <Grid item xs={12}>
                  <Box sx={{ maxWidth: 300 }}>
                    <img src={preview} alt="Preview" style={{ width: "100%", borderRadius: 4 }} />
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" size="small" onClick={handleSubmit} disabled={saving}>
                    {saving ? <LinearProgress sx={{ width: 60 }} /> : "Save X-ray"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {radiographs && radiographs.length > 0 ? (
          <ImageList cols={3} gap={8}>
            {radiographs.map((rx) => (
              <ImageListItem key={rx.id} sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
                {rx.image_url ? (
                  <img
                    src={rx.image_url}
                    alt={rx.radiograph_type}
                    style={{ height: 120, objectFit: "cover", borderRadius: "4px 4px 0 0" }}
                  />
                ) : (
                  <Box sx={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.100" }}>
                    <Typography variant="caption" color="text.secondary">No image</Typography>
                  </Box>
                )}
                <ImageListItemBar
                  title={rx.radiograph_type}
                  subtitle={rx.tooth_number ? `Tooth ${rx.tooth_number}` : ""}
                  actionIcon={
                    rx.image_url && (
                      <IconButton size="small" sx={{ color: "white" }} onClick={() => window.open(rx.image_url, "_blank")}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                />
                <Box sx={{ p: 0.5 }}>
                  {rx.findings && (
                    <Typography variant="caption" display="block" noWrap>{rx.findings}</Typography>
                  )}
                </Box>
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            No radiographs added yet
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DentalRadiographs;
