import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Grid, Typography } from "../../../components/ui/index.jsx";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import { usePatch, useOptions } from "../../../hooks";

const fields = [
  { key: "lips", label: "Lips", category: "lips" },
  { key: "buccal_mucosa", label: "Buccal Mucosa", category: "buccalMucosa" },
  { key: "tongue", label: "Tongue", category: "tongue" },
  { key: "floor_of_mouth", label: "Floor of Mouth", category: "floorOfMouth" },
  { key: "hard_palate", label: "Hard Palate", category: "palate" },
  { key: "soft_palate", label: "Soft Palate", category: "palate" },
  { key: "oropharynx", label: "Oropharynx", category: "oropharynx" },
  { key: "gingiva", label: "Gingiva", category: "gingiva" },
  { key: "salivary_glands", label: "Salivary Glands", category: "salivaryGlands" },
];

const DentalOralExamination = ({ consultationId, data, onUpdate }) => {
  const { handlePatch: patch } = usePatch();
  const { options } = useOptions();

  const [values, setValues] = useState({});
  const saveTimer = useRef(null);

  useEffect(() => {
    setValues((prev) => ({ ...prev, ...(data || {}) }));
  }, [data]);

  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const payload = { what: "Dental Oral Examination", [field]: value };
      patch(`/api/consultations/${consultationId}/auto-save-clinical-notes`, payload)
        .then(() => {
          if (onUpdate) onUpdate();
        });
    }, 600);
  }, [consultationId, patch, onUpdate]);

  const getValue = (key) => (values && values[key] !== undefined ? values[key] : (data?.[key] || ""));

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "primary.main" }}>
        Intra-Oral Soft Tissue Examination
      </Typography>
      <Grid container spacing={2}>
        {fields.map(({ key, label, category }) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <Select
              label={label}
              value={getValue(key)}
              options={options[category] || []}
              onChange={(v) => handleChange(key, v)}
              size="small"
              fullWidth
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <TextField
            label="Other Findings"
            value={getValue("other_findings")}
            onChange={(v) => handleChange("other_findings", v || "")}
            multiline
            rows={2}
            size="small"
            fullWidth
          />
        </Grid>
        {values?.occlusion !== undefined || data?.occlusion ? (
          <Grid item xs={12} sm={6}>
            <TextField
              label="Occlusion"
              value={getValue("occlusion")}
              onChange={(v) => handleChange("occlusion", v || "")}
              size="small"
              fullWidth
            />
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
};

export default DentalOralExamination;
