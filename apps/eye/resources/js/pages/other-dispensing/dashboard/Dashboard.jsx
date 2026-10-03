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
  InventoryRounded as DispensingIcon,
  AssignmentRounded as RequestsIcon,
  LibraryBooksRounded as ReportsIcon,
  InventoryRounded as StockIcon,
  InventoryRounded as InventoryIcon,
  TrendingUpRounded as DispensedIcon,
  CheckCircleRounded as CompletedIcon,
  ScheduleRounded as PendingIcon,
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
    "api/other-dispensing/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_dispensed: 0,
        pending_requests: 0,
        completed_today: 0,
        items_dispensed: 0,
      },
      statistics: {
        top_dispensed_items: [],
        dispensing_trend: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Other Dispensing Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Other Dispensing Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Other Dispensing Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Other Dispensing" },
        { title: "Other Dispensing Dashboard" },
      ]}
    >
      <CardHeader
        title="Other Dispensing Dashboard"
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
          {/* Other Dispensing Features Overview */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DispensingIcon sx={{ fontSize: 28.8, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                    Other Dispensing Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    General item dispensing, equipment distribution, and supply management
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#FF9800', color: 'white', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#F57C00' } }} onClick={() => navigate('/other-dispensing/dispensing-requests')}>
                    <RequestsIcon sx={{ fontSize: 24, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">Dispensing Requests</Typography>
                    <Typography variant="caption">Process item requests</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#4CAF50', color: 'white', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#388E3C' } }} onClick={() => navigate('/other-dispensing/reports/items-dispensed')}>
                    <ReportsIcon sx={{ fontSize: 24, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">Items Dispensed</Typography>
                    <Typography variant="caption">View dispensed items</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#2196F3', color: 'white', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#1976D2' } }} onClick={() => navigate('/other-dispensing/reports/item-balance')}>
                    <StockIcon sx={{ fontSize: 24, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">Item Balance</Typography>
                    <Typography variant="caption">Stock balance</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#9C27B0', color: 'white', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#7B1FA2' } }} onClick={() => navigate('/inventory-management/stock-alerts')}>
                    <InventoryIcon sx={{ fontSize: 24, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">Stock Alerts</Typography>
                    <Typography variant="caption">Inventory alerts</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => navigate('/other-dispensing/dispensing-requests')}>
                        <RequestsIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="subtitle2">Process Request</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => navigate('/other-dispensing/reports/items-dispensed')}>
                        <ReportsIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="subtitle2">Items Dispensed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => navigate('/other-dispensing/reports/item-balance')}>
                        <StockIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="subtitle2">Item Balance</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }} onClick={() => navigate('/inventory-management/stock-alerts')}>
                        <InventoryIcon sx={{ fontSize: 28.8, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="subtitle2">Stock Alerts</Typography>
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
                    Dispensing Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 2 }}>
                        <DispensedIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="h4" color="#4CAF50" fontWeight="bold">
                          {numberFormat(data.summary.total_dispensed || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Dispensed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                        <PendingIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="h4" color="#FF9800" fontWeight="bold">
                          {numberFormat(data.summary.pending_requests || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Pending Requests</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                        <CompletedIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="h4" color="#2196F3" fontWeight="bold">
                          {numberFormat(data.summary.completed_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Completed Today</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fce4ec', borderRadius: 2 }}>
                        <DispensingIcon sx={{ fontSize: 28.8, color: '#E91E63', mb: 1 }} />
                        <Typography variant="h4" color="#E91E63" fontWeight="bold">
                          {numberFormat(data.summary.items_dispensed || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Items Dispensed</Typography>
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
