import React, { useEffect, useRef, useState } from "react";
import {
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
  Box,
  Container,
  Paper,
  TableContainer,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select as MuiSelect,
} from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrowRounded";
import StopIcon from "@mui/icons-material/StopRounded";
import TimerIcon from "@mui/icons-material/TimerRounded";
import PaymentIcon from "@mui/icons-material/PaymentRounded";
import MedicalServicesIcon from "@mui/icons-material/MedicalServicesRounded";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacyRounded";
import LocalHospitalIcon from "@mui/icons-material/LocalHospitalRounded";
import AccessTimeIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarTodayIcon from "@mui/icons-material/CalendarTodayRounded";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from "moment";

import { useFetch, usePost, useToast } from "../../hooks";
import { formatError } from "../../helpers";

// Simple Page component
const Page = ({ children, breadcrumbs }) => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {breadcrumbs && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {crumb.title}
              {index < breadcrumbs.length - 1 && " > "}
            </span>
          ))}
        </Typography>
      )}
      {children}
    </Container>
  );
};

// Simple Header component
const Header = ({ title, subtitle, trailing }) => {
  return (
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {trailing && <Box>{trailing}</Box>}
    </Box>
  );
};

// Custom Table component
const Table = ({ 
  loading, 
  columns, 
  items, 
  itemCount, 
  page, 
  pageSize, 
  onPageChange, 
  onPageSizeChange 
}) => {
  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <MuiTable>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                Loading...
              </TableCell>
            </TableRow>
          ) : items?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            items?.map((item, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {column.renderCell 
                      ? column.renderCell(item, rowIndex)
                      : column.valueGetter 
                        ? column.valueGetter(item, rowIndex)
                        : item[column.field]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </MuiTable>
      <TablePagination
        component="div"
        count={itemCount}
        page={page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[25, 50, 100]}
      />
    </TableContainer>
  );
};

// Custom DatePicker component
const DatePicker = ({ label, value, onChange, fullWidth }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <MuiDatePicker
        label={label}
        value={moment(value)}
        onChange={(newValue) => onChange(newValue?.toDate())}
        renderInput={(params) => <TextField {...params} fullWidth={fullWidth} />}
      />
    </LocalizationProvider>
  );
};

