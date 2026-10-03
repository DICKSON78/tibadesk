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
  MedicalServicesRounded as ConsultationIcon,
  Person2Rounded as PatientIcon,
  NoteAltRounded as ClinicalNotesIcon,
  MedicationRounded as PrescriptionIcon,
  ScheduleRounded as ScheduleIcon,
  BiotechRounded as DentalExamIcon,
  FilterAltRounded as FilterIcon,
} from "../../../components/ui/icons.jsx";
import {
  green,
  orange,
  purple,
  teal,
  cyan,
  pink,
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
    "api/consultation-room/dashboard",
    params,
    true,
    {
      summary: {
        total_consultations: 0,
        consultations_today: 0,
        scheduled_consultations: 0,
        pending_consultations: 0,
        completed_consultations: 0,
        total_patients_consulted: 0,
        clinical_notes_created: 0,
        prescriptions_written: 0,
        dental_examinations: 0,
      },
      statistics: {
        consultations_by_status: [],
        consultations_by_doctor: [],
        top_diagnosis: [],
        consultations_trend: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Consultation Room Dashboard - ${window.APP_NAME}`;
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

  return (
    <Box>
      <PageHeader
        title="Consultation Room Dashboard"
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
              title="Total Consultations"
              count={numberFormat(data.summary.total_consultations || 0)}
              icon={<ConsultationIcon />}
              color={purple[400]}
              onClick={() => navigate('/consultation-room/consultation-patients/pending')}
            />
            <InfoCard
              title="Consultations Today"
              count={numberFormat(data.summary.consultations_today || 0)}
              icon={<PatientIcon />}
              color={teal[400]}
              onClick={() => navigate('/consultation-room/consultation-patients/today')}
            />
            <InfoCard
              title="Scheduled"
              count={numberFormat(data.summary.scheduled_consultations || 0)}
              icon={<ScheduleIcon />}
              color={cyan[500]}
              onClick={() => navigate('/consultation-room/consultation-patients/pending')}
            />
            <InfoCard
              title="Pending"
              count={numberFormat(data.summary.pending_consultations || 0)}
              icon={<ClinicalNotesIcon />}
              color={theme.palette.warning.main}
              onClick={() => navigate('/consultation-room/consultation-patients/pending')}
            />
            <InfoCard
              title="Completed"
              count={numberFormat(data.summary.completed_consultations || 0)}
              icon={<ClinicalNotesIcon />}
              color={green[500]}
              onClick={() => navigate('/consultation-room/consultation-patients/consulted')}
            />
            <InfoCard
              title="Patients Consulted"
              count={numberFormat(data.summary.total_patients_consulted || 0)}
              icon={<PatientIcon />}
              color={pink[400]}
              onClick={() => navigate('/consultation-room/consultation-patients/pending')}
            />
            <InfoCard
              title="Clinical Notes"
              count={numberFormat(data.summary.clinical_notes_created || 0)}
              icon={<ClinicalNotesIcon />}
              color={purple[300]}
              onClick={() => navigate('/consultation-room/clinical-notes')}
            />
            <InfoCard
              title="Prescriptions"
              count={numberFormat(data.summary.prescriptions_written || 0)}
              icon={<PrescriptionIcon />}
              color={orange[400]}
              onClick={() => navigate('/consultation-room/prescriptions')}
            />
            <InfoCard
              title="Dental Examinations"
              count={numberFormat(data.summary.dental_examinations || 0)}
              icon={<DentalExamIcon />}
              color={green[400]}
              onClick={() => navigate('/consultation-room/consultation-patients/consulted')}
            />
          </Grid>

          <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Consultations Trend</Typography>
                  <ChartWrapper
                    options={{
                      chart: {
                        fontFamily: theme.typography.fontFamily,
                        foreColor: theme.palette.text.primary,
                        background: "transparent",
                        toolbar: { show: false },
                      },
                      colors: [purple[400], teal[400], cyan[500]],
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
                      legend: {
                        markers: { width: 14, height: 8, radius: 4 },
                      },
                    }}
                    series={[
                      {
                        name: "Consultations",
                        data: (data.statistics.consultations_trend || []).map((e) => ({
                          x: e.date,
                          y: e.total || 0,
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
                  <Typography variant="h6" gutterBottom>Consultations by Status</Typography>
                    <ChartWrapper
                      options={{
                        labels: (data.statistics.consultations_by_status || []).map((e) => e.status),
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
                        colors: [purple[400], teal[400], cyan[500], green[500]],
                        stroke: { show: true, width: 3, colors: (data.statistics.consultations_by_status || []).map(() => theme.palette.background.paper) },
                        dataLabels: {
                          style: { fontWeight: "400", fontSize: "9px" },
                          dropShadow: { enabled: false },
                        },
                        tooltip: { y: { formatter: (val) => numberFormat(val) } },
                        legend: {
                          position: "bottom",
                          labels: {
                            colors: (data.statistics.consultations_by_status || []).map(() => theme.palette.text.secondary),
                            useSeriesColors: false,
                          },
                          markers: { width: 14, height: 8, radius: 4 },
                        },
                      }}
                      series={(data.statistics.consultations_by_status || []).map((e) => e.total || 0)}
                      type="donut"
                      height={(data.statistics.consultations_by_status || []).length ? 288 : 256}
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
