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
  MedicationRounded as MedicineIcon,
  Person2Rounded as PatientIcon,
  AssignmentRounded as RequestsIcon,
  CheckCircleRounded as CompletedIcon,
  ScheduleRounded as PendingIcon,
  LibraryBooksRounded as ReportsIcon,
  InventoryRounded as StockIcon,
  TrendingUpRounded as DispensedIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
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
    "api/medicine-center/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_medicines_dispensed: 0,
        pending_medicines: 0,
        total_medicine_items: 0,
        low_stock_medicines: 0,
      },
      statistics: {
        medicines_by_status: [],
        top_medicines: [],
        dispensing_trend: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Medicine Center Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Medicine Center Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Medicine Center Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicine Center Dashboard" },
      ]}
    >
      <CardHeader
        title="Medicine Center Dashboard"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 2,
        }}
      />
      {loading && <div>Loading...</div>}
      {!loading && data ? (
        <React.Fragment>


          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 3, border: '2px solid #e0e0e0', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#4CAF50' } }} onClick={() => navigate('/medicine-center/dispensing-requests')}>
                        <RequestsIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Process Request</Typography>
                        <Typography variant="body2" color="textSecondary">Handle dispensing requests</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 3, border: '2px solid #e0e0e0', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#FF9800' } }} onClick={() => navigate('/medicine-center/medicine-alerts')}>
                        <StockIcon sx={{ fontSize: 40, color: '#FF9800', mb: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Medicine Alerts</Typography>
                        <Typography variant="body2" color="textSecondary">View medicine alerts</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 3, border: '2px solid #e0e0e0', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#9C27B0' } }} onClick={() => navigate('/medicine-center/medicine-taking')}>
                        <MedicineIcon sx={{ fontSize: 40, color: '#9C27B0', mb: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Medicine Taking</Typography>
                        <Typography variant="body2" color="textSecondary">Manage medicine taking records</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 3, border: '2px solid #e0e0e0', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#2196F3' } }} onClick={() => navigate('/medicine-center/reports/dispensing/medicines-dispensed')}>
                        <ReportsIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Medicines Dispensed</Typography>
                        <Typography variant="body2" color="textSecondary">View dispensed reports</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 3, border: '2px solid #e0e0e0', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#9C27B0' } }} onClick={() => navigate('/medicine-center/medicine-alerts')}>
                        <StockIcon sx={{ fontSize: 40, color: '#9C27B0', mb: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Stock Alerts</Typography>
                        <Typography variant="body2" color="textSecondary">Manage stock alerts</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Medicine Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 2, border: '2px solid #c8e6c9' }}>
                        <DispensedIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="h6" color="#4CAF50" fontWeight="bold" sx={{ mb: 1 }}>
                          {numberFormat(data.summary.total_medicines_dispensed || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Medicines Dispensed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2, border: '2px solid #ffe0b2' }}>
                        <PendingIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="h6" color="#FF9800" fontWeight="bold" sx={{ mb: 1 }}>
                          {numberFormat(data.summary.pending_medicines || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Pending Medicines</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '2px solid #bbdefb' }}>
                        <CompletedIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="h6" color="#2196F3" fontWeight="bold" sx={{ mb: 1 }}>
                          {numberFormat(data.summary.total_medicine_items || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Total Medicine Items</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fce4ec', borderRadius: 2, border: '2px solid #f8bbd9' }}>
                        <StockIcon sx={{ fontSize: 28.8, color: '#E91E63', mb: 1 }} />
                        <Typography variant="h6" color="#E91E63" fontWeight="bold" sx={{ mb: 1 }}>
                          {numberFormat(data.summary.total_medicine_alerts || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Medicine Alerts</Typography>
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