// Custom Select component
const Select = ({ 
  label, 
  fullWidth, 
  value, 
  options, 
  optionsLabel, 
  optionsValue, 
  onChange 
}) => {
  return (
    <FormControl fullWidth={fullWidth}>
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option, index) => (
          <MenuItem 
            key={index} 
            value={option[optionsValue]}
          >
            {option[optionsLabel]}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

// Real-time Clock Component
const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
      <CardContent sx={{ py: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {moment(currentTime).format('dddd, MMMM Do YYYY')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Current Date
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {moment(currentTime).format('HH:mm:ss')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Current Time
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {moment(currentTime).format('A')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Time Period
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {moment(currentTime).format('SSS')}ms
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Live Counter
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const PatientWaitingTime = () => {
  const addToast = useToast();

  // Fully automatic tracking - no manual actions needed

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [realTimeUpdate, setRealTimeUpdate] = useState(true);

  const [params, setParams] = useState({
    page: 1,
    per_page: 50,
    date: moment().format('YYYY-MM-DD'), // Use current date
    status: undefined,
  });

  const { data, loading, error, handleFetch, setData } = useFetch(
    "api/patient-waiting-times",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => {
      console.log('Patient waiting times response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data.data);
      return response.data.data;
    }
  );

  const { data: statistics, handleFetch: fetchStatistics, setData: setStatistics } = useFetch(
    "api/patient-waiting-times/statistics",
    { date: params.date },
    true,
    {},
    (response) => {
      console.log('Statistics response:', response);
      console.log('Statistics data:', response.data);
      console.log('Statistics data.data:', response.data.data);
      return response.data.data;
    }
  );

  useEffect(() => {
    document.title = `Patient Waiting Time - ${window.APP_NAME || 'Healthcare System'}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  // Debug data changes
  useEffect(() => {
    console.log('Data changed:', data);
    console.log('Statistics changed:', statistics);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [data, statistics, loading, error]);

  // Removed periodic auto-refresh to avoid constant page refresh feeling

  // Real-time update for active patients (every second)
  const [activePatients, setActivePatients] = useState([]);
  
  useEffect(() => {
    if (data?.data) {
      const active = data.data.filter(item => 
        item.status === 'waiting' || item.status === 'in_treatment'
      );
      setActivePatients(active);
    }
  }, [data]);

  // Update active patient times every second (only for non-completed patients)
  useEffect(() => {
    let interval;
    const nonCompletedPatients = activePatients.filter(patient => patient.status !== 'completed');
    
    if (nonCompletedPatients.length > 0) {
      interval = setInterval(() => {
        setActivePatients(prev => 
          prev.map(patient => {
            // Don't update completed patients - their times should be fixed
            if (patient.status === 'completed') {
              return patient;
            }
            
            const now = moment();
            let currentWaitingMinutes = patient.current_waiting_minutes;
            let currentTreatmentMinutes = patient.current_treatment_minutes;
            let currentDepartmentMinutes = patient.current_department_minutes;
            
            // Calculate current waiting time
            if (patient.status === 'waiting' && patient.registration_time) {
              currentWaitingMinutes = now.diff(moment(patient.registration_time), 'minutes');
            }
            
            // Calculate current treatment time
            if (patient.status === 'in_treatment' && patient.treatment_start_time) {
              currentTreatmentMinutes = now.diff(moment(patient.treatment_start_time), 'minutes');
            }
            
            // Calculate current department time based on department history
            if (patient.current_department && patient.department_history) {
              const history = Array.isArray(patient.department_history) ? patient.department_history : [];
              const currentEntry = history.find(entry => entry.department === patient.current_department);
              if (currentEntry && currentEntry.moved_at) {
                currentDepartmentMinutes = now.diff(moment(currentEntry.moved_at), 'minutes');
              }
            }
            
            return {
              ...patient,
              current_waiting_minutes: currentWaitingMinutes,
              current_treatment_minutes: currentTreatmentMinutes,
              current_department_minutes: currentDepartmentMinutes
            };
          })
        );
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activePatients.length]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const dateString = moment(date).format('YYYY-MM-DD');
    setParams({ ...params, date: dateString, page: 1 });
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
      waiting: { color: "warning", label: "Waiting" },
      in_treatment: { color: "info", label: "In Treatment" },
      completed: { color: "success", label: "Completed" }
    };
    
    const config = statusMap[status] || { color: "default", label: status };
    return <Chip color={config.color} label={config.label} size="small" />;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getCurrentTime = (item) => {
    // For completed patients, use the stored duration values (don't calculate real-time)
    if (item.status === 'completed') {
      if (item.waiting_duration_minutes) {
        return formatDuration(item.waiting_duration_minutes);
      }
      if (item.treatment_duration_minutes) {
        return formatDuration(item.treatment_duration_minutes);
      }
      return "-";
    }
    
    // For active patients, calculate real-time
    const now = moment();
    if (item.status === 'waiting' && item.registration_time) {
      return formatDuration(now.diff(moment(item.registration_time), 'minutes'));
    }
    if (item.status === 'in_treatment' && item.treatment_start_time) {
      return formatDuration(now.diff(moment(item.treatment_start_time), 'minutes'));
    }
    return "-";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patient Waiting Time" },
      ]}
    >
      {/* Real-time Clock Display */}
      <RealTimeClock />

      {/* Information Card */}
      <Card sx={{ mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Patient Waiting Time Tracking
              </Typography>
              <Typography variant="body2">
                Automatic patient flow tracking from registration to completion. 
                <strong>No manual intervention required.</strong>
              </Typography>
            </Box>

          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {statistics?.currently_waiting || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Currently Waiting
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {statistics?.total_patients_today || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">
                {statistics?.currently_waiting || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Waiting
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">
                {statistics?.in_treatment || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Treatment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">
                {statistics?.completed_today || 0}
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
                {formatDuration(Math.round(statistics?.average_waiting_time || 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Wait
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="text.primary">
                {formatDuration(Math.round(statistics?.average_treatment_time || 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Treatment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Header
          title="Patient Waiting Time Monitor"
          subtitle="Real-time patient flow tracking"
          trailing={
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={realTimeUpdate ? "Disable auto-refresh" : "Enable auto-refresh"}>
                <IconButton 
                  onClick={() => setRealTimeUpdate(!realTimeUpdate)}
                  color={realTimeUpdate ? "primary" : "default"}
                >
                  <TimerIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh now">
                <IconButton onClick={() => { handleFetch(); fetchStatistics(); }}>
                  <AccessTimeIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
        <Divider />
        <CardContent>
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
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
                  { value: "waiting", label: "Waiting" },
                  { value: "in_treatment", label: "In Treatment" },
                  { value: "completed", label: "Completed" },
                ]}
                optionsLabel="label"
                optionsValue="value"
                onChange={handleStatusFilter}
              />
            </Grid>
          </Grid>

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
                field: "status",
                headerName: "Status",
                renderCell: (item) => getStatusChip(item.status),
              },
              {
                field: "patient_name",
                headerName: "Patient Name",
                valueGetter: (item) => item.patient?.full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient #",
                valueGetter: (item) => item.patient?.id,
              },
              {
                field: "registration_time",
                headerName: "Registration Time",
                valueGetter: (item) => moment(item.registration_time).format('HH:mm'),
              },
              {
                field: "waiting_duration",
                headerName: "Waiting Duration",
                renderCell: (item) => {
                  console.log('Waiting duration for patient:', item.patient?.full_name, {
                    status: item.status,
                    registration_time: item.registration_time,
                    treatment_start_time: item.treatment_start_time,
                    waiting_duration_minutes: item.waiting_duration_minutes,
                    current_waiting_minutes: item.current_waiting_minutes
                  });
                  
                  let duration = 0;
                  
                  if (item.status === 'waiting') {
                    // For waiting patients, calculate real-time waiting duration
                    if (item.registration_time) {
                      duration = moment().diff(moment(item.registration_time), 'minutes');
                    }
                  } else if (item.status === 'in_treatment') {
                    // For patients in treatment, use stored waiting duration or calculate from times
                    if (item.waiting_duration_minutes) {
                      duration = item.waiting_duration_minutes;
                    } else if (item.registration_time && item.treatment_start_time) {
                      duration = moment(item.treatment_start_time).diff(moment(item.registration_time), 'minutes');
                    }
                  } else if (item.status === 'completed') {
                    // For completed patients, use stored waiting duration (fixed value)
                    duration = item.waiting_duration_minutes || 0;
                  }
                  
                  return (
                    <Typography 
                      variant="body2" 
                      color={item.status === 'waiting' ? 'warning.main' : item.status === 'completed' ? 'success.main' : 'text.primary'}
                      fontWeight={item.status === 'waiting' ? 'bold' : 'normal'}
                    >
                      {duration > 0 ? formatDuration(duration) : "-"}
                    </Typography>
                  );
                },
              },
              {
                field: "doctor",
                headerName: "Doctor",
                renderCell: (item) => {
                  console.log('Doctor info for patient:', item.patient?.full_name, {
                    doctor_id: item.doctor_id,
                    doctor: item.doctor,
                    consultations: item.patient?.consultations
                  });
                  
                  // Try to get doctor name from different sources
                  let doctorName = null;
                  
                  // 1. First try the loaded doctor relationship (assigned doctor)
                  if (item.doctor && item.doctor.full_name) {
                    doctorName = item.doctor.full_name;
                  }
                  // 2. If no doctor relationship but we have doctor_id, show the ID temporarily
                  else if (item.doctor_id) {
                    doctorName = `Doctor ID: ${item.doctor_id}`;
                  }
                  // 3. If no doctor at all, show dash
                  else {
                    doctorName = "-";
                  }
                  
                  return doctorName;
                },
              },
              {
                field: "current_department",
                headerName: "Current Department",
                valueGetter: (item) => {
                  // Determine current department based on status and history
                  let currentDept = item.current_department;
                  
                  // If no current department is set, try to determine from status
                  if (!currentDept) {
                    if (item.status === 'waiting') {
                      currentDept = 'reception';
                    } else if (item.status === 'in_treatment') {
                      // Check if there's a doctor assigned to determine department
                      if (item.doctor_id) {
                        currentDept = 'consultation';
                      } else {
                        currentDept = 'reception';
                      }
                    }
                  }
                  
                  // If still no department, default to reception
                  currentDept = currentDept || 'reception';
                  
                  const deptNames = {
                    'reception': 'Reception',
                    'cashier': 'Cashier',
                    'consultation': 'Consultation',
                    'dispensing': 'Dispensing',
                    'procedure_room': 'Procedure Room'
                  };
                  return deptNames[currentDept] || currentDept;
                },
              },
              {
                field: "department_time",
                headerName: "Dept. Time",
                renderCell: (item) => {
                  let time = 0;
                  
                  // Debug: Log department history
                  console.log('Department history for patient:', item.patient?.full_name, item.department_history);
                  console.log('Current department:', item.current_department);
                  
                  // For completed patients, department time should be fixed (not counting)
                  if (item.status === 'completed') {
                    // Calculate time from last department entry to treatment end time
                    if (item.current_department && item.department_history) {
                      const currentEntry = item.department_history
                        .filter(entry => entry.department === item.current_department)
                        .pop(); // Get the last entry for this department
                      
                      if (currentEntry && item.treatment_end_time) {
                        const entryTime = moment(currentEntry.moved_at);
                        const endTime = moment(item.treatment_end_time);
                        time = endTime.diff(entryTime, 'minutes');
                        console.log('Completed patient - fixed dept time for', item.current_department, ':', time, 'minutes');
                      }
                    }
                  } else {
                    // For active patients, calculate real-time department time
                    if (item.current_department && item.department_history) {
                      const currentEntry = item.department_history
                        .filter(entry => entry.department === item.current_department)
                        .pop(); // Get the last entry for this department
                      
                      if (currentEntry) {
                        const entryTime = moment(currentEntry.moved_at);
                        const now = moment();
                        time = now.diff(entryTime, 'minutes');
                        console.log('Active patient - real-time dept time for', item.current_department, ':', time, 'minutes');
                      }
                    }
                    
                    // Fallback: if no department history, use registration time
                    if (time === 0 && item.registration_time) {
                      const now = moment();
                      time = now.diff(moment(item.registration_time), 'minutes');
                      console.log('Using registration time fallback:', time, 'minutes');
                    }
                  }
                  
                  return (
                    <Typography 
                      variant="body2" 
                      color={item.status === 'completed' ? "success.main" : "info.main"}
                      fontWeight="medium"
                    >
                      {formatDuration(time)}
                    </Typography>
                  );
                },
              },
              {
                field: "treatment_time",
                headerName: "Treatment Time",
                renderCell: (item) => {
                  if (item.status === 'in_treatment') {
                    const time = item.current_treatment_minutes || 0;
                    return (
                      <Typography 
                        variant="body2" 
                        color="info.main"
                        fontWeight="bold"
                      >
                        {formatDuration(time)}
                      </Typography>
                    );
                  } else if (item.status === 'completed') {
                    return (
                      <Typography 
                        variant="body2" 
                        color="success.main"
                        fontWeight="medium"
                      >
                        {formatDuration(item.treatment_duration_minutes || 0)}
                      </Typography>
                    );
                  }
                  return "-";
                },
              },
            ]}
            items={activePatients.length > 0 ? activePatients : (data?.data || [])}
            itemCount={data?.total || 0}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />

          {/* Real-time indicator */}
          {realTimeUpdate && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                <TimerIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Auto-refreshing every 30 seconds
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default PatientWaitingTime;