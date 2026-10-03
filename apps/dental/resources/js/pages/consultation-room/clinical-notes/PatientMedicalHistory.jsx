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

const CATEGORIES = [
  { label: "Medical", value: "Medical" },
  { label: "Surgical", value: "Surgical" },
  { label: "Dental", value: "Dental" },
  { label: "Family", value: "Family" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Chronic", value: "Chronic" },
  { label: "Controlled", value: "Controlled" },
  { label: "Resolved", value: "Resolved" },
];

const statusColor = {
  Active: "error",
  Chronic: "warning",
  Controlled: "info",
  Resolved: "success",
};

const PatientMedicalHistory = ({ patientId, consultationId }) => {
  const addToast = useToast();
  const modalRef = React.useRef();

  const [formData, setFormData] = useState({
    condition_name: "",
    category: "Medical",
    details: "",
    status: "Active",
    diagnosed_date: "",
    medications: "",
  });

  const {
    data: histories,
    setData: setHistories,
    loading,
    handleFetch: fetchHistories,
  } = useFetch(
    "api/patient-medical-histories",
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
    fetchHistories();
  }, [patientId]);

  const handleAdd = () => {
    setFormData({
      condition_name: "",
      category: "Medical",
      details: "",
      status: "Active",
      diagnosed_date: "",
      medications: "",
    });
    modalRef.current.open("Add Medical History");
  };

  const handleSave = () => {
    if (!formData.condition_name.trim()) {
      addToast({ message: "Condition name is required", severity: "error" });
      return;
    }

    handlePost("api/patient-medical-histories", {
      patient_id: patientId,
      consultation_id: consultationId,
      ...formData,
    }, (response) => {
      const newHistory = response?.data?.data || response?.data;
      if (newHistory) {
        setHistories([newHistory, ...histories]);
      }
      modalRef.current.close();
      addToast({ message: "Medical history recorded successfully", severity: "success" });
      fetchHistories();
    }, (error) => {
      addToast({ message: formatError(error), severity: "error" });
    });
  };

  const handleRemove = (historyId) => {
    handleDelete(`api/patient-medical-histories/${historyId}`, (response) => {
      setHistories(histories.filter((h) => h.id !== historyId));
      addToast({ message: "Medical history removed", severity: "success" });
    }, (error) => {
      addToast({ message: formatError(error), severity: "error" });
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {histories.length} {histories.length === 1 ? "condition" : "conditions"} recorded
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          variant="outlined"
        >
          Add Condition
        </Button>
      </Box>

      {histories.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#E0F2F1" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Condition</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Medications</TableCell>
              {isAdmin() && (
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Action
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {histories.map((history) => (
              <TableRow key={history.id}>
                <TableCell>{history.condition_name}</TableCell>
                <TableCell>{history.category || "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={history.status || "Unknown"}
                    size="small"
                    color={statusColor[history.status] || "default"}
                  />
                </TableCell>
                <TableCell>{history.details || "—"}</TableCell>
                <TableCell>{history.medications || "—"}</TableCell>
                {isAdmin() && (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemove(history.id)}
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

      {histories.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 2, color: "text.secondary" }}>
          <Typography variant="body2">No medical history recorded</Typography>
        </Box>
      )}

      <Modal ref={modalRef} onOk={handleSave}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Condition Name *"
            fullWidth
            value={formData.condition_name}
            onChange={(value) => setFormData({ ...formData, condition_name: value })}
            placeholder="e.g., Hypertension, Diabetes, Heart Disease"
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Select
              label="Category"
              fullWidth
              options={CATEGORIES}
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
            />
            <Select
              label="Status"
              fullWidth
              options={STATUS_OPTIONS}
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
            />
          </Box>
          <TextField
            label="Details"
            fullWidth
            multiline
            rows={2}
            value={formData.details}
            onChange={(value) => setFormData({ ...formData, details: value })}
            placeholder="Additional details about the condition"
          />
          <TextField
            label="Diagnosed Date"
            fullWidth
            type="date"
            value={formData.diagnosed_date}
            onChange={(value) => setFormData({ ...formData, diagnosed_date: value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Current Medications"
            fullWidth
            value={formData.medications}
            onChange={(value) => setFormData({ ...formData, medications: value })}
            placeholder="e.g., Amlodipine 5mg daily"
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default PatientMedicalHistory;
