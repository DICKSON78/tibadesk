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

const ItemQuantityDispensed = () => {
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
    consultation_type: "Pharmacy,Glass,Others",
    payment_mode_id: undefined,
    q: undefined,
    start_date: undefined,
    end_date: undefined,
    report_period: "weekly",
  });

  useEffect(() => {
    document.title = `Quantity Dispensed Report - ${window.APP_NAME}`;
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
        { title: "Inventory Management" },
        { title: "Reports" },
        { title: "Quantity Dispensed Report" },
      ]}
    >
      <Report
        title={`Quantity Dispensed Report - ${getReportPeriodTitle()}`}
        subtitle={`${getDateRangeTitle(params.start_date, params.end_date)} • Note: Negative values indicate stock shortages (more dispensed than available)`}
        uri="api/reports/inventory-management/item-quantity-dispensed"
        params={{
          ...params,
          start_date: params.start_date
            ? formatDateForDb(params.start_date)
            : undefined,
          end_date: params.end_date
            ? formatDateForDb(params.end_date)
            : undefined,
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
            valueGetter: (item, index) => item.item.name,
          },
          {
            field: "code",
            headerName: "Item Code",
            valueGetter: (item, index) => item.item.code,
          },
          {
            field: "unit_of_measure_id",
            headerName: "Unit of Measure",
            valueGetter: (item, index) => item.item.unit_of_measure?.name,
          },
          {
            field: "quantity_dispensed",
            headerName: "Quantity Dispensed",
            valueGetter: (item, index) =>
              numberFormat(item.quantity_dispensed || 0),
          },
          {
            field: "dispensed_value",
            headerName: "Dispensed Value",
            valueGetter: (item, index) =>
              numberFormat(item.dispensed_value || 0),
          },
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 5, index: 0 },
          {
            reducer: (acc, item, index) => {
              const balance = parseFloat(item.balance) || 0;
              return acc + (balance < 0 ? 0 : balance);
            },
            index: 5,
          },
          {
            reducer: (acc, item, index) => {
              const remaining = parseFloat(item.new_balance) || 0;
              return acc + (remaining < 0 ? 0 : remaining);
            },
            index: 6,
          },
          {
            reducer: (acc, item, index) => {
              const remaining = parseFloat(item.new_balance) || 0;
              return acc + (remaining < 0 ? 0 : remaining);
            },
            index: 7,
          },
          {
            reducer: (acc, item, index) => acc + (parseFloat(item.dispensed_value) || 0),
            index: 8,
          },
        ]}
      />
    </Page>
  );
};

export default ItemQuantityDispensed;
