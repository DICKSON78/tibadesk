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
  AccountBalanceRounded as FinancialIcon,
  AttachMoneyRounded as RevenueIcon,
  MoneyOffRounded as ExpenseIcon,
  TrendingUpRounded as ProfitIcon,
  ReceiptRounded as BillsIcon,
  PaymentRounded as PaymentsIcon,
  LibraryBooksRounded as ReportsIcon,
  AssessmentRounded as AnalyticsIcon,
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
    "api/financial-management/dashboard",
    dateParams,
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Financial Management Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Dashboard API Error:", error);
      if (error?.response?.status === 401) {
        addToast({ message: "Authentication failed. Please login again.", severity: "error" });
        // Clear token and redirect to login
        localStorage.removeItem("token");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        addToast({ message: formatError(error), severity: "error" });
      }
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Financial Management Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Financial Management Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Financial Management" },
        { title: "Financial Management Dashboard" },
      ]}
    >
      <CardHeader
        title="Financial Management Dashboard"
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
              title="Total Revenue"
              count={numberFormat(data.summary?.total_revenue || 0)}
                icon={
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.08rem'
                    }}
                  >
                    Tz
                  </Typography>
                }
              color={purple[400]}
              onClick={() => navigate('/financial-management/reports/cash-collection')}
            />
            <InfoCard
              title="Total Expenses"
              count={numberFormat(data.summary?.total_expenses || 0)}
              icon={<ExpenseIcon />}
              color={pink[400]}
              onClick={() => navigate('/financial-management/expenses')}
            />
            <InfoCard
              title="Net Profit"
              count={numberFormat(data.summary?.net_profit || 0)}
              icon={<ProfitIcon />}
              color={cyan[500]}
              onClick={() => navigate('/financial-management/reports/expenses')}
            />
            <InfoCard
              title="Pending Bills"
              count={numberFormat(data.summary?.pending_bills || 0)}
              icon={<BillsIcon />}
              color={green[400]}
              onClick={() => navigate('/payment-center/dashboard')}
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
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/financial-management/expenses')}>
                        <ExpenseIcon sx={{ fontSize: 32, color: '#F44336', mb: 1 }} />
                        <Typography variant="subtitle2">Add Expense</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/financial-management/expense-payments')}>
                        <PaymentsIcon sx={{ fontSize: 32, color: '#2196F3', mb: 1 }} />
                        <Typography variant="subtitle2">Expense Payments</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/financial-management/reports/cash-collection')}>
                        <ReportsIcon sx={{ fontSize: 32, color: '#9C27B0', mb: 1 }} />
                        <Typography variant="subtitle2">Financial Reports</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/payment-center/dashboard')}>
                        <PaymentsIcon sx={{ fontSize: 32, color: '#4CAF50', mb: 1 }} />
                        <Typography variant="subtitle2">Payment Center</Typography>
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
                    Financial Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontSize: 28.8, 
                            color: '#4CAF50', 
                            mb: 1,
                            fontWeight: 'bold'
                          }}
                        >
                          Tz
                        </Typography>
                        <Typography variant="h6" color="#4CAF50" fontWeight="bold">
                          {numberFormat(data.summary.total_revenue || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Revenue (TZS)</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <ExpenseIcon sx={{ fontSize: 32, color: '#F44336', mb: 1 }} />
                        <Typography variant="h6" color="#F44336" fontWeight="bold">
                          {numberFormat(data.summary.total_expenses || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Total Expenses (TZS)</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <ProfitIcon sx={{ fontSize: 32, color: '#2196F3', mb: 1 }} />
                        <Typography variant="h6" color="#2196F3" fontWeight="bold">
                          {numberFormat(data.summary.net_profit || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Net Profit (TZS)</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <BillsIcon sx={{ fontSize: 32, color: '#FF9800', mb: 1 }} />
                        <Typography variant="h6" color="#FF9800" fontWeight="bold">
                          {numberFormat(data.summary.pending_bills || 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Pending Bills</Typography>
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
