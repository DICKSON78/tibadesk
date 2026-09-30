import React, { useCallback, useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControlLabel, Grid, IconButton,
  Radio, RadioGroup, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography, Paper,
} from "../../../components/ui/index.jsx";
import { styled } from "../../../components/ui/styles.jsx";
import { useFetch, usePatch, useToast, useOptions } from "../../../hooks";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import { getToken } from '../../../lib/session';

const FDI_QUADRANTS = {
  UR: [18, 17, 16, 15, 14, 13, 12, 11],
  UL: [21, 22, 23, 24, 25, 26, 27, 28],
  LL: [31, 32, 33, 34, 35, 36, 37, 38],
  LR: [41, 42, 43, 44, 45, 46, 47, 48],
};

const TOOTH_NAMES = {
  11: "Central Incisor", 12: "Lateral Incisor", 13: "Canine",
  14: "1st Premolar", 15: "2nd Premolar", 16: "1st Molar",
  17: "2nd Molar", 18: "3rd Molar",
  21: "Central Incisor", 22: "Lateral Incisor", 23: "Canine",
  24: "1st Premolar", 25: "2nd Premolar", 26: "1st Molar",
  27: "2nd Molar", 28: "3rd Molar",
  31: "Central Incisor", 32: "Lateral Incisor", 33: "Canine",
  34: "1st Premolar", 35: "2nd Premolar", 36: "1st Molar",
  37: "2nd Molar", 38: "3rd Molar",
  41: "Central Incisor", 42: "Lateral Incisor", 43: "Canine",
  44: "1st Premolar", 45: "2nd Premolar", 46: "1st Molar",
  47: "2nd Molar", 48: "3rd Molar",
};

const ToothBox = styled(Box, { shouldForwardProp: (prop) => prop !== "selected" })(
  ({ theme, selected }) => ({
    width: 52,
    height: 52,
    border: "2px solid",
    borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
    borderRadius: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
    position: "relative",
    transition: "all 0.2s",
    "&:hover": { borderColor: theme.palette.primary.main, boxShadow: 1 },
  }),
);

const CHARTED_CARIES = ["Sound", "Decayed", "Filled", "FilledDecay", "Sealant"];

const getToothVisual = (data) => {
  if (!data) return null;
  let key;
  if (data.status === "Missing" || data.caries_status === "MissingCaries") {
    key = "Missing";
  } else if (CHARTED_CARIES.includes(data.caries_status)) {
    key = data.caries_status;
  } else {
    key = "Sound";
  }
  return { ...statusColors[key], key };
};

const statusColors = {
  Sound: { bg: "#e8f5e9", color: "#2e7d32", label: "H" },
  Decayed: { bg: "#ffcdd2", color: "#c62828", label: "D" },
  Filled: { bg: "#B2DFDB", color: "#004D40", label: "F" },
  FilledDecay: { bg: "#ce93d8", color: "#6a1b9a", label: "R" },
  Missing: { bg: "#f5f5f5", color: "#9e9e9e", label: "M" },
  Sealant: { bg: "#c8e6c9", color: "#2e7d32", label: "S" },
};

