import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from "../../../components/ui/index.jsx";
import {
  InventoryRounded as InventoryIcon,
  WarningRounded as LowStockIcon,
  TrendingUpRounded as StockInIcon,
  TrendingDownRounded as StockOutIcon,
  FilterAltRounded as FilterIcon,
} from "../../../components/ui/icons.jsx";
import {
  green,
  orange,
  purple,
  teal,
} from "../../../components/ui/colors.js";

import Modal from "../../../components/Modal";
import { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import Filters from "../../dashboard/Filters";
import ChartWrapper from "../../../components/ChartWrapper";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";
import { useTheme } from "../../../components/ui/styles.jsx";

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    start_date: getWeekStartDate().toISOString().split('T')[0],
    end_date: getWeekEndDate().toISOString().split('T')[0],
  });

  const { data, loading, error } = useFetch(
    "api/inventory-management/dashboard",
    params,
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

  const stockInTotal = (data.statistics.stock_movement_trend || []).reduce((acc, e) => acc + (e.stock_in || 0), 0);
  const stockOutTotal = (data.statistics.stock_movement_trend || []).reduce((acc, e) => acc + (e.stock_out || 0), 0);

  return (
    <Box>
      <PageHeader
        title="Inventory Management Dashboard"
        trailing={
          <Tooltip title="Show filters">
            <IconButton onClick={openFiltersModal}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        }
      />
      {loading && <LinearProgress />}
      {data ? (
        <>
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
              color={theme.palette.warning.main}
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

          <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Stock Movement Trend</Typography>
                  <ChartWrapper
                    options={{
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        foreColor: theme.palette.text.primary,
                        background: "transparent",
                        toolbar: { show: false },
                      },
                      colors: [teal[400], orange[400]],
                      stroke: { show: true, width: [3, 3], curve: "smooth" },
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
                      legend: {
                        markers: { width: 14, height: 8, radius: 4 },
                      },
                    }}
                    series={[
                      {
                        name: "Stock In",
                        data: (data.statistics.stock_movement_trend || []).map((e) => ({
                          x: e.date,
                          y: e.stock_in || 0,
                        })),
                      },
                      {
                        name: "Stock Out",
                        data: (data.statistics.stock_movement_trend || []).map((e) => ({
                          x: e.date,
                          y: e.stock_out || 0,
                        })),
                      },
                    ]}
                    type="line"
                    height="272"
                  />
                </CardContent>
              </Card>

          <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Stock Movement Overview</Typography>
                    <ChartWrapper
                      options={{
                        labels: ["Stock In", "Stock Out"],
                        chart: {
                          fontFamily: theme.typography.fontFamily,
                          background: "transparent",
                          toolbar: { show: false },
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: "50%",
                            },
                          },
                        },
                        colors: [teal[400], orange[400]],
                        stroke: { show: true, width: 3, colors: [theme.palette.background.paper, theme.palette.background.paper] },
                        dataLabels: {
                          style: { fontWeight: "400", fontSize: "9px" },
                          dropShadow: { enabled: false },
                        },
                        tooltip: { y: { formatter: (val) => numberFormat(val) } },
                        legend: {
                          position: "bottom",
                          labels: {
                            colors: [theme.palette.text.secondary, theme.palette.text.secondary],
                            useSeriesColors: false,
                          },
                          markers: { width: 14, height: 8, radius: 4 },
                        },
                      }}
                      series={[stockInTotal, stockOutTotal]}
                      type="donut"
                      height={288}
                    />
                </CardContent>
              </Card>
        </>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
      <Modal ref={modalRef} />
    </Box>
  );
};

export default Dashboard;
