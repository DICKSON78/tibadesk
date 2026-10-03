import React from "react";
import { Card, CardContent, Chip, Divider, Grid } from "../../components/ui/index.jsx";
import Page, { Header as PageHeader } from "../../components/Page";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import Report from "../../components/reports/Report";
import { numberFormat } from "../../helpers";

const NHIFClaims = () => {
  const [filters, setFilters] = React.useState({
    status: null,
    start_date: null,
    end_date: null,
  });

  return (
    <Page breadcrumbs={[{ title: "Home" }, { title: "NHIF Claims" }]}>
      <Card>
        <PageHeader title="NHIF Insurance Claims" />
        <Divider />
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item md={3} sm={6} xs={12}>
              <Select
                placeholder="Status"
                fullWidth
                clearable
                category="nhifClaimStatuses"
                onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              />
            </Grid>
            <Grid item md={3} sm={6} xs={12}>
              <DatePicker label="Start Date" fullWidth value={filters.start_date}
                onChange={(value) => setFilters((prev) => ({ ...prev, start_date: value }))} />
            </Grid>
            <Grid item md={3} sm={6} xs={12}>
              <DatePicker label="End Date" fullWidth value={filters.end_date}
                onChange={(value) => setFilters((prev) => ({ ...prev, end_date: value }))} />
            </Grid>
          </Grid>
          <Report
            uri="api/nhif-claims"
            params={filters}
            columns={[
              { field: "id", headerName: "ID", width: 70 },
              { field: "patient_name", headerName: "Patient", width: 180 },
              { field: "member_no", headerName: "Member No", width: 120 },
              { field: "authorization_no", headerName: "Authorization No", width: 140 },
              {
                field: "total_amount", headerName: "Amount (TZS)", width: 130,
                valueGetter: (row) => numberFormat(row.total_amount || 0),
              },
              {
                field: "amount_approved", headerName: "Approved (TZS)", width: 130,
                valueGetter: (row) => numberFormat(row.amount_approved || 0),
              },
              {
                field: "status", headerName: "Status", width: 110,
                renderCell: (row) => {
                  const colors = { draft: "default", submitted: "info", approved: "success", rejected: "error", paid: "primary" };
                  return <Chip size="small" color={colors[row.status] || "default"} label={row.status} />;
                },
              },
              { field: "claim_date", headerName: "Claim Date", width: 110 },
              { field: "submitted_date", headerName: "Submitted", width: 110 },
              { field: "approved_date", headerName: "Approved", width: 110 },
            ]}
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default NHIFClaims;
