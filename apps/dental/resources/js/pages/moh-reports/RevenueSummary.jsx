import React, { useState, useEffect, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Box, Button, Card, CardContent, Grid, LinearProgress, Paper, Typography,
} from "../../components/ui/index.jsx";
import {
  PaymentsRounded as PaymentsIcon,
  ReceiptRounded as ReceiptIcon,
  MoneyOffRounded as DiscountIcon,
  AccountBalanceWalletRounded as NetIcon,
  PictureAsPdfRounded as PdfIcon,
} from "../../components/ui/icons.jsx";
import {
  blue, green, orange, purple, teal, red,
} from "../../components/ui/colors.js";
import { Header as PageHeader } from "../../components/Page";
import { numberFormat } from "../../helpers";
import DatePicker from "../../components/DatePicker";
import Table from "../../components/Table";
import InfoCard from "../dashboard/InfoCard";
import { useToast } from "../../hooks";
import { MoHRevenuePDF } from "./MoHReportPDF";

const RevenueSummary = () => {
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
      const res = await fetch(`/api/reports/moh/revenue-summary?start_date=${formatDateParam(startDate)}&end_date=${formatDateParam(endDate)}`);
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
    document.title = `Revenue Summary Report - ${window.APP_NAME}`;
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      const blob = await pdf(<MoHRevenuePDF data={data} />).toBlob();
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
        title="Revenue Summary Report"
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
              title="Total Transactions"
              count={data.summary?.total_transactions}
              icon={<ReceiptIcon />}
              color={blue[400]}
            />
            <InfoCard
              title="Total Amount"
              count={`Tsh ${numberFormat(data.summary?.total_amount)}`}
              icon={<PaymentsIcon />}
              color={green[400]}
            />
            <InfoCard
              title="Discounts"
              count={`Tsh ${numberFormat(data.summary?.total_discount)}`}
              icon={<DiscountIcon />}
              color={red[400]}
            />
            <InfoCard
              title="Net Revenue"
              count={`Tsh ${numberFormat(data.summary?.total_net)}`}
              icon={<NetIcon />}
              color={teal[400]}
            />
          </Grid>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Revenue by Payment Channel</Typography>
              <Table
                columns={[
                  { field: "sn", headerName: "S/N", tableCellProps: { sx: { width: 60 } } },
                  { field: "channel", headerName: "Payment Channel" },
                  { field: "count", headerName: "Transactions", tableCellProps: { align: "right" } },
                  { field: "amount", headerName: "Amount (Tsh)", tableCellProps: { align: "right" } },
                ]}
                items={(data.by_channel || []).map((item, i) => ({
                  ...item,
                  sn: i + 1,
                  amount: numberFormat(item.amount),
                }))}
                itemCount={data.by_channel?.length || 0}
                hidePaginationFooter
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Daily Revenue Breakdown</Typography>
              <Table
                columns={[
                  { field: "sn", headerName: "S/N", tableCellProps: { sx: { width: 60 } } },
                  { field: "date", headerName: "Date" },
                  { field: "count", headerName: "Transactions", tableCellProps: { align: "right" } },
                  { field: "amount", headerName: "Amount (Tsh)", tableCellProps: { align: "right" } },
                ]}
                items={(data.by_date || []).map((item, i) => ({
                  ...item,
                  sn: i + 1,
                  amount: numberFormat(item.amount),
                }))}
                itemCount={data.by_date?.length || 0}
                hidePaginationFooter
              />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default RevenueSummary;
