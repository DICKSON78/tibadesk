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
} from "@mui/material";
import {
  EventNoteRounded as AppointmentsIcon,
  EventNoteRounded,
  Person2Rounded as PersonIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  LightbulbRounded as IdeaDevelopmentIcon,
  LocalActivityRounded as OutreachProgrammesIcon,
  LocationSearchingRounded as MarketResearchIcon,
  NorthEastRounded as ViewMoreIcon,
  PhoneInTalkRounded as CommunicationLogsIcon,
  SendRounded as MarketingStrategiesIcon,
  SendRounded,
  TaskRounded as DailyActivitiesIcon,
  LibraryBooksRounded as ReportsIcon,
  SettingsRounded as SettingsIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import Modal from "../../../components/Modal";
import LoadingSkeleton from "./LoadingSkeleton";
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
    "api/marketing/dashboard",
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
    document.title = `Marketing Dashboard - ${window.APP_NAME}`;
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
      title="Marketing Dashboard"
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Marketing Dashboard" },
      ]}
      sx={{
        maxWidth: '100%',
        mx: 0,
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <CardHeader
        title="Marketing Dashboard"
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
      {loading && <LoadingSkeleton />}
      {!loading && data ? (
        <React.Fragment>
          <Box sx={{ width: '100%', maxWidth: '100%' }}>
            {/* First Row - 4 Cards */}
            <Grid
              container
              spacing={{ xs: 1, sm: 2, md: 3 }}
              sx={{ mb: 4, width: '100%' }}
            >
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  title="Patients Registered"
                  count={data.summary.total_patients_registered}
                  icon={<PersonIcon />}
                  color={blue[400]}
                  onClick={() => navigate("/reception/patients")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  title="Marketing Activities"
                  count={numberFormat(data.summary.total_marketing_activities)}
                  icon={<DailyActivitiesIcon />}
                  color={purple[400]}
                  onClick={() => navigate('/marketing/daily-activities')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  title="Ideas Generated"
                  count={numberFormat(data.summary.total_ideas)}
                  icon={<IdeaDevelopmentIcon />}
                  color={lightBlue[400]}
                  onClick={() => navigate('/marketing/idea-development')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoCard
                  title="Outreach Programmes"
                  count={numberFormat(data.summary.total_outreach_programmes)}
                  icon={<OutreachProgrammesIcon />}
                  color={yellow[600]}
                  onClick={() => navigate('/marketing/outreach-programmes')}
                />
              </Grid>
            </Grid>

            {/* Second Row - 3 Cards */}
            <Grid
              container
              spacing={{ xs: 1, sm: 2, md: 3 }}
              sx={{ mb: 4, width: '100%' }}
            >
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  title="Communication Logs"
                  count={numberFormat(data.summary.total_communication_logs)}
                  icon={<CommunicationLogsIcon />}
                  color={teal[400]}
                  onClick={() => navigate('/marketing/communication-logs')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  title="Marketing Strategies"
                  count={numberFormat(data.summary.total_marketing_strategies || 0)}
                  icon={<MarketingStrategiesIcon />}
                  color={orange[400]}
                  onClick={() => navigate('/marketing/strategies')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoCard
                  title="Research Plans"
                  count={numberFormat(data.summary.total_research_plans || 0)}
                  icon={<MarketResearchIcon />}
                  color={green[400]}
                  onClick={() => navigate('/marketing/research-plans')}
                />
              </Grid>
            </Grid>

            {/* Charts Section - Full Width */}
            <Grid
              container
              spacing={{ xs: 1, sm: 2, md: 3 }}
              sx={{ mt: 2, width: '100%', maxWidth: '100%' }}
            >
              <Grid item xs={12} md={6} lg={6} xl={6}>
                <Card sx={{ height: '100%', width: '100%', minHeight: '500px' }}>
                  <CardHeader title="Marketing Activities Overview" />
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
                      colors: [teal[400], pink[400], theme.palette.info.main, orange[400]],
                      stroke: {
                        show: true,
                        width: [3, 3, 3, 3],
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
                        name: "Marketing Activities",
                        data: data.statistics.yearly.map((e) => ({
                          x: e.month,
                          y:
                            e.statistics.find((f) => f.name === "marketing_activities")
                              ?.amount || 0,
                        })),
                      },
                      {
                        name: "Communication Logs",
                        data: data.statistics.yearly.map((e) => ({
                          x: e.month,
                          y:
                            e.statistics.find(
                              (f) => f.name === "communication_logs"
                            )?.amount || 0,
                        })),
                      },
                    ]}
                    type="line"
                    height="500"
                  />
                </Card>
              </Grid>
              
              {/* Information Source Line Chart */}
              <Grid item xs={12} md={6} lg={6} xl={6}>
                <Card sx={{ height: '100%', width: '100%', minHeight: '500px' }}>
                  <CardHeader title="Information Source Analysis" />
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
                      colors: [blue[400], green[400], orange[400], red[400], purple[400], teal[400]],
                      stroke: {
                        show: true,
                        width: [3, 3, 3, 3, 3, 3],
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
                        categories: data.statistics.information_sources.map(item => item.source_name || 'Unknown'),
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
                        y: {
                          formatter: (val) => val + ' patients',
                        },
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
                        name: "Patients by Information Source",
                        data: data.statistics.information_sources.map(item => item.patient_count || 0),
                      }
                    ]}
                    type="line"
                    height="500"
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>
        </React.Fragment>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Dashboard;
