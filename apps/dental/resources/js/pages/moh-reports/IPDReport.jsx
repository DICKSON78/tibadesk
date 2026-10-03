import React, { useState, useEffect, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  Box, Button, Card, CardContent, Grid, LinearProgress, Paper, Typography, Alert,
} from "../../components/ui/index.jsx";
import {
  GroupRounded as PatientsIcon,
  LocalHospitalRounded as HospitalIcon,
  ExitToAppRounded as DischargeIcon,
  WarningRounded as DeathIcon,
  TransferWithinAStationRounded as ReferralIcon,
  PictureAsPdfRounded as PdfIcon,
} from "../../components/ui/icons.jsx";
import {
  blue, green, orange, purple, red, teal,
} from "../../components/ui/colors.js";
import { Header as PageHeader } from "../../components/Page";
import DatePicker from "../../components/DatePicker";
import Table from "../../components/Table";
import InfoCard from "../dashboard/InfoCard";
import Header from "../../components/pdf/Header";
import Footer from "../../components/pdf/Footer";
import PdfTable from "../../components/pdf/Table";
import { useToast } from "../../hooks";

const ageGroups = ["0-4", "5-14", "15-24", "25-44", "45-64", "65+"];

const fontRegular = "/fonts/Custom-Regular.ttf";
const fontItalic = "/fonts/Custom-Italic.ttf";
const fontBold = "/fonts/Custom-Bold.ttf";

Font.register({
  family: "Custom",
  fonts: [
    { src: fontRegular },
    { src: fontItalic, fontStyle: "italic" },
    { src: fontBold, fontWeight: 700 },
  ],
});

const pdfStyles = StyleSheet.create({
  page: {
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 35,
  },
  reportInfo: {
    fontSize: 7,
    fontFamily: "Custom",
    color: "#666",
    textAlign: "right",
    marginTop: 8,
  },
  signatureSection: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "30%",
  },
  signatureLabel: {
    fontSize: 7,
    fontFamily: "Custom",
    marginBottom: 4,
    color: "#666",
  },
  signatureLine: {
    borderBottom: "1pt solid #000",
    marginTop: 28,
    marginBottom: 4,
  },
});

const IPDPDFDocument = ({ data }) => (
  <Document title="IPD Report" creator={window.APP_NAME} producer={window.APP_NAME}>
    <Page size="A4" style={pdfStyles.page} orientation="portrait">
      <Header
        title="UNITED REPUBLIC OF TANZANIA"
        subtitle="MINISTRY OF HEALTH - HMIS 002: INPATIENT REPORT"
      />
      <PdfTable
        caption="Admissions by Age Group & Gender"
        columns={[
          { field: "age_group", headerName: "Age Group", flex: 1 },
          { field: "male", headerName: "Male", flex: 1, style: { textAlign: "right" } },
          { field: "female", headerName: "Female", flex: 1, style: { textAlign: "right" } },
          { field: "total", headerName: "Total", flex: 1, style: { textAlign: "right" } },
        ]}
        items={ageGroups.map((group) => ({
          age_group: group,
          male: data.admissions_by_age_gender?.[group]?.male || 0,
          female: data.admissions_by_age_gender?.[group]?.female || 0,
          total: data.admissions_by_age_gender?.[group]?.total || 0,
        }))}
      />
      <PdfTable
        columns={[
          { field: "label", headerName: "Metric", flex: 1 },
          { field: "value", headerName: "Value", flex: 1, style: { textAlign: "right" } },
        ]}
        items={[
          { label: "Total Admissions", value: data.summary?.total_admissions },
          { label: "Total Discharges", value: data.summary?.total_discharges },
          { label: "Deaths", value: data.summary?.deaths },
          { label: "Referred Out", value: data.summary?.referred_out },
        ]}
      />
      <Text style={pdfStyles.reportInfo}>
        Report generated: {data.report_date} | Period: {data.report_period?.start_date} to {data.report_period?.end_date}
      </Text>
      <View style={pdfStyles.signatureSection}>
        <View style={pdfStyles.signatureBox}>
          <Text style={pdfStyles.signatureLabel}>Prepared By:</Text>
          <View style={pdfStyles.signatureLine} />
          <Text style={pdfStyles.signatureLabel}>Signature: .................. Date: ..................</Text>
        </View>
        <View style={pdfStyles.signatureBox}>
          <Text style={pdfStyles.signatureLabel}>Reviewed By:</Text>
          <View style={pdfStyles.signatureLine} />
          <Text style={pdfStyles.signatureLabel}>Signature: .................. Date: ..................</Text>
        </View>
        <View style={pdfStyles.signatureBox}>
          <Text style={pdfStyles.signatureLabel}>Approved By:</Text>
          <View style={pdfStyles.signatureLine} />
          <Text style={pdfStyles.signatureLabel}>Signature: .................. Date: ..................</Text>
        </View>
      </View>
      <Footer text="Ministry of Health - HMIS 002" />
    </Page>
  </Document>
);

const IPDReport = () => {
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
      const res = await fetch(`/api/reports/moh/ipd-report?start_date=${formatDateParam(startDate)}&end_date=${formatDateParam(endDate)}`);
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
    document.title = `IPD Report - ${window.APP_NAME}`;
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      const blob = await pdf(<IPDPDFDocument data={data} />).toBlob();
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
        title="IPD Report (HMIS 002)"
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
          {data.note && (
            <Alert severity="info" sx={{ mb: 2 }}>{data.note}</Alert>
          )}

          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
            <InfoCard
              title="Total Admissions"
              count={data.summary?.total_admissions}
              icon={<HospitalIcon />}
              color={blue[400]}
            />
            <InfoCard
              title="Discharges"
              count={data.summary?.total_discharges}
              icon={<DischargeIcon />}
              color={green[400]}
            />
            <InfoCard
              title="Deaths"
              count={data.summary?.deaths}
              icon={<DeathIcon />}
              color={red[400]}
            />
            <InfoCard
              title="Referred Out"
              count={data.summary?.referred_out}
              icon={<ReferralIcon />}
              color={orange[400]}
            />
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Admissions by Age Group & Gender</Typography>
              <Table
                columns={[
                  { field: "age_group", headerName: "Age Group" },
                  { field: "male", headerName: "Male", tableCellProps: { align: "right" } },
                  { field: "female", headerName: "Female", tableCellProps: { align: "right" } },
                  { field: "total", headerName: "Total", tableCellProps: { align: "right" } },
                ]}
                items={ageGroups.map((group) => ({
                  age_group: group,
                  male: data.admissions_by_age_gender?.[group]?.male || 0,
                  female: data.admissions_by_age_gender?.[group]?.female || 0,
                  total: data.admissions_by_age_gender?.[group]?.total || 0,
                }))}
                itemCount={ageGroups.length}
                hidePaginationFooter
              />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default IPDReport;