const DentalChartingEditor = ({ consultationId, readOnly }) => {
  const addToast = useToast();
  const [chartData, setChartData] = useState([]);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothDialogOpen, setToothDialogOpen] = useState(false);
  const [toothForm, setToothForm] = useState({});
  const { data: fetchData, loading } = useFetch(
    `/api/dental-charting/consultation/${consultationId}`,
    { loadOnMount: true, loadOnReload: true },
  );
  const { handlePatch: patch, loading: saving } = usePatch();
  const { options } = useOptions();

  useEffect(() => {
    if (fetchData?.data) {
      setChartData(fetchData.data);
    }
  }, [fetchData]);

  const getToothStatus = useCallback((toothNum) => {
    return chartData.find((t) => t.tooth_number === toothNum);
  }, [chartData]);

  const handleToothClick = (toothNum) => {
    if (readOnly) return;
    const existing = getToothStatus(toothNum);
    setToothForm(existing ? {
      tooth_number: existing.tooth_number,
      status: existing.status,
      caries_status: existing.caries_status,
      restoration_type: existing.restoration_type,
      surface_involved: existing.surface_involved,
      mobility: existing.mobility,
      periodontal_pocket_depth: existing.periodontal_pocket_depth,
      bleeding_on_probing: existing.bleeding_on_probing || false,
      furcation_involvement: existing.furcation_involvement,
      notes: existing.notes || "",
    } : {
      tooth_number: toothNum,
      status: "Present",
      caries_status: "Sound",
      restoration_type: "",
      surface_involved: "",
      mobility: "",
      periodontal_pocket_depth: "",
      bleeding_on_probing: false,
      furcation_involvement: "",
      notes: "",
    });
    setSelectedTooth(toothNum);
    setToothDialogOpen(true);
  };

  const handleSaveTooth = async () => {
    try {
      const existing = getToothStatus(toothForm.tooth_number);
      if (existing) {
        await patch(`/api/dental-charting/${existing.id}`, toothForm);
      } else {
        await patch("/api/dental-charting", {
          consultation_id: consultationId,
          ...toothForm,
        });
      }
      const res = await fetch(`/api/dental-charting/consultation/${consultationId}`, {
        headers: { "Authorization": "Bearer " + getToken() },
      });
      const json = await res.json();
      if (json.data) setChartData(json.data);
      setToothDialogOpen(false);
      addToast("Tooth charting saved", { variant: "success" });
    } catch (e) {
      addToast("Failed to save tooth charting", { variant: "error" });
    }
  };

  const handleBulkSave = async () => {
    try {
      const teeth = chartData.map((t) => ({
        tooth_number: t.tooth_number,
        tooth_quadrant: t.tooth_quadrant,
        status: t.status,
        caries_status: t.caries_status,
        restoration_type: t.restoration_type,
        surface_involved: t.surface_involved,
        mobility: t.mobility,
        periodontal_pocket_depth: t.periodontal_pocket_depth,
        bleeding_on_probing: t.bleeding_on_probing,
        furcation_involvement: t.furcation_involvement,
        notes: t.notes,
      }));
      await patch("/api/dental-charting/bulk", {
        consultation_id: consultationId,
        teeth,
      });
      addToast("Charting saved successfully", { variant: "success" });
    } catch (e) {
      addToast("Failed to save charting", { variant: "error" });
    }
  };

  const renderTooth = (num) => {
    const data = getToothStatus(num);
    const visual = getToothVisual(data);
    const missing = !!data && (data.status === "Missing" || data.caries_status === "MissingCaries");
    const detail = !data
      ? " — not charted"
      : missing
        ? ` — Missing`
        : ` — ${data.caries_status || data.status || "Sound"}${data.status && data.status !== "Present" ? ` (${data.status})` : ""}${data.restoration_type ? `, ${data.restoration_type}` : ""}${data.surface_involved ? `, ${data.surface_involved}` : ""}`;
    return (
      <Tooltip key={num} title={`Tooth ${num} (${TOOTH_NAMES[num] || ""})${detail}`}>
        <ToothBox
          selected={selectedTooth === num}
          onClick={() => handleToothClick(num)}
          sx={{
            bgcolor: (t) => (visual ? visual.bg : t.palette.background.paper),
            color: (t) => (visual ? visual.color : t.palette.text.primary),
          }}
        >
          {num}
          {visual && (
            <Box sx={{ position: "absolute", bottom: 1, right: 5, fontSize: "0.62rem", fontWeight: 700, lineHeight: 1 }}>
              {visual.label}
            </Box>
          )}
        </ToothBox>
      </Tooltip>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
            Dental Chart (Odontogram) — FDI (ISO 3950)
          </Typography>
          {!readOnly && chartData.length > 0 && (
            <Button variant="contained" size="small" onClick={handleBulkSave} disabled={saving}>
              Save Charting
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
          {Object.entries(statusColors).map(([key, val]) => (
            <Chip
              key={key}
              label={key}
              size="small"
              sx={{ bgcolor: val.bg, color: val.color, fontWeight: 600, fontSize: "0.7rem" }}
            />
          ))}
        </Box>

        <Box sx={{ textAlign: "center", mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            UPPER ARCH — Quadrant 1 (Right) | Quadrant 2 (Left)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box>
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
              {FDI_QUADRANTS.UR.map(renderTooth)}
            </Box>
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
              {FDI_QUADRANTS.UL.map(renderTooth)}
            </Box>
          </Box>
        </Box>

        <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            LOWER ARCH — Quadrant 3 (Left) | Quadrant 4 (Right)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box>
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
              {FDI_QUADRANTS.LL.map(renderTooth)}
            </Box>
            <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
              {FDI_QUADRANTS.LR.map(renderTooth)}
            </Box>
          </Box>
        </Box>

        <Dialog open={toothDialogOpen} onClose={() => setToothDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Tooth #{toothForm.tooth_number} — {TOOTH_NAMES[toothForm.tooth_number] || ""}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <Select
                  label="Tooth Status"
                  value={toothForm.status || ""}
                  options={options.toothStatus || []}
                  onChange={(val) => setToothForm({ ...toothForm, status: val || "" })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Select
                  label="Caries Status"
                  value={toothForm.caries_status || ""}
                  options={options.cariesStatus || []}
                  onChange={(val) => setToothForm({ ...toothForm, caries_status: val || "" })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Select
                  label="Restoration Type"
                  value={toothForm.restoration_type || ""}
                  options={options.treatmentTypes || []}
                  onChange={(val) => setToothForm({ ...toothForm, restoration_type: val || "" })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Select
                  label="Surface(s) Involved"
                  value={toothForm.surface_involved || ""}
                  options={options.toothSurfaces || []}
                  onChange={(val) => setToothForm({ ...toothForm, surface_involved: val || "" })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <Select
                  label="Mobility"
                  value={toothForm.mobility || ""}
                  options={options.mobility || []}
                  onChange={(val) => setToothForm({ ...toothForm, mobility: val || "" })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Pocket Depth (mm)"
                  value={toothForm.periodontal_pocket_depth || ""}
                  onChange={(val) => setToothForm({ ...toothForm, periodontal_pocket_depth: val || "" })}
                  fullWidth
                  size="small"
                  type="number"
                />
              </Grid>
              <Grid item xs={4}>
                <Select
                  label="Furcation"
                  value={toothForm.furcation_involvement || ""}
                  options={options.furcationInvolvement || []}
                  onChange={(val) => setToothForm({ ...toothForm, furcation_involvement: val || "" })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={toothForm.bleeding_on_probing || false}
                      onChange={(e) => setToothForm({ ...toothForm, bleeding_on_probing: e.target.checked })}
                    />
                  }
                  label="Bleeding on Probing"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={toothForm.notes || ""}
                  onChange={(val) => setToothForm({ ...toothForm, notes: val || "" })}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setToothDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveTooth} disabled={saving}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DentalChartingEditor;
