import React, { useState } from "react";
import {
  Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, Stack,
} from "../../components/ui/index.jsx";
import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import DatePicker from "../../components/DatePicker";
import { useFetch, usePatch, useToast } from "../../hooks";
import { formatDateTime } from "../../helpers";

const statusColors = {
  Scheduled: "default",
  Confirmed: "primary",
  "In Progress": "info",
  Completed: "success",
  Cancelled: "error",
  "No Show": "warning",
};

const DentalAppointments = () => {
  const addToast = useToast();
  const { handlePatch: patch, loading: saving } = usePatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "",
  });
  const [form, setForm] = useState({
    patient_id: "", user_id: "", appointment_date: "", appointment_type: "Check-up",
    reason: "", notes: "", duration_minutes: 30, chair_number: "",
  });

  const { data, loading, handleFetch } = useFetch(
    "api/dental-appointments",
    { date: filters.date || undefined, status: filters.status || undefined },
    true,
    { data: [] },
    (response) => response.data.data
  );

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/dental-appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.data) {
        addToast({ message: "Appointment created", severity: "success" });
        setDialogOpen(false);
        handleFetch();
      }
    } catch (e) {
      addToast({ message: "Failed to create", severity: "error" });
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await patch(`/api/dental-appointments/${id}/mark-status`, { status });
      addToast({ message: "Status updated", severity: "success" });
      handleFetch();
    } catch {
      addToast({ message: "Failed to update", severity: "error" });
    }
  };

  const columns = [
    {
      field: "time",
      headerName: "Time",
      tableCellProps: { sx: { width: 100 } },
      valueGetter: (row) => row.appointment_date ? formatDateTime(row.appointment_date).split(" ")[1] : "-",
    },
    {
      field: "patient",
      headerName: "Patient Name",
      tableCellProps: { sx: { width: 200 } },
      valueGetter: (row) => row.patient?.full_name || `${row.patient?.first_name || ""} ${row.patient?.last_name || ""}`,
    },
    {
      field: "appointment_type",
      headerName: "Type",
      tableCellProps: { sx: { width: 120 } },
    },
    {
      field: "dentist",
      headerName: "Dentist",
      tableCellProps: { sx: { width: 180 } },
      valueGetter: (row) => row.user?.full_name || row.user?.name || "Not assigned",
    },
    {
      field: "chair_number",
      headerName: "Chair",
      tableCellProps: { sx: { width: 80 } },
      valueGetter: (row) => row.chair_number || "-",
    },
    {
      field: "duration_minutes",
      headerName: "Duration",
      tableCellProps: { sx: { width: 100 } },
      valueGetter: (row) => `${row.duration_minutes} min`,
    },
    {
      field: "status",
      headerName: "Status",
      tableCellProps: { sx: { width: 120 } },
      renderCell: (row) => (
        <Chip label={row.status} color={statusColors[row.status] || "default"} size="small" />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      tableCellProps: { sx: { width: 280 } },
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          {row.status === "Scheduled" && (
            <Button size="small" variant="outlined" onClick={() => handleStatus(row.id, "Confirmed")}>
              Confirm
            </Button>
          )}
          {row.status === "Confirmed" && (
            <Button size="small" variant="contained" color="info" onClick={() => handleStatus(row.id, "In Progress")}>
              Start
            </Button>
          )}
          {row.status === "In Progress" && (
            <Button size="small" variant="contained" color="success" onClick={() => handleStatus(row.id, "Completed")}>
              Complete
            </Button>
          )}
          {(row.status === "Scheduled" || row.status === "Confirmed") && (
            <Button size="small" variant="outlined" color="error" onClick={() => handleStatus(row.id, "Cancelled")}>
              Cancel
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Page breadcrumbs={[{ title: "Home" }, { title: "Appointments" }, { title: "Dental Appointments" }]}>
      <Card>
        <PageHeader
          title="Dental Appointments"
          trailing={
            <Button variant="contained" onClick={() => setDialogOpen(true)}>
              New Appointment
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Date"
                value={filters.date}
                onChange={(v) => setFilters({ ...filters, date: v })}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Select
                label="Status"
                value={filters.status}
                category="appointmentStatus"
                onChange={(v) => setFilters({ ...filters, status: v })}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="contained" onClick={handleFetch} fullWidth>
                Filter
              </Button>
            </Grid>
          </Grid>
          <Table
            loading={loading}
            columns={columns}
            items={data.data}
            itemCount={data.total || data.data?.length || 0}
            page={1}
            pageSize={100}
            hidePaginationFooter
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Patient ID"
                value={form.patient_id}
                onChange={(v) => setForm({ ...form, patient_id: v || "" })}
                fullWidth size="small"
                placeholder="Enter patient ID number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dentist ID"
                value={form.user_id}
                onChange={(v) => setForm({ ...form, user_id: v || "" })}
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                label="Type"
                value={form.appointment_type}
                category="appointmentType"
                onChange={(v) => setForm({ ...form, appointment_type: v })}
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date & Time"
                value={form.appointment_date}
                onChange={(v) => setForm({ ...form, appointment_date: v || "" })}
                type="datetime-local" fullWidth size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Duration (min)"
                value={form.duration_minutes}
                onChange={(v) => setForm({ ...form, duration_minutes: v || "" })}
                type="number" fullWidth size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Chair #"
                value={form.chair_number}
                onChange={(v) => setForm({ ...form, chair_number: v || "" })}
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason"
                value={form.reason}
                onChange={(v) => setForm({ ...form, reason: v || "" })}
                multiline rows={2} fullWidth size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={form.notes}
                onChange={(v) => setForm({ ...form, notes: v || "" })}
                multiline rows={2} fullWidth size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
};

export default DentalAppointments;
