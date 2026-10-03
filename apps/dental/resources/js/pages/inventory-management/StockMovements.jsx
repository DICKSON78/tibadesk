import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "../../components/ui/index.jsx";

import Page, { Header as PageHeader } from "../../components/Page";
import Select from "../../components/Select";
import DatePicker from "../../components/DatePicker";
import Report from "../../components/reports/Report";

import { useFetch } from "../../hooks";
import { numberFormat, formatDate } from "../../helpers";

const StockMovements = () => {
  const [filters, setFilters] = useState({
    type: null,
    start_date: null,
    end_date: null,
  });

  const { data: summary } = useFetch(
    "api/stock-movements/summary", {}, false, {},
    (response) => response.data.data
  );

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Inventory Management" },
        { title: "Stock Movements" },
      ]}
    >
      <Card>
        <PageHeader title="Stock Movement History" />
        <Divider />
        <CardContent>
          {summary && (
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6} md={3}>
                <Stack alignItems="center">
                  <Typography variant="h4" color="success.main">
                    {numberFormat(summary.stock_in_today || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Stock In Today
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6} md={3}>
                <Stack alignItems="center">
                  <Typography variant="h4" color="error.main">
                    {numberFormat(summary.stock_out_today || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Stock Out Today
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6} md={3}>
                <Stack alignItems="center">
                  <Typography variant="h4" color="primary.main">
                    {numberFormat(summary.total_in || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Stock In
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6} md={3}>
                <Stack alignItems="center">
                  <Typography variant="h4" color="warning.main">
                    {numberFormat(summary.total_out || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Stock Out
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          )}
          <Grid container spacing={2} mb={2}>
            <Grid item md={3} sm={6} xs={12}>
              <Select
                placeholder="Movement Type"
                fullWidth
                clearable
                category="stockMovementType"
                optionsLabel="label"
                optionsValue="value"
                onChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
              />
            </Grid>
            <Grid item md={3} sm={6} xs={12}>
              <DatePicker
                label="Start Date"
                fullWidth
                value={filters.start_date}
                onChange={(value) => setFilters((prev) => ({ ...prev, start_date: value }))}
              />
            </Grid>
            <Grid item md={3} sm={6} xs={12}>
              <DatePicker
                label="End Date"
                fullWidth
                value={filters.end_date}
                onChange={(value) => setFilters((prev) => ({ ...prev, end_date: value }))}
              />
            </Grid>
          </Grid>
          <Report
            uri="api/stock-movements"
            params={filters}
            columns={[
              { field: "id", headerName: "ID", width: 70 },
              {
                field: "item",
                headerName: "Item",
                width: 200,
                valueGetter: (row) => row.item?.name || "-",
              },
              {
                field: "type",
                headerName: "Type",
                width: 110,
                renderCell: (row) => {
                  const color = row.type === "in" ? "success" : row.type === "out" ? "error" : "warning";
                  const label = row.type === "in" ? "Stock In" : row.type === "out" ? "Stock Out" : "Adjustment";
                  return <Chip size="small" color={color} label={label} />;
                },
              },
              {
                field: "quantity",
                headerName: "Quantity",
                width: 100,
                valueGetter: (row) => numberFormat(row.quantity || 0),
              },
              {
                field: "balance_before",
                headerName: "Before",
                width: 90,
                valueGetter: (row) => numberFormat(row.balance_before || 0),
              },
              {
                field: "balance_after",
                headerName: "After",
                width: 90,
                valueGetter: (row) => numberFormat(row.balance_after || 0),
              },
              {
                field: "reason",
                headerName: "Reason",
                width: 180,
              },
              {
                field: "creator",
                headerName: "Created By",
                width: 150,
                valueGetter: (row) => row.creator?.full_name || "-",
              },
              {
                field: "created_at",
                headerName: "Date",
                width: 150,
                valueGetter: (row) => formatDate(row.created_at),
              },
            ]}
            filters={filters}
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default StockMovements;
