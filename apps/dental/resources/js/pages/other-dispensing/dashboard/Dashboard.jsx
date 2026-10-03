import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from "../../../components/ui/index.jsx";
import {
  InventoryRounded,
  AssignmentRounded,
  CheckCircleRounded,
  TrendingUpRounded,
} from "../../../components/ui/icons.jsx";

import { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import ChartWrapper from "../../../components/ChartWrapper";

import { useTheme } from "../../../components/ui/styles.jsx";
import {
  purple,
  teal,
  green,
  orange,
} from "../../../components/ui/colors.js";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const Dashboard = () => {
  const theme = useTheme();
  const addToast = useToast();

  const [dateParams] = useState({
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
      <Box>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Other Dispensing Dashboard" />

      {!loading && data ? (
        <>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
            <InfoCard
              title="Total Dispensed"
              count={numberFormat(data.summary.total_dispensed || 0)}
              icon={<InventoryRounded />}
              color={purple[400]}
            />
            <InfoCard
              title="Pending Requests"
              count={numberFormat(data.summary.pending_requests || 0)}
              icon={<AssignmentRounded />}
              color={orange[400]}
            />
            <InfoCard
              title="Completed Today"
              count={numberFormat(data.summary.completed_today || 0)}
              icon={<CheckCircleRounded />}
              color={green[400]}
            />
            <InfoCard
              title="Items Dispensed"
              count={numberFormat(data.summary.items_dispensed || 0)}
              icon={<TrendingUpRounded />}
              color={teal[400]}
            />
          </Grid>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Dispensing Trend</Typography>
              <ChartWrapper
                options={{
                  chart: {
                    fontFamily: theme.typography.fontFamily,
                    foreColor: theme.palette.text.primary,
                    background: "transparent",
                    toolbar: { show: false },
                  },
                  colors: [teal[400]],
                  stroke: { show: true, width: 3, curve: "smooth" },
                  dataLabels: { enabled: false },
                  grid: { show: false, borderColor: theme.palette.divider },
                  xaxis: {
                    axisBorder: { show: false, color: theme.palette.divider },
                    axisTicks: { show: true, color: theme.palette.divider, height: 6 },
                  },
                  yaxis: {
                    axisBorder: { show: false, color: theme.palette.divider },
                    axisTicks: { show: true, color: theme.palette.divider, width: 6 },
                    labels: { formatter: (val) => numberFormat(val) },
                  },
                  tooltip: { theme: "dark", fillSeriesColor: true },
                }}
                series={[{
                  name: "Dispensed",
                  data: (data.statistics.dispensing_trend || []).map((e) => ({
                    x: e.date,
                    y: e.total,
                  })),
                }]}
                type="line"
                height="300"
              />
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Dispensed Items</Typography>
              <ChartWrapper
                options={{
                  labels: (data.statistics.top_dispensed_items || []).map((e) => e.name || e.item_name),
                  chart: {
                    fontFamily: theme.typography.fontFamily,
                    background: "transparent",
                    toolbar: { show: false },
                  },
                  plotOptions: { pie: { donut: {} } },
                  colors: [teal[400], orange[400], green[400], purple[400]],
                  stroke: { show: false, width: 3 },
                  dataLabels: {
                    style: { fontSize: 10, fontWeight: 400 },
                    dropShadow: { enabled: false },
                  },
                  tooltip: { y: { formatter: (val) => numberFormat(val) } },
                  legend: {
                    position: "bottom",
                    labels: {
                      colors: (data.statistics.top_dispensed_items || []).map(() => theme.palette.text.secondary),
                      useSeriesColors: false,
                    },
                    markers: { width: 14, height: 8, radius: 4 },
                  },
                }}
                series={(data.statistics.top_dispensed_items || []).map((e) => e.count || e.total || 0)}
                type="donut"
                height={300}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
      </Box>
  );
};

export default Dashboard;
