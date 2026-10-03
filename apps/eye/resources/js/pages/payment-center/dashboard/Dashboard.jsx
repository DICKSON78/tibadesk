import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  PaymentRounded as PaymentIcon,
  AttachMoneyRounded as CashIcon,
  CreditCardRounded as CreditIcon,
  ReceiptRounded as BillsIcon,
  TrendingUpRounded as RevenueIcon,
  LibraryBooksRounded as ReportsIcon,
  FilterAltRounded as FilterIcon,
  PeopleRounded as PeopleIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import InfoCard from "../../dashboard/InfoCard";
import Filters from "../../dashboard/Filters";
import ChartWrapper from "../../../components/ChartWrapper";

import { useTheme } from "@mui/material/styles";
import {
  blue,
  cyan,
  deepOrange,
  green,
  indigo,
  lightBlue,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from "@mui/material/colors";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, formatDateForDb, getTodayDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();

  const modalRef = useRef();

  const [params, setParams] = useState({
    clinic_id: undefined,
    start_date: getTodayDate(),
    end_date: undefined,
  });

  useEffect(() => {
    document.title = `Payment Center Dashboard - ${window.APP_NAME}`;
  }, []);

  const { data, loading, error } = useFetch(
    "api/payment-center/dashboard",
    {
      ...params,
      clinic: undefined,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      summary: {
        total_revenue: 0,
        cash_payments: 0,
        credit_payments: 0,
        pending_bills: 0,
        pending_payment_cache: 0,
        cleared_bills: 0,
        total_expenses: 0,
        net_profit: 0,
        today_collections: 0,
      },
      statistics: {
        payment_trends: [],
        revenue_by_payment_mode: [],
        top_paying_patients: [],
        pending_bills_summary: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const openFiltersModal = () => {
    const component = (
      <Filters
        modal={modalRef.current}
        params={params}
        setParams={setParams}
      />
    );

    modalRef.current.open("Filter", component, "sm");
  };

  if (loading) {
    return (
      <Page title="Payment Center Dashboard">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Payment Center Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Dashboard" },
      ]}
    >
      <CardHeader
        title="Payment Center Dashboard"
        action={
          <Tooltip title="Show filters">
            <IconButton onClick={openFiltersModal}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        }
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
              count={numberFormat(data.summary.total_revenue || 0)}
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
              onClick={() => navigate('/payment-center/reports/daily-cash-collection')}
            />
            <InfoCard
              title="Cash Payments"
              count={numberFormat(data.summary.cash_payments || 0)}
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
              color={blue[400]}
              onClick={() => navigate('/payment-center/pending-cash-patients')}
            />
            <InfoCard
              title="Credit Payments"
              count={numberFormat(data.summary.credit_payments || 0)}
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
              color={cyan[500]}
              onClick={() => navigate('/payment-center/pending-credit-patients')}
            />
            <InfoCard
              title="Pending Bills"
              count={numberFormat(data.summary.pending_bills || 0)}
              icon={<BillsIcon />}
              color={theme.palette.warning.main}
              onClick={() => navigate('/payment-center/patient-bills/pending')}
            />
            <InfoCard
              title="Pending Patients"
              count={numberFormat(data.summary.pending_payment_cache || 0)}
              icon={<PeopleIcon />}
              color={orange[400]}
              onClick={() => navigate('/payment-center/pending-cash-patients')}
            />
            <InfoCard
              title="Cleared Bills"
              count={numberFormat(data.summary.cleared_bills || 0)}
              icon={<BillsIcon />}
              color={green[500]}
              onClick={() => navigate('/payment-center/patient-bills/cleared')}
            />
            <InfoCard
              title="Total Expenses"
              count={numberFormat(data.summary.total_expenses || 0)}
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
              color={red[400]}
              onClick={() => navigate('/financial-management/reports/expenses')}
            />
            <InfoCard
              title="Net Profit"
              count={numberFormat(data.summary.net_profit || 0)}
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
              color={green[600]}
              onClick={() => navigate('/financial-management/dashboard')}
            />
            <InfoCard
              title="Today's Collections"
              count={numberFormat(data.summary.today_collections || 0)}
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
              color={orange[500]}
              onClick={() => navigate('/payment-center/reports/cash-collection')}
            />
          </Grid>

          {/* Charts Section */}
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mt: 2 }}
          >
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Payment Trends" />
                <Divider />
                <ChartWrapper
                  options={{
                    chart: {
                      fontFamily: theme.typography.fontFamily,
                      foreColor: theme.palette.text.primary,
                      background: "transparent",
                      toolbar: {
                        show: false,
                      },
                    },
                    plotOptions: {
                      bar: {
                        borderRadius: 0,
                        borderRadiusApplication: "end",
                        borderRadiusWhenStacked: "last",
                      },
                    },
                    colors: [purple[400], blue[400], cyan[500]],
                    stroke: {
                      show: true,
                      width: [3, 3, 3],
                      curve: "smooth",
                    },
                    dataLabels: {
                      enabled: false,
                      style: {
                        fontWeight: "400",
                        fontSize: "9px",
                      },
                      dropShadow: {
                        enabled: false,
                      },
                      formatter: (val, opts) => numberFormat(val),
                    },
                    grid: {
                      show: false,
                      borderColor: theme.palette.divider,
                    },
                    xaxis: {
                      axisBorder: {
                        show: false,
                        color: theme.palette.divider,
                      },
                      axisTicks: {
                        show: true,
                        color: theme.palette.divider,
                        height: 6,
                      },
                    },
                    yaxis: {
                      axisBorder: {
                        show: false,
                        color: theme.palette.divider,
                      },
                      axisTicks: {
                        show: true,
                        color: theme.palette.divider,
                        width: 6,
                      },
                      labels: {
                        formatter: (val, index) => numberFormat(val),
                      },
                    },
                    tooltip: {
                      theme: "dark",
                      fillSeriesColor: true,
                    },
                    legend: {
                      markers: {
                        width: 14,
                        height: 8,
                        radius: 4,
                      },
                    },
                  }}
                  series={[
                    {
                      name: "Revenue",
                      data: (data.statistics.payment_trends || []).map((e) => ({
                        x: e.date,
                        y: e.revenue
                      })) || [],
                    },
                  ]}
                  type="line"
                  height="272"
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Revenue by Payment Mode" />
                <Divider />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics.revenue_by_payment_mode || []).map((e) => e.payment_mode) || [],
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        background: "transparent",
                        toolbar: {
                          show: false,
                        },
                      },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: "50%",
                          },
                        },
                      },
                      colors: [purple[400], blue[400], cyan[500], green[500]],
                      stroke: {
                        show: true,
                        width: 3,
                        colors: (data.statistics.revenue_by_payment_mode || []).map(
                          (e) => theme.palette.background.paper
                        ) || [],
                      },
                      dataLabels: {
                        style: {
                          fontWeight: "400",
                          fontSize: "9px",
                        },
                        dropShadow: {
                          enabled: false,
                        },
                      },
                      tooltip: {
                        y: {
                          formatter: (
                            val,
                            { series, seriesIndex, dataPointIndex, w }
                          ) => numberFormat(val),
                        },
                      },
                      legend: {
                        position: "bottom",
                        labels: {
                          colors: (data.statistics.revenue_by_payment_mode || []).map(
                            (e) => theme.palette.text.secondary
                          ) || [],
                          useSeriesColors: false,
                        },
                        markers: {
                          width: 14,
                          height: 8,
                          radius: 4,
                        },
                      },
                    }}
                    series={(data.statistics.revenue_by_payment_mode || []).map(
                      (e) => e.total_amount
                    ) || []}
                    type="donut"
                    height={(data.statistics.revenue_by_payment_mode || []).length ? 288 : 256}
                  />
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
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Dashboard;
