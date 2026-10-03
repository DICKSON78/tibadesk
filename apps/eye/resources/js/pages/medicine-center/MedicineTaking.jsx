import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  MedicationRounded as MedicineIcon,
  PersonRounded as PatientIcon,
  ScheduleRounded as ScheduleIcon,
  CheckCircleRounded as CompletedIcon,
  WarningRounded as WarningIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import { useFetch, useToast } from "../../hooks";
import { formatError, numberFormat } from "../../helpers";

const MedicineTaking = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const { data, loading, error } = useFetch(
    "api/medicine-taking",
    {},
    true,
    { data: [], count: 0 }
  );

  useEffect(() => {
    document.title = `Medicine Taking - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Missed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CompletedIcon />;
      case 'Pending':
        return <ScheduleIcon />;
      case 'Missed':
        return <WarningIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  return (
    <Page
      title="Medicine Taking"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicine Taking" },
      ]}
    >
      <Card>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MedicineIcon sx={{ fontSize: 28.8, color: 'primary.main' }} />
              <Typography variant="h5">Medicine Taking Records</Typography>
            </Box>
          }
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/medicine-center/medicine-taking/create')}
            >
              Add Medicine Taking
            </Button>
          }
        />

        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table
              loading={loading}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => index + 1,
                },
                {
                  field: "patient_name",
                  headerName: "Patient Name",
                  valueGetter: (item) => item.patient?.name || 'N/A',
                },
                {
                  field: "medicine_name",
                  headerName: "Medicine",
                  valueGetter: (item) => item.medicine?.name || 'N/A',
                },
                {
                  field: "dosage",
                  headerName: "Dosage",
                  valueGetter: (item) => item.dosage || 'N/A',
                },
                {
                  field: "scheduled_time",
                  headerName: "Scheduled Time",
                  valueGetter: (item) => {
                    const date = formatDate(item.scheduled_date);
                    const time = formatTime(item.scheduled_time);
                    return `${date} at ${time}`;
                  },
                },
                {
                  field: "taken_time",
                  headerName: "Taken Time",
                  valueGetter: (item) => {
                    if (!item.taken_at) return 'Not taken';
                    const date = formatDate(item.taken_at);
                    const time = formatTime(item.taken_at.split('T')[1]);
                    return `${date} at ${time}`;
                  },
                },
                {
                  field: "status",
                  headerName: "Status",
                  renderCell: (item) => (
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                      icon={getStatusIcon(item.status)}
                    />
                  ),
                },
                {
                  field: "notes",
                  headerName: "Notes",
                  valueGetter: (item) => item.notes || 'No notes',
                },
              ]}
              items={data.data}
              itemCount={data.count}
            />
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default MedicineTaking;
