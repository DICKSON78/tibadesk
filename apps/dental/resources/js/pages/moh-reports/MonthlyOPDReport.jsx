import React, { useState, useEffect, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Box, Button, Card, CardContent, Grid, LinearProgress, Paper, Typography,
} from "../../components/ui/index.jsx";
import {
  GroupRounded as PatientsIcon,
  EventNoteRounded as ConsultationsIcon,
  PersonAddRounded as NewIcon,
  RepeatRounded as RevisitIcon,
  LocalHospitalRounded as ReferralIcon,
  PictureAsPdfRounded as PdfIcon,
} from "../../components/ui/icons.jsx";
import {
  blue, green, orange, purple, teal,
} from "../../components/ui/colors.js";
import { Header as PageHeader } from "../../components/Page";
import DatePicker from "../../components/DatePicker";
import Table from "../../components/Table";
import InfoCard from "../dashboard/InfoCard";
import { useToast } from "../../hooks";
import { MoHOPDPDF } from "./MoHReportPDF";

const ageGroups = ["0-4", "5-14", "15-24", "25-44", "45-64", "65+"];

const MonthlyOPDReport = () => {
  const addToast = useToast();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [data, setData] = useState(null);

  const formatDateParam = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date.split("T")[0];
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstOfMonth);
    setEndDate(today);
  }, []);

  const handleFetch = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/moh/monthly-opd?start_date=${formatDateParam(startDate)}&end_date=${formatDateParam(endDate)}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) {
      addToast("Failed to load report", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  useEffect(() => {
    document.title = `Monthly OPD Report - ${window.APP_NAME}`;
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      const blob = await pdf(<MoHOPDPDF data={data} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      addToast("Failed to generate PDF", { variant: "error" });
    } finally {
      setPdfLoading(false);
    }
  }, [data]);

  return (
    <Box>
      <PageHeader
        title="Monthly OPD Report (HMIS 001)"
        trailing={
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={handleDownloadPdf}
            disabled={!data || pdfLoading}
          >
            {pdfLoading ? "Generating..." : "Download PDF"}
          </Button>
        }
      />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <DatePicker label="Start Date" value={startDate} onChange={setStartDate} size="small" fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker label="End Date" value={endDate} onChange={setEndDate} size="small" fullWidth />
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress />}

      {data && (
        <>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
            <InfoCard
              title="Total Consultations"
              count={data.summary?.total_consultations}
              icon={<ConsultationsIcon />}
              color={blue[400]}
            />
            <InfoCard
              title="Total Patients"
              count={data.summary?.total_patients}
              icon={<PatientsIcon />}
              color={teal[400]}
            />
            <InfoCard
              title="New Patients"
              count={data.summary?.new_patients}
              icon={<NewIcon />}
              color={green[400]}
            />
            <InfoCard
              title="Referrals"
              count={data.summary?.referrals}
              icon={<ReferralIcon />}
              color={orange[400]}
            />
            <InfoCard
              title="Revisits"
              count={data.summary?.revisits}
              icon={<RevisitIcon />}
              color={purple[400]}
            />
          </Grid>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Morbidity by Age Group & Gender</Typography>
              <Table
                columns={[
                  { field: "age_group", headerName: "Age Group" },
                  { field: "male", headerName: "Male", tableCellProps: { align: "right" } },
                  { field: "female", headerName: "Female", tableCellProps: { align: "right" } },
                  { field: "total", headerName: "Total", tableCellProps: { align: "right" } },
                ]}
                items={ageGroups.map((group) => ({
                  age_group: group,
                  male: data.morbidity_by_age_gender?.[group]?.male || 0,
                  female: data.morbidity_by_age_gender?.[group]?.female || 0,
                  total: data.morbidity_by_age_gender?.[group]?.total || 0,
                }))}
                itemCount={ageGroups.length}
                hidePaginationFooter
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Diagnoses</Typography>
              <Table
                columns={[
                  { field: "sn", headerName: "S/N", tableCellProps: { sx: { width: 60 } } },
                  { field: "diagnosis", headerName: "Diagnosis" },
                  { field: "count", headerName: "Count", tableCellProps: { align: "right" } },
                ]}
                items={Object.entries(data.top_diagnoses || {}).map(([diagnosis, count], i) => ({
                  sn: i + 1,
                  diagnosis,
                  count,
                }))}
                itemCount={Object.keys(data.top_diagnoses || {}).length}
                hidePaginationFooter
              />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default MonthlyOPDReport;
