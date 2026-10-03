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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  InventoryRounded as InventoryIcon,
  AddRounded as AddItemIcon,
  AssessmentRounded as StocktakingIcon,
  LibraryBooksRounded as ReportsIcon,
  WarningRounded as LowStockIcon,
  TrendingUpRounded as StockInIcon,
  TrendingDownRounded as StockOutIcon,
  RefreshRounded as RefreshIcon,
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

  const { data, loading, error, handleFetch } = useFetch(
    "api/inventory-management/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_items: 0,
        low_stock_items: 0,
        stock_in_today: 0,
        stock_out_today: 0,
      },
      statistics: {
        recent_activities: [],
        low_stock_items: [],
        stock_movement_trend: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Inventory Management Dashboard - ${window.APP_NAME}`;
  }, []);

  // Auto-refresh when page becomes visible (user returns from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleFetch]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleRefresh = () => {
    handleFetch();
    addToast({ message: "Dashboard refreshed", severity: "success" });
  };

  if (loading) {
    return (
      <Page title="Inventory Management Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Inventory Management Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Inventory Management" },
        { title: "Inventory Management Dashboard" },
      ]}
    >
      <CardHeader
        title="Inventory Management Dashboard"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        action={
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
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
              title="Total Items"
              count={numberFormat(data.summary?.total_items || 0)}
              icon={<InventoryIcon />}
              color={purple[400]}
              onClick={() => navigate('/inventory-management/stocktaking')}
            />
            <InfoCard
              title="Low Stock Items"
              count={numberFormat(data.summary?.low_stock_items || 0)}
              icon={<LowStockIcon />}
              color={blue[400]}
              onClick={() => navigate('/inventory-management/stock-alerts')}
            />
            <InfoCard
              title="Stock In Today"
              count={numberFormat(data.summary?.stock_in_today || 0)}
              icon={<StockInIcon />}
              color={green[400]}
              onClick={() => navigate('/inventory-management/reports/stock-management/item-balance')}
            />
            <InfoCard
              title="Stock Out Today"
              count={numberFormat(data.summary?.stock_out_today || 0)}
              icon={<StockOutIcon />}
              color={teal[400]}
              onClick={() => navigate('/inventory-management/reports/stock-alerts')}
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
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/inventory-management/stocktaking')}>
                        <StocktakingIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="subtitle2">Stocktaking</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/inventory-management/stock-alerts')}>
                        <LowStockIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="subtitle2">Stock Alerts</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/inventory-management/reports/stock-management/item-balance')}>
                        <ReportsIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="subtitle2">Item Balance</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/inventory-management/reports/stock-alerts')}>
                        <InventoryIcon sx={{ fontSize: 28.8, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="subtitle2">Stock Reports</Typography>
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
                    Inventory Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <StockInIcon sx={{ fontSize: 28.8, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="h6" color="#4CAF50" fontWeight="bold">
                          {numberFormat(data.summary.total_items || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Items</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <LowStockIcon sx={{ fontSize: 28.8, color: '#FF9800', mb: 1 }} />
                        <Typography variant="h6" color="#FF9800" fontWeight="bold">
                          {numberFormat(data.summary.low_stock_items || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Low Stock Items</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <StockOutIcon sx={{ fontSize: 28.8, color: '#2196F3', mb: 1 }} />
                        <Typography variant="h6" color="#2196F3" fontWeight="bold">
                          {numberFormat(data.summary.stock_in_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Stock In Today</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <AddItemIcon sx={{ fontSize: 28.8, color: '#E91E63', mb: 1 }} />
                        <Typography variant="h6" color="#E91E63" fontWeight="bold">
                          {numberFormat(data.summary.stock_out_today || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Stock Out Today</Typography>
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
