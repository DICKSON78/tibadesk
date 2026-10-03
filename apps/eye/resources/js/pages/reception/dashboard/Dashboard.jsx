import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  EventNoteRounded as AppointmentsIcon,
  Person2Rounded as PersonIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  GroupRounded as PatientsIcon,
  StarRounded as VipIcon,
  TimerRounded as WaitingTimeIcon,
  ScheduleRounded as PatientsToReturnIcon,
  AddRounded as AddLensIcon,
  NorthEastRounded as ViewMoreIcon,
  LibraryBooksRounded as ReportsIcon,
  SettingsRounded as SettingsIcon,
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

  const { data, loading, error, handleFetch } = useFetch(
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Completed":
        return "success";
    }

    return "neutral";
  };

  return (
    <Page
      title="Reception Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Reception Dashboard" },
      ]}
    >
      <CardHeader
        title="Reception Dashboard"
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
      {loading && <div>Loading...</div>}
      {!loading && data ? (
        <React.Fragment>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
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
              color={blue[400]}
              onClick={() => navigate('/reception/vip-patients')}
            />
            <InfoCard
              title="Spectacle Patients"
              count={numberFormat(data.summary?.spectacle_patients || 0)}
              icon={<AddLensIcon />}
              color={green[400]}
              onClick={() => navigate('/reception/glass-patients')}
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
            <Grid
              item xs={12} sm={6} md={3}
            >
              <Card>
                <InfoCard
                  title="Total Patients"
                  count={numberFormat(data.summary.total_patients || 0)}
                  icon={<PersonIcon />}
                  color={green[400]}
                  sx={{ m: 1 }}
                />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics.patients_by_gender || []).map(
                        (e) => e.gender
                      ),
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
                      colors: [green[400], blue[400], purple[400]],
                      stroke: {
                        show: true,
                        width: 3,
                      colors: (data.statistics.patients_by_gender || []).map(
                        (e) => theme.palette.background.paper
                      ),
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
                          colors: (data.statistics.patients_by_gender || []).map(
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
                    series={(data.statistics.patients_by_gender || []).map(
                      (e) => ({ data: e.patients || 0 })
                    )}
                    type="donut"
                    height={(data.statistics.patients_by_gender || []).length ? 288 : 256}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item xs={12} sm={6} md={3}
            >
              <Card>
                <InfoCard
                  title="VIP Patients"
                  count={numberFormat(data.summary.vip_patients || 0)}
                  icon={<VipIcon />}
                  color={orange[400]}
                  sx={{ m: 1 }}
                />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics.vip_patients_by_status || []).map(
                        (e) => e.status
                      ) || [],
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
                      colors: [orange[400], yellow[600], red[400]],
                      stroke: {
                        show: true,
                        width: 3,
                        colors: (data.statistics.vip_patients_by_status || []).map(
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
                          colors: (data.statistics.vip_patients_by_status || []).map(
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
                    series={(data.statistics.vip_patients_by_status || []).map(
                      (e) => ({ data: e.patients || 0 })
                    ) || [{ data: 1 }]}
                    type="donut"
                    height={(data.statistics.vip_patients_by_status || []).length ? 288 : 256}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item xs={12} sm={6} md={3}
            >
              <Card>
                <InfoCard
                  title="Waiting Patients"
                  count={numberFormat(data.summary.waiting_patients || 0)}
                  icon={<WaitingTimeIcon />}
                  color={red[400]}
                  sx={{ m: 1 }}
                />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics.waiting_patients_by_department || []).map(
                        (e) => e.department
                      ) || [],
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
                      colors: [red[400], pink[400], deepOrange[300]],
                      stroke: {
                        show: true,
                        width: 3,
                        colors: (data.statistics.waiting_patients_by_department || []).map(
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
                          colors: (data.statistics.waiting_patients_by_department || []).map(
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
                    series={(data.statistics.waiting_patients_by_department || []).map(
                      (e) => ({ data: e.patients || 0 })
                    ) || [{ data: 1 }]}
                    type="donut"
                    height={(data.statistics.waiting_patients_by_department || []).length ? 288 : 256}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item xs={12} sm={6} md={3}
            >
              <Card>
                <InfoCard
                  title="Patients to Return"
                  count={numberFormat(data.summary.patients_to_return || 0)}
                  icon={<PatientsToReturnIcon />}
                  color={blue[400]}
                  sx={{ m: 1 }}
                />
                <CardContent>
                  <ChartWrapper
                    options={{
                      labels: (data.statistics.patients_to_return_by_date || []).map(
                        (e) => e.date
                      ) || [],
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
                      colors: [blue[400], cyan[500], lightBlue[400]],
                      stroke: {
                        show: true,
                        width: 3,
                        colors: (data.statistics.patients_to_return_by_date || []).map(
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
                          colors: (data.statistics.patients_to_return_by_date || []).map(
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
                    series={(data.statistics.patients_to_return_by_date || []).map(
                      (e) => ({ data: e.patients || 0 })
                    ) || [{ data: 1 }]}
                    type="donut"
                    height={(data.statistics.patients_to_return_by_date || []).length ? 288 : 256}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </React.Fragment>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Dashboard;
