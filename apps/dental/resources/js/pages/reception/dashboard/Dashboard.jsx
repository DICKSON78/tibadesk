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
  Person2Rounded as PersonIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  GroupRounded as PatientsIcon,
  StarRounded as VipIcon,
  TimerRounded as WaitingTimeIcon,
  ScheduleRounded as PatientsToReturnIcon,
  NorthEastRounded as ViewMoreIcon,
  LibraryBooksRounded as ReportsIcon,
  SettingsRounded as SettingsIcon,
} from "../../../components/ui/icons.jsx";

import Modal from "../../../components/Modal";
import { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import Filters from "../../dashboard/Filters";
import ChartWrapper from "../../../components/ChartWrapper";

import { useTheme } from "../../../components/ui/styles.jsx";
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
} from "../../../components/ui/colors.js";
import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, numberFormat, getWeekStartDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();

  const theme = useTheme();
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    clinic_id: undefined,
    start_date: getWeekStartDate(),
    end_date: undefined,
  });

  const { data, loading, error } = useFetch(
    "api/reception/dashboard",
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
    document.title = `Reception Dashboard - ${window.APP_NAME}`;
  }, []);

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

  return (
    <Box>
      <PageHeader
        title="Reception Dashboard"
        trailing={
          <Tooltip title="Show filters">
            <IconButton onClick={openFiltersModal}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        }
      />
      {loading && <LinearProgress />}
      {data && (
        <>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
            <InfoCard
              title="Total Patients"
              count={numberFormat(data.summary?.total_patients || 0)}
              icon={<PersonIcon />}
              color={purple[400]}
              onClick={() => navigate('/reception/patients')}
            />
            <InfoCard
              title="VIP Patients"
              count={numberFormat(data.summary?.vip_patients || 0)}
              icon={<VipIcon />}
              color={teal[400]}
              onClick={() => navigate('/reception/vip-patients')}
            />
            <InfoCard
              title="Waiting Time"
              count={numberFormat(data.summary?.waiting_patients || 0)}
              icon={<WaitingTimeIcon />}
              color={teal[400]}
              onClick={() => navigate('/reception/patient-waiting-time')}
            />
            <InfoCard
              title="Patients to Return"
              count={numberFormat(data.summary?.patients_to_return || 0)}
              icon={<PatientsToReturnIcon />}
              color={cyan[500]}
              onClick={() => navigate('/reception/to-return/patients')}
            />
            <InfoCard
              title="Reports"
              count={numberFormat(data.summary?.total_reports || 0)}
              icon={<ReportsIcon />}
              color={pink[400]}
              onClick={() => navigate('/reception/reports/patient-registration')}
            />
            <InfoCard
              title="Messages"
              count={numberFormat(data.summary?.total_messages || 0)}
              icon={<SettingsIcon />}
              color={lime[600]}
              onClick={() => navigate('/reception/sent-messages')}
            />
            <InfoCard
              title="Completed"
              count={numberFormat(data.summary?.completed_patients || 0)}
              icon={<DoneIcon />}
              color={green[500]}
              onClick={() => navigate('/reception/patients')}
            />
          </Grid>

          <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Patients by Gender</Typography>
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
                        colors: [green[400], blue[400], purple[400]],
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
                        },
                        tooltip: { theme: "dark", fillSeriesColor: true },
                        legend: { show: false },
                      }}
                      series={[{
                        name: "Patients",
                        data: (data.statistics.patients_by_gender || []).map((e) => ({
                          x: e.gender,
                          y: e.patients || 0,
                        })),
                      }]}
                      type="bar"
                      height="288"
                    />
                  </CardContent>
              </Card>

          <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>VIP Patients by Status</Typography>
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
                        colors: [yellow[600], green[400], blue[400], purple[400]],
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
                        },
                        tooltip: { theme: "dark", fillSeriesColor: true },
                        legend: { show: false },
                      }}
                      series={[{
                        name: "Patients",
                        data: (data.statistics.vip_patients_by_status || []).map((e) => ({
                          x: e.status,
                          y: e.patients || 0,
                        })),
                      }]}
                      type="bar"
                      height="288"
                    />
                  </CardContent>
              </Card>

          <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Waiting Patients by Department</Typography>
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
                        colors: [red[400], pink[400], deepOrange[300]],
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
                        },
                        tooltip: { theme: "dark", fillSeriesColor: true },
                        legend: { show: false },
                      }}
                      series={[{
                        name: "Patients",
                        data: (data.statistics.waiting_patients_by_department || []).map((e) => ({
                          x: e.department,
                          y: e.patients || 0,
                        })),
                      }]}
                      type="bar"
                      height="288"
                    />
                  </CardContent>
              </Card>

          <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Patients to Return</Typography>
                    <ChartWrapper
                      options={{
                        chart: {
                          fontFamily: theme.typography.fontFamily,
                          foreColor: theme.palette.text.primary,
                          background: "transparent",
                          toolbar: { show: false },
                        },
                        colors: [blue[400]],
                        stroke: {
                          show: true,
                          width: 3,
                          curve: "smooth",
                        },
                        dataLabels: { enabled: false },
                        grid: { show: false, borderColor: theme.palette.divider },
                        xaxis: {
                          axisBorder: { show: false, color: theme.palette.divider },
                          axisTicks: { show: true, color: theme.palette.divider, height: 6 },
                        },
                        yaxis: {
                          axisBorder: { show: false, color: theme.palette.divider },
                          axisTicks: { show: true, color: theme.palette.divider, width: 6 },
                        },
                        tooltip: { theme: "dark", fillSeriesColor: true },
                        legend: { show: false },
                      }}
                      series={[{
                        name: "Patients",
                        data: (data.statistics.patients_to_return_by_date || []).map((e) => ({
                          x: e.date,
                          y: e.patients || 0,
                        })),
                      }]}
                      type="line"
                      height="288"
                    />
                  </CardContent>
              </Card>
        </>)}
      <Modal ref={modalRef} />
    </Box>
  );
};

export default Dashboard;
