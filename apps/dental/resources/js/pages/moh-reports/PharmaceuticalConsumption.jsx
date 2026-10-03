import React, { useState, useEffect, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Box, Button, Card, CardContent, Grid, LinearProgress, Paper, Typography,
} from "../../components/ui/index.jsx";
import {
  MedicationRounded as MedicineIcon,
  Inventory2Rounded as ItemsIcon,
  LocalPharmacyRounded as PharmIcon,
  AttachMoneyRounded as MoneyIcon,
  PictureAsPdfRounded as PdfIcon,
} from "../../components/ui/icons.jsx";
import {
  blue, green, orange, purple,
} from "../../components/ui/colors.js";
import { Header as PageHeader } from "../../components/Page";
import { numberFormat } from "../../helpers";
import DatePicker from "../../components/DatePicker";
import Table from "../../components/Table";
import InfoCard from "../dashboard/InfoCard";
import { useToast } from "../../hooks";
import { MoHPharmaceuticalPDF } from "./MoHReportPDF";

const PharmaceuticalConsumption = () => {
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
      const res = await fetch(`/api/reports/moh/pharmaceutical-consumption?start_date=${formatDateParam(startDate)}&end_date=${formatDateParam(endDate)}`);
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
    document.title = `Pharmaceutical Consumption Report - ${window.APP_NAME}`;
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      const blob = await pdf(<MoHPharmaceuticalPDF data={data} />).toBlob();
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
        title="Pharmaceutical Consumption Report (HMIS 009)"
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
              title="Items Dispensed"
              count={data.summary?.total_items_dispensed}
              icon={<ItemsIcon />}
              color={blue[400]}
            />
            <InfoCard
              title="Total Quantity"
              count={data.summary?.total_quantity}
              icon={<PharmIcon />}
              color={green[400]}
            />
            <InfoCard
              title="Unique Medicines"
              count={data.summary?.unique_medicines}
              icon={<MedicineIcon />}
              color={purple[400]}
            />
            <InfoCard
              title="Total Value"
              count={`Tsh ${numberFormat(data.summary?.total_value)}`}
              icon={<MoneyIcon />}
              color={orange[400]}
            />
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Medicines Dispensed</Typography>
              <Table
                columns={[
                  { field: "sn", headerName: "S/N", tableCellProps: { sx: { width: 60 } } },
                  { field: "medicine_name", headerName: "Medicine Name" },
                  { field: "quantity_dispensed", headerName: "Quantity Dispensed", tableCellProps: { align: "right" } },
                  { field: "total_value", headerName: "Total Value (Tsh)", tableCellProps: { align: "right" } },
                ]}
                items={(data.by_medicine || []).map((item, i) => ({
                  ...item,
                  sn: i + 1,
                  total_value: numberFormat(item.total_value),
                }))}
                itemCount={data.by_medicine?.length || 0}
                hidePaginationFooter
              />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default PharmaceuticalConsumption;
