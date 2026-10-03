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
  VisibilityRounded as OpticianIcon,
  Person2Rounded as PatientIcon,
  AddRounded as LensIcon,
  AssessmentRounded as RefractionIcon,
  MedicalServicesRounded as EyeExamIcon,
  LibraryBooksRounded as ReportsIcon,
  ScheduleRounded as ScheduleIcon,
  InventoryRounded as InventoryIcon,
  AttachMoneyRounded as AttachMoneyIcon,
  LocalPharmacyRounded as GlassIcon,
  ContactsRounded as ContactLensIcon,
  ShoppingCartRounded as FrameIcon,
} from "@mui/icons-material";
import {
  blue,
  cyan,
  green,
  lime,
  pink,
  purple,
  teal,
  orange,
} from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";

import Page from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  // Set up date parameters for weekly filtering
  const [dateParams, setDateParams] = useState({
    start_date: getWeekStartDate().toISOString().split('T')[0],
    end_date: getWeekEndDate().toISOString().split('T')[0],
  });

  const { data, loading, error } = useFetch(
    "api/optician-center/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_glass_patients: 0,
        glass_patients_today: 0,
        refractions_today: 0,
        lens_fittings: 0,
        scheduled_appointments: 0,
        completed_appointments: 0,
        pending_appointments: 0,
        total_revenue: 0,
        items_dispensed: 0,
      },
      statistics: {
        appointments_by_status: [],
        revenue_trend: [],
        top_items_dispensed: [],
        appointments_trend: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Optician Center Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Optician Center Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Optician Center Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Optician Center" },
        { title: "Optician Center Dashboard" },
      ]}
    >
      <CardHeader
        title="Optician Center Dashboard"
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
            <InfoCard
              title="Total Glass Patients"
              count={numberFormat(data.summary?.total_glass_patients || 0)}
              icon={<GlassIcon />}
              color={purple[300]}
              onClick={() => navigate('/optician-center/glass-patients')}
            />
            <InfoCard
              title="Glass Patients Today"
              count={numberFormat(data.summary?.glass_patients_today || 0)}
              icon={<PatientIcon />}
              color={blue[400]}
              onClick={() => navigate('/optician-center/glass-patients')}
            />
            <InfoCard
              title="Refractions Today"
              count={numberFormat(data.summary?.refractions_today || 0)}
              icon={<RefractionIcon />}
              color={green[400]}
              onClick={() => navigate('/optician-center/glass-patients')}
            />
            <InfoCard
              title="Lens Fittings"
              count={numberFormat(data.summary?.lens_fittings || 0)}
              icon={<LensIcon />}
              color={teal[400]}
              onClick={() => navigate('/optician-center/dispensing-requests')}
            />
            <InfoCard
              title="Scheduled Appointments"
              count={numberFormat(data.summary?.scheduled_appointments || 0)}
              icon={<ScheduleIcon />}
              color={orange[400]}
              onClick={() => navigate('/optician-center/glass-patients')}
            />
            <InfoCard
              title="Completed Appointments"
              count={numberFormat(data.summary?.completed_appointments || 0)}
              icon={<EyeExamIcon />}
              color={cyan[500]}
              onClick={() => navigate('/optician-center/glass-patients')}
            />
            <InfoCard
              title="Pending Appointments"
              count={numberFormat(data.summary?.pending_appointments || 0)}
              icon={<ReportsIcon />}
              color={pink[400]}
              onClick={() => navigate('/optician-center/glass-patients')}
            />
            <InfoCard
              title="Items Dispensed"
              count={numberFormat(data.summary?.items_dispensed || 0)}
              icon={<InventoryIcon />}
              color={lime[600]}
              onClick={() => navigate('/optician-center/reports/items-dispensed')}
            />
          </Grid>

          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            justifyContent="stretch"
            sx={{
              "& .MuiCard-root": {
                minHeight: "100%",
              },
            }}
          >
            <Grid item md={6} sm={12} xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/optician-center/glass-patients')}>
                        <GlassIcon sx={{ fontSize: 28.8, color: purple[300], mb: 1 }} />
                        <Typography variant="subtitle2">Glass Patients</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/optician-center/dispensing-requests')}>
                        <ContactLensIcon sx={{ fontSize: 28.8, color: blue[400], mb: 1 }} />
                        <Typography variant="subtitle2">Dispensing Requests</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/optician-center/reports/items-dispensed')}>
                        <FrameIcon sx={{ fontSize: 28.8, color: green[400], mb: 1 }} />
                        <Typography variant="subtitle2">Items Dispensed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/optician-center/reports/item-balance')}>
                        <InventoryIcon sx={{ fontSize: 28.8, color: teal[400], mb: 1 }} />
                        <Typography variant="subtitle2">Item Balance</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item md={6} sm={12} xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Optical Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <GlassIcon sx={{ fontSize: 28.8, color: purple[300], mb: 1 }} />
                        <Typography variant="h6" color={purple[300]} fontWeight="bold">
                          {numberFormat(data.summary?.total_glass_patients || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Glass Patients</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <ContactLensIcon sx={{ fontSize: 28.8, color: blue[400], mb: 1 }} />
                        <Typography variant="h6" color={blue[400]} fontWeight="bold">
                          {numberFormat(data.summary?.glass_patients_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Glass Patients Today</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <FrameIcon sx={{ fontSize: 28.8, color: green[400], mb: 1 }} />
                        <Typography variant="h6" color={green[400]} fontWeight="bold">
                          {numberFormat(data.summary?.lens_fittings || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Lens Fittings</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <AttachMoneyIcon sx={{ fontSize: 28.8, color: cyan[500], mb: 1 }} />
                        <Typography variant="h6" color={cyan[500]} fontWeight="bold">
                          {numberFormat(data.summary?.total_revenue || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Revenue (TZS)</Typography>
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
