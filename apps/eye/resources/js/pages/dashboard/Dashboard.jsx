import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import {
  Person2Rounded as PersonIcon,
  AccountBalanceRounded as SalesIcon,
  CenterFocusStrongRounded as GlassIcon,
  DiscountRounded as DiscountIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  MedicalInformationRounded as PharmacyIcon,
  MeetingRoomRounded as ConsultationsIcon,
  MoneyRounded as NetProfitIcon,
  TrendingDownRounded as ExpensesIcon,
  PersonAddRounded as NewPatientsIcon,
  ChecklistRounded as ProcedureIcon,
} from "@mui/icons-material";

import Page from "../../components/Page";
import Modal from "../../components/Modal";
import LoadingSkeleton from "./LoadingSkeleton";
import InfoCard from "./InfoCard";
import Filters from "./Filters";
import StockAlertsNotification from "../../components/StockAlertsNotification";
import ChartWrapper from "../../components/ChartWrapper";

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
import { useFetch, useToast } from "../../hooks";
import {
  formatDateForDb,
  formatError,
  numberFormat,
  round,
  getWeekStartDate,
} from "../../helpers";

const Dashboard = ({ setSmsBalance = () => {} }) => {
  const theme = useTheme();
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();

  const [params, setParams] = useState({
    clinic_id: undefined,
    start_date: getWeekStartDate(),
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/dashboard",
    {
      ...params,
      clinic: undefined,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data && setSmsBalance && typeof setSmsBalance === "function") {
      setSmsBalance(data.summary.sms_balance);
    }
  }, [data, setSmsBalance]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

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

  const navigateToFinancialManagement = () => navigate("/financial-management/dashboard");
  const navigateToReception = () => navigate("/reception/dashboard");
  const navigateToConsultationRoom = () => navigate("/consultation-room/dashboard");
  const navigateToMedicineCenter = () => navigate("/medicine-center/dashboard");
  const navigateToOpticianCenter = () => navigate("/optician-center/dashboard");
  const navigateToProcedureRoom = () => navigate("/procedure-room/dashboard");
  const navigateToPatientRecords = () => navigate("/patient-records/patients");

  return (
    <Page
      title="Dashboard"
      breadcrumbs={[{ title: "Home" }, { title: "Dashboard" }]}
    >
      <CardHeader
        title="Dashboard"
        action={
          <Tooltip title="Show filters">
            <IconButton onClick={openFiltersModal}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        }
        titleTypographyProps={{ variant: "h4", fontWeight: 700 }}
        sx={{ p: 0, mb: 2 }}
      />

      {loading && <LoadingSkeleton />}

      {!loading && data ? (
        <>
          <StockAlertsNotification />

          {/* Info Cards */}
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Total Sales"
                count={numberFormat(data.summary.total_sales)}
                icon={<SalesIcon />}
                color={purple[400]}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Expenses"
                count={numberFormat(data.summary.expenses)}
                icon={<ExpensesIcon />}
                color={theme.palette.warning.main}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Net Profit"
                count={numberFormat(data.summary.total_sales - data.summary.expenses)}
                icon={<NetProfitIcon />}
                color={cyan[500]}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Total Discount"
                count={numberFormat(data.summary.discount)}
                icon={<DiscountIcon />}
                color={pink[400]}
                onClick={navigateToFinancialManagement}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Consultation"
                count={numberFormat(data.summary.consultation)}
                icon={<ConsultationsIcon />}
                color={green[400]}
                onClick={navigateToConsultationRoom}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Pharmacy"
                count={numberFormat(data.summary.pharmacy)}
                icon={<PharmacyIcon />}
                color={teal[400]}
                onClick={navigateToMedicineCenter}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Glass"
                count={numberFormat(data.summary.glass)}
                icon={<GlassIcon />}
                color={purple[300]}
                onClick={navigateToOpticianCenter}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Procedure"
                count={numberFormat(data.summary.procedure)}
                icon={<ProcedureIcon />}
                color={lime[600]}
                onClick={navigateToProcedureRoom}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Registered Patients"
                count={numberFormat(data.summary.new_patients)}
                icon={<NewPatientsIcon />}
                color={theme.palette.warning.main}
                onClick={navigateToReception}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Total Patients"
                count={numberFormat(data.summary.patient_visits)}
                icon={<PersonIcon />}
                color={blue[400]}
                onClick={navigateToPatientRecords}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <InfoCard
                title="Consulted Patients"
                count={numberFormat(data.summary.consulted_patients)}
                icon={<DoneIcon />}
                color={green[500]}
                onClick={navigateToConsultationRoom}
              />
            </Grid>
          </Grid>

          {/* ROW 1: Sales by Category + Sales vs Expenses */}
          <Box sx={{ width: "100%", mb: 2 }}>
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ width: "100%", m: 0 }}>
              <Grid item xs={12} md={6} sx={{ width: { xs: "100%", md: "calc(50% - 16px)" }, pl: { xs: 0, md: 2 }, pr: { xs: 0, md: 2 } }}>
                <Card sx={{ width: "100%", height: "100%" }}>
                  <CardHeader title="Sales by Category" />
                  <Divider />
                  <ChartWrapper
                    options={{
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        foreColor: theme.palette.text.primary,
                        background: "transparent",
                        toolbar: { show: false },
                      },
                      plotOptions: {
                        bar: {
                          borderRadius: 0,
                          borderRadiusApplication: "end",
                          borderRadiusWhenStacked: "last",
                          distributed: true,
                        },
                      },
                      colors: [purple[600], teal[400], orange[300], blue[300], pink[300], green[400]],
                      stroke: { show: false },
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
                      legend: { show: false },
                    }}
                    series={[{
                      name: "Sales",
                      data: [
                        { x: "Consultation", y: data.summary.consultation || 0 },
                        { x: "Pharmacy", y: data.summary.pharmacy || 0 },
                        { x: "Glass", y: data.summary.glass || 0 },
                        { x: "Procedure", y: data.summary.procedure || 0 },
                        { x: "Others", y: data.summary.others || 0 },
                      ],
                    }]}
                    type="bar"
                    height="300"
                  />
                </Card>
              </Grid>

              <Grid item xs={12} md={6} sx={{ width: { xs: "100%", md: "calc(50% - 16px)" }, pl: { xs: 0, md: 2 }, pr: { xs: 0, md: 2 } }}>
                <Card sx={{ width: "100%", height: "100%" }}>
                  <CardHeader title="Sales vs Expenses" />
                  <Divider />
                  <ChartWrapper
                    options={{
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        foreColor: theme.palette.text.primary,
                        background: "transparent",
                        toolbar: { show: false },
                      },
                      plotOptions: {
                        bar: {
                          borderRadius: 8,
                          borderRadiusApplication: "around",
                          borderRadiusWhenStacked: "all",
                        },
                      },
                      colors: [purple[400], theme.palette.warning.main],
                      stroke: { show: false },
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
                    series={[
                      {
                        name: "Sales",
                        data: (data.statistics.yearly || []).map((e) => ({
                          x: e.month,
                          y: e.statistics.find((f) => f.name === "total_sales")?.amount || 0,
                        })),
                      },
                      {
                        name: "Expenses",
                        data: (data.statistics.yearly || []).map((e) => ({
                          x: e.month,
                          y: e.statistics.find((f) => f.name === "expenses")?.amount || 0,
                        })),
                      },
                    ]}
                    type="bar"
                    height="300"
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* ROW 2: Payments by Channel + Expenses by Category */}
          <Box sx={{ width: "100%", mb: 2 }}>
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ width: "100%", m: 0 }}>
              <Grid item xs={12} md={6} sx={{ width: { xs: "100%", md: "calc(50% - 16px)" }, pl: { xs: 0, md: 2 }, pr: { xs: 0, md: 2 } }}>
                <Card sx={{ width: "100%", height: "100%" }}>
                  <CardHeader title="Payments by Channel" />
                  <Divider />
                  <CardContent>
                    <ChartWrapper
                      options={{
                        labels: (data.statistics.payments_by_channel || []).map((e) => e.name),
                        chart: {
                          fontFamily: theme.typography.fontFamily,
                          background: "transparent",
                          toolbar: { show: false },
                        },
                        plotOptions: { pie: { dataLabels: { offset: -16 } } },
                        colors: [blue[400], red[400], cyan[500], green[500], indigo[400], teal[400], purple[400], lime[600], pink[400], yellow[500]],
                        stroke: { show: false, width: 3 },
                        dataLabels: {
                          style: { fontSize: 10, fontWeight: 400 },
                          dropShadow: { enabled: false },
                        },
                        tooltip: { y: { formatter: (val) => numberFormat(val) } },
                        legend: {
                          position: "bottom",
                          labels: {
                            colors: (data.statistics.payments_by_channel || []).map(() => theme.palette.text.secondary),
                            useSeriesColors: false,
                          },
                          markers: { width: 14, height: 8, radius: 4 },
                        },
                      }}
                      series={(data.statistics.payments_by_channel || []).map((e) => e.amount)}
                      type="pie"
                      height={300}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} sx={{ width: { xs: "100%", md: "calc(50% - 16px)" }, pl: { xs: 0, md: 2 }, pr: { xs: 0, md: 2 } }}>
                <Card sx={{ width: "100%", height: "100%" }}>
                  <CardHeader title="Expenses by Category" />
                  <Divider />
                  <CardContent>
                    <ChartWrapper
                      options={{
                        labels: (data.statistics.expenses_by_category || []).map((e) => e.name),
                        chart: {
                          fontFamily: theme.typography.fontFamily,
                          background: "transparent",
                          toolbar: { show: false },
                        },
                        plotOptions: { pie: { dataLabels: { offset: -16 } } },
                        colors: [teal[400], red[400], lightBlue[400], deepOrange[300], lime[600], pink[400], cyan[500], purple[400], green[500], yellow[500]],
                        stroke: { show: false, width: 3 },
                        dataLabels: {
                          style: { fontSize: 10, fontWeight: 400 },
                          dropShadow: { enabled: false },
                        },
                        tooltip: { y: { formatter: (val) => numberFormat(val) } },
                        legend: {
                          position: "bottom",
                          labels: {
                            colors: (data.statistics.expenses_by_category || []).map(() => theme.palette.text.secondary),
                            useSeriesColors: false,
                          },
                          markers: { width: 14, height: 8, radius: 4 },
                        },
                      }}
                      series={(data.statistics.expenses_by_category || []).map((e) => e.amount)}
                      type="pie"
                      height={300}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* ROW 3: Patient Registration - full width */}
          <Box sx={{ width: "100%", mb: 2 }}>
            <Grid container sx={{ width: "100%", m: 0 }}>
              <Grid item xs={12} sx={{ width: "100%", p: 0 }}>
                <Card sx={{ width: "100%" }}>
                  <CardHeader title="Patient Registration" />
                  <Divider />
                  <ChartWrapper
                    options={{
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        foreColor: theme.palette.text.primary,
                        background: "transparent",
                        toolbar: { show: false },
                      },
                      colors: [teal[400], pink[400], theme.palette.info.main],
                      stroke: { show: true, width: [3, 3, 3], curve: "smooth" },
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
                    series={[
                      {
                        name: "Male",
                        data: (data.statistics.yearly || []).map((e) => ({
                          x: e.month,
                          y: e.statistics.find((f) => f.name === "new_patients_male")?.amount || 0,
                        })),
                      },
                      {
                        name: "Female",
                        data: (data.statistics.yearly || []).map((e) => ({
                          x: e.month,
                          y: e.statistics.find((f) => f.name === "new_patients_female")?.amount || 0,
                        })),
                      },
                      {
                        name: "Total",
                        data: (data.statistics.yearly || []).map((e) => ({
                          x: e.month,
                          y: (e.statistics.find((f) => f.name === "new_patients_male")?.amount || 0) +
                              (e.statistics.find((f) => f.name === "new_patients_female")?.amount || 0),
                        })),
                      },
                    ]}
                    type="line"
                    height="300"
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* ROW 4: Consultations by Item - full width */}
          <Box sx={{ width: "100%", mb: 2 }}>
            <Grid container sx={{ width: "100%", m: 0 }}>
              <Grid item xs={12} sx={{ width: "100%", p: 0 }}>
                <Card sx={{ width: "100%" }}>
                  <CardHeader title="Consultations by Item" />
                  <Divider />
                  <CardContent>
                    {(data.statistics.consultations_by_item || []).map((e, i, a) => (
                      <ChartWrapper
                        key={e.id}
                        options={{
                          chart: {
                            fontFamily: theme.typography.fontFamily,
                            foreColor: theme.palette.text.primary,
                            background: "transparent",
                            stacked: true,
                            sparkline: { enabled: true },
                            toolbar: { show: false },
                          },
                          plotOptions: {
                            bar: {
                              horizontal: true,
                              barHeight: 12,
                              borderRadius: 6,
                              borderRadiusApplication: "around",
                              borderRadiusWhenStacked: "all",
                              colors: {
                                backgroundBarColors: [theme.palette.background.default],
                                backgroundBarRadius: 6,
                              },
                            },
                          },
                          title: {
                            floating: true,
                            offsetX: -8,
                            offsetY: 6,
                            text: e.name,
                            style: { fontSize: 12, fontWeight: 400 },
                          },
                          subtitle: {
                            floating: true,
                            align: "right",
                            offsetX: 8,
                            offsetY: 6,
                            text: numberFormat(e.consultations),
                            style: { fontSize: 12 },
                          },
                          colors: [[cyan[500], pink[400], blue[400], green[500], yellow[600]][i % 3]],
                          stroke: { show: false },
                          dataLabels: { enabled: false },
                          grid: { show: false },
                          xaxis: { axisBorder: { show: false }, axisTicks: { show: true, height: 6 } },
                          yaxis: { max: 100, axisBorder: { show: false }, axisTicks: { show: true, width: 6 } },
                          tooltip: { theme: "dark", fillSeriesColor: true },
                        }}
                        series={[{
                          name: "Percentage",
                          data: [round((e.consultations / (a.reduce((acc, f) => acc + f.consultations, 0) || 1)) * 100, 2)],
                        }]}
                        type="bar"
                        height="64"
                      />
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* ROW 5: Top Diagnosis - full width */}
          <Box sx={{ width: "100%", mb: 2 }}>
            <Grid container sx={{ width: "100%", m: 0 }}>
              <Grid item xs={12} sx={{ width: "100%", p: 0 }}>
                <Card sx={{ width: "100%" }}>
                  <CardHeader title="Top Diagnosis" />
                  <Divider />
                  <CardContent>
                    {(data.statistics.top_diagnosis || []).map((e, i, a) => (
                      <ChartWrapper
                        key={e.id}
                        options={{
                          chart: {
                            fontFamily: theme.typography.fontFamily,
                            foreColor: theme.palette.text.primary,
                            background: "transparent",
                            stacked: true,
                            sparkline: { enabled: true },
                            toolbar: { show: false },
                          },
                          plotOptions: {
                            bar: {
                              horizontal: true,
                              barHeight: 12,
                              borderRadius: 6,
                              borderRadiusApplication: "around",
                              borderRadiusWhenStacked: "all",
                              colors: {
                                backgroundBarColors: [theme.palette.background.default],
                                backgroundBarRadius: 6,
                              },
                            },
                          },
                          title: {
                            floating: true,
                            offsetX: -8,
                            offsetY: 6,
                            text: `${e.code} ${e.name}`.trim(),
                            style: { fontSize: 12, fontWeight: 400 },
                          },
                          subtitle: {
                            floating: true,
                            align: "right",
                            offsetX: 8,
                            offsetY: 6,
                            text: numberFormat(e.consultations),
                            style: { fontSize: 12 },
                          },
                          colors: [[lightBlue[400], purple[400], cyan[500], pink[400], indigo[400], lime[600], blue[400], red[400], green[500], yellow[600]][i % 9]],
                          stroke: { show: false },
                          dataLabels: { enabled: false },
                          grid: { show: false },
                          xaxis: { axisBorder: { show: false }, axisTicks: { show: true, height: 6 } },
                          yaxis: { max: 100, axisBorder: { show: false }, axisTicks: { show: true, width: 6 } },
                          tooltip: { theme: "dark", fillSeriesColor: true },
                        }}
                        series={[{
                          name: "Percentage",
                          data: [round((e.consultations / (a.reduce((acc, f) => acc + f.consultations, 0) || 1)) * 100, 2)],
                        }]}
                        type="bar"
                        height="64"
                      />
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Modal ref={modalRef} />
        </>
      ) : (
        <LoadingSkeleton />
      )}
    </Page>
  );
};

export default Dashboard;