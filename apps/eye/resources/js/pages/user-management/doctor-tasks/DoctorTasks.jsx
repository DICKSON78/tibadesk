import React, { useEffect, useRef, useState } from "react";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreRounded";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import PersonIcon from "@mui/icons-material/PersonRounded";
import TaskIcon from "@mui/icons-material/TaskRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import PendingIcon from "@mui/icons-material/PendingRounded";
import PlayArrowIcon from "@mui/icons-material/PlayArrowRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";

import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";

import { useFetch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";
import moment from "moment";


const DoctorTasks = () => {
  const addToast = useToast();


  const [dateFrom, setDateFrom] = useState(moment().subtract(7, 'days').toDate());
  const [dateTo, setDateTo] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedDoctor, setExpandedDoctor] = useState(false);
  const [viewMode, setViewMode] = useState(0); // 0 = Accordion, 1 = Table

  const [params, setParams] = useState({
    page: 1,
    per_page: 10,
    date_from: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    date_to: moment().format('YYYY-MM-DD'),
    status: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/doctor-tasks",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  const { data: statistics, handleFetch: fetchStatistics } = useFetch(
    "api/doctor-tasks/statistics",
    { 
      date_from: params.date_from, 
      date_to: params.date_to 
    },
    true,
    {},
    (response) => response.data.data
  );



  useEffect(() => {
    document.title = `Doctor Tasks - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleDateFromChange = (date) => {
    setDateFrom(date);
    const dateString = moment(date).format('YYYY-MM-DD');
    setParams({ ...params, date_from: dateString, page: 1 });
  };

  const handleDateToChange = (date) => {
    setDateTo(date);
    const dateString = moment(date).format('YYYY-MM-DD');
    setParams({ ...params, date_to: dateString, page: 1 });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setParams({ 
      ...params, 
      status: status === "all" ? undefined : status, 
      page: 1 
    });
  };





  const getStatusChip = (status) => {
    const statusMap = {
      pending: { color: "warning", label: "Pending", icon: <PendingIcon fontSize="small" /> },
      in_progress: { color: "info", label: "In Progress", icon: <PlayArrowIcon fontSize="small" /> },
      completed: { color: "success", label: "Completed", icon: <CheckCircleIcon fontSize="small" /> }
    };
    
    const config = statusMap[status] || { color: "default", label: status, icon: null };
    return (
      <Chip 
        color={config.color} 
        label={config.label} 
        size="small" 
        icon={config.icon}
      />
    );
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleAccordionChange = (doctorId) => (event, isExpanded) => {
    setExpandedDoctor(isExpanded ? doctorId : false);
  };

  // Flatten all tasks for table view
  const getAllTasks = () => {
    if (!data?.data || !Array.isArray(data.data)) return [];
    
    const allTasks = [];
    data.data.forEach(doctor => {
      if (doctor.doctor_tasks && Array.isArray(doctor.doctor_tasks)) {
        doctor.doctor_tasks.forEach(task => {
          allTasks.push({
            ...task,
            doctor_name: doctor.full_name,
            doctor_department: doctor.department?.name
          });
        });
      }
    });
    return allTasks;
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "User Management" },
        { title: "Doctor Tasks" },
      ]}
    >
      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {statistics?.total_doctors || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Doctors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">
                {statistics?.pending_tasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">
                {statistics?.in_progress_tasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">
                {statistics?.completed_tasks || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="text.primary">
                {statistics?.total_patients_served || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Patients Served
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="text.primary">
                {formatDuration(Math.round(statistics?.average_completion_time || 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <PageHeader
          title="Doctor Tasks Management"
          subtitle="Monitor doctor performance and task completion"
          trailing={
            <Stack direction="row" spacing={1} alignItems="center">
              <Tabs 
                value={viewMode} 
                onChange={(e, newValue) => setViewMode(newValue)}
                size="small"
              >
                <Tab label="By Doctor" />
                <Tab label="All Tasks" />
              </Tabs>
              <Tooltip title="Refresh">
                <IconButton onClick={() => { handleFetch(); fetchStatistics(); }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          {/* Filters */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Date From"
                value={dateFrom}
                onChange={handleDateFromChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Date To"
                value={dateTo}
                onChange={handleDateToChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                label="Status Filter"
                fullWidth
                value={statusFilter}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "pending", label: "Pending" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                ]}
                optionsLabel="label"
                optionsValue="value"
                onChange={handleStatusFilter}
              />
            </Grid>
          </Grid>

          {/* Content based on view mode */}
          {viewMode === 0 ? (
            // Accordion view - By Doctor
            loading ? (
              <Typography>Loading...</Typography>
            ) : !data?.data || !Array.isArray(data.data) ? (
              <Typography>No doctors found</Typography>
            ) : (
              <Box>
                {data.data.map((doctor) => (
                  <Accordion
                    key={doctor.id}
                    expanded={expandedDoctor === doctor.id}
                    onChange={handleAccordionChange(doctor.id)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">
                            Dr. {doctor.full_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doctor.designation} • {doctor.department?.name}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box textAlign="center">
                            <Typography variant="h6" color="primary">
                              {doctor.task_statistics?.total_tasks || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total Tasks
                            </Typography>
                          </Box>
                          <Box textAlign="center">
                            <Typography variant="h6" color="success.main">
                              {doctor.task_statistics?.completed_tasks || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Completed
                            </Typography>
                          </Box>
                          <Box textAlign="center">
                            <Typography variant="h6" color="info.main">
                              {doctor.task_statistics?.patients_served || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Patients
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Table
                        loading={false}
                        columns={[
                          {
                            field: "index",
                            headerName: "S/N",
                            valueGetter: (item, index) => index + 1,
                          },
                          {
                            field: "status",
                            headerName: "Status",
                            renderCell: (item) => getStatusChip(item.status),
                          },
                          {
                            field: "patient_name",
                            headerName: "Patient",
                            valueGetter: (item) => item.patient?.full_name,
                          },
                          {
                            field: "task_type",
                            headerName: "Task Type",
                          },
                          {
                            field: "treatment_details",
                            headerName: "Treatment Details",
                            valueGetter: (item) => item.treatment_details || "-",
                          },
                          {
                            field: "assigned_at",
                            headerName: "Assigned",
                            valueGetter: (item) => moment(item.assigned_at).format('MMM DD, HH:mm'),
                          },
                          {
                            field: "duration",
                            headerName: "Duration",
                            valueGetter: (item) => {
                              if (!item.duration) return "-";
                              return formatDuration(item.duration);
                            },
                          },
                        ]}
                        items={doctor.doctor_tasks || []}
                        pagination={false}
                      />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )
          ) : (
            // Table view - All Tasks
            <Table
              loading={loading}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) =>
                    params.per_page * (params.page - 1) + index + 1,
                },
                {
                  field: "doctor_name",
                  headerName: "Doctor",
                  valueGetter: (item) => `Dr. ${item.doctor_name}`,
                },
                {
                  field: "doctor_department",
                  headerName: "Department",
                  valueGetter: (item) => item.doctor_department || "-",
                },
                {
                  field: "status",
                  headerName: "Status",
                  renderCell: (item) => getStatusChip(item.status),
                },
                {
                  field: "patient_name",
                  headerName: "Patient",
                  valueGetter: (item) => item.patient?.full_name,
                },
                {
                  field: "task_type",
                  headerName: "Task Type",
                },
                {
                  field: "treatment_details",
                  headerName: "Treatment Details",
                  valueGetter: (item) => item.treatment_details || "-",
                },
                {
                  field: "assigned_at",
                  headerName: "Assigned",
                  valueGetter: (item) => moment(item.assigned_at).format('MMM DD, HH:mm'),
                },
                {
                  field: "duration",
                  headerName: "Duration",
                  valueGetter: (item) => {
                    if (!item.duration) return "-";
                    return formatDuration(item.duration);
                  },
                },
                {
                  field: "consultation_id",
                  headerName: "Consultation",
                  valueGetter: (item) => {
                    return item.consultation_id ? `#${item.consultation_id}` : "Manual Task";
                  },
                },
                {
                  field: "task_type",
                  headerName: "Task Type",
                  valueGetter: (item) => item.task_type || "-",
                },
              ]}
              items={getAllTasks()}
              itemCount={getAllTasks().length}
              page={params.page}
              pageSize={params.per_page}
              onPageChange={(page) => setParams({ ...params, page })}
              onPageSizeChange={(value) =>
                setParams({ ...params, per_page: value, page: 1 })
              }
            />
          )}
        </CardContent>
      </Card>

    </Page>
  );
};



export default DoctorTasks;