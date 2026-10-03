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
} from "@mui/icons-material";

import Page from "../../../components/Page";
import { useFetch, useToast } from "../../../hooks";
import { formatError, formatDate } from "../../../helpers";

const Prescriptions = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch consultations with prescriptions/medications
  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    {
      search: searchTerm,
      status: statusFilter === "all" ? undefined : statusFilter,
      per_page: 50,
      with_items: "Yes",
      with_diagnoses: "Yes",
    },
    true,
    [],
    (response) => {
      // Robust extraction regardless of pagination shape
      const payload = response?.data?.data;
      const list = Array.isArray(payload) ? payload : payload?.data;
      const consultations = Array.isArray(list) ? list : [];
      return consultations.filter(c => Array.isArray(c.items) && c.items.length > 0);
    }
  );

  useEffect(() => {
    document.title = `Prescriptions - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Prescriptions fetch error:', error);
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

  // Prescriptions are created through consultations, not directly

  const handleView = (consultation) => {
    const patientId = consultation.payment_cache_item?.payment_cache?.check_in?.patient_id;
    if (patientId && consultation.id) {
      navigate(`/consultation-room/consultation-patients/consulted/${patientId}/${consultation.id}/clinical-notes`);
    }
  };

  return (
    <Page
      title="Prescriptions"
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: "Prescriptions" },
      ]}
    >
      <Card>
        <CardHeader
          title="Prescriptions"
        />
        <CardContent>
          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search prescriptions..."
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
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

          {/* Prescriptions Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Prescription Items</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Loading prescriptions...
                    </TableCell>
                  </TableRow>
                ) : !data || !Array.isArray(data) || data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No prescriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {consultation.payment_cache_item?.payment_cache?.check_in?.patient?.full_name || "Unknown Patient"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {Array.isArray(consultation.items) ? consultation.items
                            .slice(0, 3)
                            .map((item, index) => (
                            <Typography key={index} variant="caption" display="block">
                              {item?.item?.name || 'Unknown Item'} - {item?.quantity || 0} {item?.unit_of_measure?.name || 'units'}
                            </Typography>
                          )) : (
                            <Typography variant="caption" color="text.secondary">
                              No items available
                            </Typography>
                          )}
                          {Array.isArray(consultation.items) && consultation.items.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{consultation.items.length - 3} more items
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={consultation.status || "Consulted"}
                          color={consultation.status === "Consulted" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(consultation.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleView(consultation)}
                            title="View Details"
                            color="primary"
                          >
                            <ViewIcon fontSize="small" />
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

export default Prescriptions;
