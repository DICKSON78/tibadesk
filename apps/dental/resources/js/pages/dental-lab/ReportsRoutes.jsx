import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Card, CardContent, Chip, Grid } from "../../components/ui/index.jsx";
import Page, { Header as PageHeader } from "../../components/Page";
import Report from "../../components/reports/Report";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import { formatDateForDb, getDateRangeTitle, formatDate } from "../../helpers";

const statusColors = {
  Ordered: "warning",
  "In Progress": "info",
  Ready: "success",
  Delivered: "secondary",
};

const LabOrdersReport = () => {
  const [params, setParams] = useState({
    status: "",
    start_date: "",
    end_date: "",
    report_period: "monthly",
  });

  const getReportPeriodTitle = () => {
    switch (params.report_period) {
      case "daily": return "Daily Report";
      case "weekly": return "Weekly Report";
      case "monthly": return "Monthly Report";
      case "yearly": return "Yearly Report";
      default: return "";
    }
  };

  return (
    <Page breadcrumbs={[{ title: "Home" }, { title: "Dental Lab" }, { title: "Reports" }, { title: "Lab Orders Report" }]}>
      <PageHeader title="Lab Orders Report" />
      <Report
        title={`Lab Orders Report - ${getReportPeriodTitle()}`}
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/dental-lab-orders"
        params={Object.fromEntries(Object.entries({
          ...params,
          start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
          end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
        }).filter(([_, v]) => v != null && v !== ""))}
        prependInner={
          <Card variant="outlined" sx={{ bgcolor: "background.default", mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item md={2} sm={6} xs={12}>
                  <Select
                    label="Report Period"
                    fullWidth
                    category="reportPeriod"
                    value={params.report_period}
                    onChange={(value) => setParams({ ...params, report_period: value })}
                  />
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <DatePicker
                    fullWidth label="Start Date"
                    value={params.start_date || null}
                    onChange={(value) => setParams({ ...params, start_date: !isNaN(value) ? value : null })}
                  />
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <DatePicker
                    fullWidth label="End Date"
                    value={params.end_date || null}
                    onChange={(value) => setParams({ ...params, end_date: !isNaN(value) ? value : null })}
                  />
                </Grid>
                <Grid item md={2} sm={6} xs={12}>
                  <Select
                    label="Status"
                    fullWidth
                    clearable
                    category="labReportStatus"
                    value={params.status}
                    onChange={(value) => setParams({ ...params, status: value })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        }
        columns={[
          {
            field: "id",
            headerName: "Order #",
            valueGetter: (row) => `DL-${row.id}`,
          },
          {
            field: "patient",
            headerName: "Patient",
            valueGetter: (row) => row.payment_cache_item?.payment_cache?.check_in?.patient?.full_name || row.consultation?.id || "N/A",
          },
          { field: "order_type", headerName: "Order Type" },
          { field: "material", headerName: "Material" },
          { field: "shade", headerName: "Shade" },
          {
            field: "tooth_number",
            headerName: "Tooth #",
            valueGetter: (row) => row.tooth_number || "-",
          },
          {
            field: "lab_name",
            headerName: "Lab",
            valueGetter: (row) => row.lab_name || "N/A",
          },
          {
            field: "status",
            headerName: "Status",
            renderCell: (row) => (
              <Chip label={row.status} color={statusColors[row.status] || "default"} size="small" />
            ),
          },
          {
            field: "cost",
            headerName: "Cost (TZS)",
            valueGetter: (row) => row.cost ? Number(row.cost).toLocaleString() : "-",
          },
          {
            field: "technician_charges",
            headerName: "Tech Charges (TZS)",
            valueGetter: (row) => row.technician_charges ? Number(row.technician_charges).toLocaleString() : "-",
          },
          {
            field: "impression_date",
            headerName: "Impression",
            valueGetter: (row) => row.impression_date ? formatDate(row.impression_date) : "-",
          },
          {
            field: "delivery_date",
            headerName: "Delivery",
            valueGetter: (row) => row.delivery_date ? formatDate(row.delivery_date) : "-",
          },
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 9, index: 1 },
          {
            reducer: (acc, item) => acc + (parseFloat(item.cost) || 0),
            index: 10,
          },
        ]}
        />
      </Page>
    );
};

const ReportsRoutes = () => (
  <Routes>
    <Route path="/lab-orders" element={<LabOrdersReport />} />
  </Routes>
);

export default ReportsRoutes;
