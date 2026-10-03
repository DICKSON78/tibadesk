import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, Grid, Typography, Box } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Descriptions from "../../../components/Descriptions";

import { useFetch } from "../../../hooks";
import {
  numberFormat,
  getTodayDate,
} from "../../../helpers";

const InstallmentManagementDashboard = () => {
  const navigate = useNavigate();

  const { data: summaryData, loading: summaryLoading } = useFetch(
    "api/patient-item-bills-summary",
    {
      start_date: getTodayDate(),
      end_date: getTodayDate(),
    },
    true,
    {
      total_pending: 0,
      total_partial: 0,
      total_completed: 0,
      total_debt: 0,
      total_paid_today: 0,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Installment Management - ${window.APP_NAME}`;
  }, []);

  const menuItems = [
    {
      title: "Partial Payments",
      description: "View and manage patient bills with partial payments",
      icon: "💰",
      path: "/payment-center/installment-management/partial-payments",
      color: "#ff9800",
      stats: {
        label: "Active Partial Payments",
        value: summaryData?.total_partial || 0,
      }
    },
    {
      title: "Completed Payments",
      description: "View fully paid and cleared patient bills",
      icon: "✅",
      path: "/payment-center/installment-management/completed-payments",
      color: "#4caf50",
      stats: {
        label: "Completed Today",
        value: summaryData?.total_completed || 0,
      }
    }
  ];

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Installment Management" },
      ]}
    >
      <PageHeader title="Installment Management Dashboard" />
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
            onClick={() => navigate('/payment-center/installment-management/partial-payments')}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ff9800', mb: 1 }}>
                  💰
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Partial Payments
                </Typography>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {summaryData?.total_partial || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active installment plans
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
            onClick={() => navigate('/payment-center/installment-management/completed-payments')}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#4caf50', mb: 1 }}>
                  ✅
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Completed Payments
                </Typography>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {summaryData?.total_completed || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fully paid bills
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.default' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#2196f3', mb: 1 }}>
                  📊
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Total Outstanding Debt
                </Typography>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                  {numberFormat(summaryData?.total_debt || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all patients
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Today's Summary
          </Typography>
          <Descriptions
            columns={4}
            items={[
              {
                label: "Total Paid Today",
                value: numberFormat(summaryData?.total_paid_today || 0),
              },
              {
                label: "Partial Payments",
                value: summaryData?.total_partial || 0,
              },
              {
                label: "Completed Today",
                value: summaryData?.total_completed || 0,
              },
              {
                label: "Pending Bills",
                value: summaryData?.total_pending || 0,
              },
            ]}
            containerProps={{
              variant: "outlined",
              sx: {
                p: 2,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate('/payment-center/installment-management/partial-payments')}
              >
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Manage Partial Payments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and track installment payments
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => navigate('/payment-center/installment-management/completed-payments')}
              >
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  View Completed Payments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  See fully paid patient bills
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Page>
  );
};

export default InstallmentManagementDashboard;
