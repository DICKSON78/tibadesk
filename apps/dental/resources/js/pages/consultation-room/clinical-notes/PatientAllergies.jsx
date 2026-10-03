import React, { useEffect, useState } from "react";

import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "../../../components/ui/index.jsx";
import { Add as AddIcon, Delete as DeleteIcon } from "../../../components/ui/icons.jsx";

import Modal from "../../../components/Modal";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import { useFetch, usePost, useDelete, useToast } from "../../../hooks";
import { formatError, isAdmin } from "../../../helpers";

const ALLERGY_TYPES = [
  { label: "Drug", value: "Drug" },
  { label: "Food", value: "Food" },
  { label: "Latex", value: "Latex" },
  { label: "Environmental", value: "Environmental" },
  { label: "Other", value: "Other" },
];

const SEVERITY_LEVELS = [
  { label: "Mild", value: "Mild" },
  { label: "Moderate", value: "Moderate" },
  { label: "Severe", value: "Severe" },
  { label: "Anaphylaxis", value: "Anaphylaxis" },
];

const severityColor = {
  Mild: "success",
  Moderate: "warning",
  Severe: "error",
  Anaphylaxis: "error",
};

const PatientAllergies = ({ patientId, consultationId }) => {
  const addToast = useToast();
  const modalRef = React.useRef();

  const [formData, setFormData] = useState({
    allergen: "",
    type: "Drug",
    severity: "Mild",
    reaction: "",
    notes: "",
  });

  const {
    data: allergies,
    setData: setAllergies,
    loading,
    handleFetch: fetchAllergies,
  } = useFetch(
    "api/patient-allergies",
    { patient_id: patientId, is_active: true, per_page: 500 },
    false,
    [],
    (response) => {
      const data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      return Array.isArray(data) ? data : [];
    }
  );

  const { handlePost, loading: posting } = usePost();
  const { handleDelete } = useDelete();

  useEffect(() => {
    fetchAllergies();
  }, [patientId]);

  const handleAdd = () => {
    setFormData({
      allergen: "",
      type: "Drug",
      severity: "Mild",
      reaction: "",
      notes: "",
    });
    modalRef.current.open("Add Allergy");
  };

  const handleSave = () => {
    if (!formData.allergen.trim()) {
      addToast({ message: "Allergen is required", severity: "error" });
      return;
    }

    handlePost("api/patient-allergies", {
      patient_id: patientId,
      consultation_id: consultationId,
      ...formData,
    }, (response) => {
      const newAllergy = response?.data?.data || response?.data;
      if (newAllergy) {
        setAllergies([newAllergy, ...allergies]);
      }
      modalRef.current.close();
      addToast({ message: "Allergy recorded successfully", severity: "success" });
      fetchAllergies();
    }, (error) => {
      addToast({ message: formatError(error), severity: "error" });
    });
  };

  const handleRemove = (allergyId) => {
    handleDelete(`api/patient-allergies/${allergyId}`, (response) => {
      setAllergies(allergies.filter((a) => a.id !== allergyId));
      addToast({ message: "Allergy removed", severity: "success" });
    }, (error) => {
      addToast({ message: formatError(error), severity: "error" });
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {allergies.length} active {allergies.length === 1 ? "allergy" : "allergies"} recorded
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          variant="outlined"
        >
          Add Allergy
        </Button>
      </Box>

      {allergies.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#E0F2F1" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Allergen</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Severity</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Reaction</TableCell>
              {isAdmin() && (
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Action
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {allergies.map((allergy) => (
              <TableRow key={allergy.id}>
                <TableCell>{allergy.allergen}</TableCell>
                <TableCell>{allergy.type || "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={allergy.severity || "Unknown"}
                    size="small"
                    color={severityColor[allergy.severity] || "default"}
                  />
                </TableCell>
                <TableCell>{allergy.reaction || "—"}</TableCell>
                {isAdmin() && (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemove(allergy.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {allergies.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
          <Typography variant="body2">No allergies recorded</Typography>
        </Box>
      )}

      <Modal ref={modalRef} onOk={handleSave}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Allergen *"
            fullWidth
            value={formData.allergen}
            onChange={(value) => setFormData({ ...formData, allergen: value })}
            placeholder="e.g., Penicillin, Amoxicillin, Sulfa drugs"
          />
          <Select
            label="Type"
            fullWidth
            options={ALLERGY_TYPES}
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value })}
          />
          <Select
            label="Severity"
            fullWidth
            options={SEVERITY_LEVELS}
            value={formData.severity}
            onChange={(value) => setFormData({ ...formData, severity: value })}
          />
          <TextField
            label="Reaction"
            fullWidth
            multiline
            rows={2}
            value={formData.reaction}
            onChange={(value) => setFormData({ ...formData, reaction: value })}
            placeholder="e.g., Rash, Swelling, Difficulty breathing"
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={2}
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            placeholder="Additional notes"
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default PatientAllergies;
