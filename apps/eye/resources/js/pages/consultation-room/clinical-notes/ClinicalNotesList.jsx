import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import { useFetch, useToast } from "../../../hooks";
import { formatError, formatDate } from "../../../helpers";

const ClinicalNotesList = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch from consultations as the single source of truth
  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    {
      search: searchTerm,
      status: statusFilter === "all" ? undefined : statusFilter,
      per_page: 50,
      with_diagnoses: "Yes",
      with_items: "Yes",
    },
    true,
    [],
    (response) => {
      // Robustly extract array regardless of backend pagination shape
      const payload = response?.data?.data;
      const list = Array.isArray(payload) ? payload : payload?.data;
      return Array.isArray(list) ? list : [];
    }
  );

  // No create/update/delete here; lists derive from consultations only

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleFetch();
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    handleFetch();
  };

  // Creation is disabled; view comes from consultations

  const handleEdit = (note) => {
    // Route into the consultation record for editing
    const patientId = note.payment_cache_item?.payment_cache?.check_in?.patient_id;
    if (patientId && note.id) {
      navigate(`/consultation-room/consultation-patients/consulted/${patientId}/${note.id}/clinical-notes`);
    }
  };

  const handleDelete = () => {};

  const handleView = (note) => {
    const patientId = note.payment_cache_item?.payment_cache?.check_in?.patient_id;
    if (patientId && note.id) {
      navigate(`/consultation-room/consultation-patients/consulted/${patientId}/${note.id}/clinical-notes`);
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "draft":
        return "warning";
      case "cancelled":
        return "error";
      case "reviewed":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "draft":
        return "Draft";
      case "cancelled":
        return "Cancelled";
      case "reviewed":
        return "Reviewed";
      default:
        return status;
    }
  };

  return (
    <Page
      title="Clinical Notes"
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: "Clinical Notes" },
      ]}
    >
      <Card>
        <CardHeader
          title="Clinical Notes"
        />
        <CardContent>
          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search clinical notes..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleFetch}
                size="small"
              >
                Refresh
              </Button>
            </Grid>
          </Grid>

          {/* Clinical Notes Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Chief Complaint</TableCell>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading clinical notes...
                    </TableCell>
                  </TableRow>
                ) : !data || !Array.isArray(data) || data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No clinical notes found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {note.payment_cache_item?.payment_cache?.check_in?.patient?.full_name || "Unknown Patient"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {note.chief_complaint || "No chief complaint"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {Array.isArray(note.diagnoses) && note.diagnoses.length > 0
                            ? note.diagnoses.map(d => d?.disease?.name).filter(Boolean).join(", ")
                            : "No diagnosis"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {Array.isArray(note.items) && note.items.length > 0
                            ? note.items.map(i => i?.item?.name).filter(Boolean).join(", ")
                            : "No medicine"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(note.status)}
                          color={getStatusColor(note.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(note.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleView(note)}
                            title="View Details"
                            color="primary"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(note)}
                            title="Edit"
                            color="secondary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

    </Page>
  );
};

export default ClinicalNotesList;
