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
  EventNoteRounded as AppointmentsIcon,
  Person2Rounded as PersonIcon,
  DoneAllRounded as DoneIcon,
  FilterAltRounded as FilterIcon,
  LightbulbRounded as IdeaDevelopmentIcon,
  LocalActivityRounded as OutreachProgrammesIcon,
  LocationSearchingRounded as MarketResearchIcon,
  NorthEastRounded as ViewMoreIcon,
  PhoneInTalkRounded as CommunicationLogsIcon,
  SendRounded as MarketingStrategiesIcon,
  TaskRounded as DailyActivitiesIcon,
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

  return (
    <Box>
      <PageHeader
        title="Marketing Dashboard"
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
          {/* First Row - 4 Cards */}
            <Grid
              container
              spacing={{ xs: 1, sm: 2, md: 3 }}
              sx={{ mb: 4, width: '100%' }}
            >
              <InfoCard
                title="Patients Registered"
                count={data.summary.total_patients_registered}
                icon={<PersonIcon />}
                color={blue[400]}
                onClick={() => navigate("/reception/patients")}
              />
              <InfoCard
                title="Marketing Activities"
                count={numberFormat(data.summary.total_marketing_activities)}
                icon={<DailyActivitiesIcon />}
                color={purple[400]}
                onClick={() => navigate('/marketing/daily-activities')}
              />
              <InfoCard
                title="Ideas Generated"
                count={numberFormat(data.summary.total_ideas)}
                icon={<IdeaDevelopmentIcon />}
                color={lightBlue[400]}
                onClick={() => navigate('/marketing/idea-development')}
              />
              <InfoCard
                title="Outreach Programmes"
                count={numberFormat(data.summary.total_outreach_programmes)}
                icon={<OutreachProgrammesIcon />}
                color={yellow[600]}
                onClick={() => navigate('/marketing/outreach-programmes')}
              />
            </Grid>

            {/* Second Row - 3 Cards */}
            <Grid
              container
              spacing={{ xs: 1, sm: 2, md: 3 }}
              sx={{ mb: 4, width: '100%' }}
            >
              <InfoCard
                title="Communication Logs"
                count={numberFormat(data.summary.total_communication_logs)}
                icon={<CommunicationLogsIcon />}
                color={teal[400]}
                onClick={() => navigate('/marketing/communication-logs')}
              />
              <InfoCard
                title="Marketing Strategies"
                count={numberFormat(data.summary.total_marketing_strategies || 0)}
                icon={<MarketingStrategiesIcon />}
                color={orange[400]}
                onClick={() => navigate('/marketing/strategies')}
              />
              <InfoCard
                title="Research Plans"
                count={numberFormat(data.summary.total_research_plans || 0)}
                icon={<MarketResearchIcon />}
                color={green[400]}
                onClick={() => navigate('/marketing/research-plans')}
              />
            </Grid>

          <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Marketing Activities Overview</Typography>
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
                  </CardContent>
                </Card>

          <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Information Source Analysis</Typography>
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
                  </CardContent>
                </Card>
        </>)}
      <Modal ref={modalRef} />
    </Box>
  );
};

export default Dashboard;
