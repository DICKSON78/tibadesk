import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  LocalHospitalRounded as ProcedureIcon,
  Person2Rounded as PatientIcon,
  AssignmentRounded as RequestsIcon,
  CheckCircleRounded as CompletedIcon,
  ScheduleRounded as ScheduledIcon,
  LibraryBooksRounded as ReportsIcon,
  MedicalServicesRounded as SurgeryIcon,
  TrendingUpRounded as ProceduresIcon,
} from "@mui/icons-material";
import {
  blue,
  cyan,
  green,
  orange,
  purple,
  teal,
  pink,
  lime,
} from "@mui/material/colors";

import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  // Set up date parameters for weekly filtering
  const [dateParams, setDateParams] = useState({
    start_date: getWeekStartDate().toISOString().split('T')[0],
    end_date: getWeekEndDate().toISOString().split('T')[0],
  });

  const { data, loading, error } = useFetch(
    "api/procedure-room/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_procedures: 0,
        scheduled_today: 0,
        completed_today: 0,
        pending_procedures: 0,
      },
      statistics: {
        top_procedures: [],
        procedure_trends: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Procedure Room Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Procedure Room Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Procedure Room Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Procedure Room" },
        { title: "Procedure Room Dashboard" },
      ]}
    >
      <CardHeader
        title="Procedure Room Dashboard"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 2,
        }}
      />
      {!loading && data ? (
        <React.Fragment>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Total Procedures"
                count={numberFormat(data.summary?.total_procedures || 0)}
                icon={<ProceduresIcon />}
                color={purple[400]}
                onClick={() => navigate('/procedure-room/procedure-requests')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Scheduled Today"
                count={numberFormat(data.summary?.scheduled_today || 0)}
                icon={<ScheduledIcon />}
                color={blue[400]}
                onClick={() => navigate('/procedure-room/procedure-requests')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Completed Today"
                count={numberFormat(data.summary?.completed_today || 0)}
                icon={<CompletedIcon />}
                color={green[400]}
                onClick={() => navigate('/procedure-room/reports/served-procedures')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Pending Procedures"
                count={numberFormat(data.summary?.pending_procedures || 0)}
                icon={<RequestsIcon />}
                color={teal[400]}
                onClick={() => navigate('/procedure-room/reports/pending-procedures')}
              />
            </Grid>
          </Grid>

          {/* Quick Actions Section */}
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/procedure-room/procedure-requests')}>
                        <RequestsIcon sx={{ fontSize: 28.8, color: purple[400], mb: 1 }} />
                        <Typography variant="subtitle2">Procedure Requests</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/patient-records/patients')}>
                        <PatientIcon sx={{ fontSize: 28.8, color: blue[400], mb: 1 }} />
                        <Typography variant="subtitle2">Patient Records</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/procedure-room/reports/served-procedures')}>
                        <CompletedIcon sx={{ fontSize: 28.8, color: green[400], mb: 1 }} />
                        <Typography variant="subtitle2">Completed Procedures</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/procedure-room/reports/pending-procedures')}>
                        <ScheduledIcon sx={{ fontSize: 28.8, color: teal[400], mb: 1 }} />
                        <Typography variant="subtitle2">Pending Procedures</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography variant="h6" gutterBottom>
                    Procedure Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                        <ProceduresIcon sx={{ fontSize: 28.8, color: purple[400], mb: 1 }} />
                        <Typography variant="h6" color={purple[400]} fontWeight="bold">
                          {numberFormat(data.summary?.total_procedures || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Procedures</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                        <ScheduledIcon sx={{ fontSize: 28.8, color: blue[400], mb: 1 }} />
                        <Typography variant="h6" color={blue[400]} fontWeight="bold">
                          {numberFormat(data.summary?.scheduled_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Scheduled Today</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 2 }}>
                        <CompletedIcon sx={{ fontSize: 28.8, color: green[400], mb: 1 }} />
                        <Typography variant="h6" color={green[400]} fontWeight="bold">
                          {numberFormat(data.summary?.completed_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Completed Today</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e0f2f1', borderRadius: 2 }}>
                        <RequestsIcon sx={{ fontSize: 28.8, color: teal[400], mb: 1 }} />
                        <Typography variant="h6" color={teal[400]} fontWeight="bold">
                          {numberFormat(data.summary?.pending_procedures || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Pending Procedures</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
    </Page>
  );
};

export default Dashboard;
