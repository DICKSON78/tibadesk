import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import useFetch from "../../../hooks/useFetch";
import {
  formatDateForDb,
  getDateRangeTitle,
  numberFormat,
  throttle,
} from "../../../helpers";

const ItemBalance = () => {
  const { data: paymentModes } = useFetch(
    "api/payment-modes",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [params, setParams] = useState({
    consultation_type: "Pharmacy",
    payment_mode_id: undefined,
    q: undefined,
    start_date: undefined,
    end_date: undefined,
    report_period: "weekly",
  });

  useEffect(() => {
    document.title = `Item Balance Report - ${window.APP_NAME}`;
  }, []);

  const getReportPeriodTitle = () => {
    switch (params.report_period) {
      case "daily":
        return "Daily Report";
      case "weekly":
        return "Weekly Report";
      case "monthly":
        return "Monthly Report";
      case "yearly":
        return "Yearly Report";
      default:
        return "";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Dispensing" },
        { title: "Reports" },
        { title: "Item Balance Report" },
      ]}
    >
      <Report
        title={`Item Balance Report - ${getReportPeriodTitle()}`}
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/reports/inventory-management/item-balance"
        params={{
          ...params,
          start_date: params.start_date
            ? formatDateForDb(params.start_date)
            : undefined,
          end_date: params.end_date
            ? formatDateForDb(params.end_date)
            : undefined,
        }}
        onFetch={(payload) => {
          try {
            // Inspect payload shape to ensure columns and reducer read the right fields
            const sample = Array.isArray(payload?.data) ? payload.data[0] : undefined;
            /* eslint-disable no-console */
            console.log('[ItemBalance] payload keys:', Object.keys(payload || {}));
            console.log('[ItemBalance] total:', payload?.total, 'page:', payload?.page);
            console.log('[ItemBalance] sample item:', sample);
            // Defensive: normalize each item to a flat shape the table expects
            if (Array.isArray(payload?.data)) {
              payload.data = payload.data.map((row) => {
                const item = row?.item ?? row;
                return {
                  ...item,
                  // keep original fields for export consistency
                  _raw: row,
                  balance: parseFloat(item?.balance ?? row?.balance) || 0,
                  selling_price: parseFloat(item?.selling_price ?? row?.selling_price) || 0,
                };
              });
            }
          } catch (e) {
            console.warn('[ItemBalance] onFetch normalize failed:', e);
          }
        }}
        prependInner={
          <React.Fragment>
            <Card
              variant="outlined"
              sx={{
                bgcolor: "background.default",
                mb: 2,
              }}
            >
              <CardContent>
                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    md={2}
                    sm={6}
                    xs={12}
                  >
                    <Select
                      label="Report Period"
                      fullWidth
                      options={[
                        { id: "daily", name: "Daily" },
                        { id: "weekly", name: "Weekly" },
                        { id: "monthly", name: "Monthly" },
                        { id: "yearly", name: "Yearly" },
                      ]}
                      optionsLabel="name"
                      optionsValue="id"
                      value={params.report_period}
                      onChange={(value) =>
                        setParams({ ...params, report_period: value })
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md={2}
                    sm={6}
                    xs={12}
                  >
                    <DatePicker
                      fullWidth
                      label="Start Date"
                      value={params.start_date || null}
                      onChange={(value) =>
                        setParams({
                          ...params,
                          start_date: !isNaN(value) ? value : null,
                        })
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md={2}
                    sm={6}
                    xs={12}
                  >
                    <DatePicker
                      fullWidth
                      label="End Date"
                      value={params.end_date || null}
                      onChange={(value) =>
                        setParams({
                          ...params,
                          end_date: !isNaN(value) ? value : null,
                        })
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Item Name/Code"
                      placeholder="Search"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(value) =>
                        throttle(() => setParams({ ...params, q: value }), 1000)
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <Select
                      label="Payment Mode"
                      fullWidth
                      options={paymentModes}
                      optionsLabel="name"
                      optionsValue="id"
                      clearable
                      onChange={(value) =>
                        setParams({ ...params, payment_mode_id: value })
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </React.Fragment>
        }
        columns={[
          {
            field: "name",
            headerName: "Item Name",
            valueGetter: (item, index) => item?.name ?? item?.item?.name,
          },
          {
            field: "code",
            headerName: "Item Code",
            valueGetter: (item, index) => item?.code ?? item?.item?.code,
          },
          {
            field: "unit_of_measure_id",
            headerName: "Unit of Measure",
            valueGetter: (item, index) => item?.unit_of_measure?.name ?? item?.item?.unit_of_measure?.name,
          },
          {
            field: "balance",
            headerName: "Balance",
            valueGetter: (item, index) => {
              const rawBalance = item?.balance ?? item?.item?.balance;
              const balance = parseFloat(rawBalance) || 0;
              // Display 0 instead of negative values to avoid confusion during inspections
              return numberFormat(balance < 0 ? 0 : balance);
            },
          },
          {
            field: "selling_price",
            headerName: "Selling Price",
            valueGetter: (item, index) => numberFormat((item?.selling_price ?? item?.item?.selling_price) || 0),
          },
          {
            field: "total_value",
            headerName: "Total Value",
            valueGetter: (item, index) => {
              const rawBalance = item?.balance ?? item?.item?.balance;
              const rawPrice = item?.selling_price ?? item?.item?.selling_price;
              const balance = parseFloat(rawBalance) || 0;
              const sellingPrice = parseFloat(rawPrice) || 0;
              // Use 0 for negative balances to avoid confusion during inspections
              const effectiveBalance = balance < 0 ? 0 : balance;
              return numberFormat(effectiveBalance * sellingPrice);
            },
          },
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 4, index: 1 },
          {
            reducer: (acc, item, index) => {
              const rawBalance = item?.balance ?? item?.item?.balance;
              const rawPrice = item?.selling_price ?? item?.item?.selling_price;
              const balance = parseFloat(rawBalance) || 0;
              const sellingPrice = parseFloat(rawPrice) || 0;
              // Use 0 for negative balances to avoid confusion during inspections
              const effectiveBalance = balance < 0 ? 0 : balance;
              return acc + (effectiveBalance * sellingPrice);
            },
            index: 5,
          },
        ]}
      />
    </Page>
  );
};

export default ItemBalance;
