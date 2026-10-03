import React, { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import Page from "../../components/Page";
import Report from "../../components/reports/Report";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import TextField from "../../components/TextField";

import useFetch from "../../hooks/useFetch";
import {
  formatDateForDb,
  getDateRangeTitle,
  numberFormat,
  throttle,
} from "../../helpers";

const PatientItems = ({
  module,
  title,
  consultationType,
  stockItem,
  paymentModeType,
  status,
}) => {
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
    with_patient: "Yes",
    consultation_type: undefined,
    is_stock_item: undefined,
    payment_mode_type: undefined,
    status: undefined,
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    payment_mode_id: undefined,
    q: undefined,
    start_date: undefined,
    end_date: undefined,
    report_period: "weekly",
    sort_direction: "desc",
  });

  useEffect(() => {
    document.title = `${title} - ${window.APP_NAME}`;
  }, [title]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Paid":
        return "info";
      case "Billed":
        return "purple";
      case "Served":
        return "success";
    }

    return "neutral";
  };

  const getStatusLabel = (status) => {
    if (status === "Pending") {
      return "Not Paid";
    }

    if (
      consultationType === "Pharmacy" ||
      consultationType === "Glass" ||
      consultationType === "Others"
    ) {
      if (status === "Served") {
        return "Dispensed";
      }
    }

    return status;
  };

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
        { title: module },
        { title: "Reports" },
        { title },
      ]}
    >
      <Report
        title={`${title} - ${getReportPeriodTitle()}`}
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/patient-payment-cache-items"
        params={{
          ...params,
          consultation_type: consultationType,
          is_stock_item: stockItem,
          payment_mode_type: paymentModeType,
          status,
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
                    md={2}
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Patient Name"
                      placeholder="Search"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(value) =>
                        throttle(
                          () => setParams({ ...params, patient_name: value }),
                          1000
                        )
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md={2}
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Patient Number"
                      placeholder="Search"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(value) =>
                        throttle(
                          () => setParams({ ...params, patient_id: value }),
                          1000
                        )
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md={2}
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Phone Number"
                      placeholder="Search"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(value) =>
                        throttle(
                          () => setParams({ ...params, patient_phone: value }),
                          1000
                        )
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md={2}
                    sm={6}
                    xs={12}
                  >
                    <Select
                      label="Gender"
                      fullWidth
                      options={["Male", "Female"]}
                      clearable
                      onChange={(value) =>
                        setParams({ ...params, patient_gender: value })
                      }
                    />
                  </Grid>
                  <Grid
                    item
                    md={2}
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
                  <Grid
                    item
                    md={2}
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
                </Grid>
              </CardContent>
            </Card>
          </React.Fragment>
        }
        columns={[
          {
            field: "patient_name",
            headerName: "Patient Name",
            valueGetter: (item, index) =>
              item.payment_cache.check_in.patient.full_name,
          },
          {
            field: "patient_id",
            headerName: "Patient Number",
            valueGetter: (item, index) =>
              item.payment_cache.check_in.patient_id,
          },
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
            show:
              consultationType === "Pharmacy" || consultationType === "Glass",
          },
          {
            field: "quantity",
            headerName: "Quantity",
            valueGetter: (item, index) => numberFormat(item.quantity),
          },
          {
            field: "selling_price",
            headerName: "Selling Price",
            valueGetter: (item, index) => numberFormat(item.unit_price || 0),
          },
          {
            field: "dosage",
            headerName: "Dosage",
            show: consultationType === "Pharmacy",
          },
          {
            field: "comments",
            headerName: "Comments",
            show: consultationType !== "Pharmacy",
          },
          {
            field: "created_by",
            headerName: "Created By",
            valueGetter: (item) => item.creator?.full_name,
            show: status !== "Served",
          },
          {
            field: "served_by",
            headerName:
              consultationType === "Pharmacy" ||
              consultationType === "Glass" ||
              consultationType === "Others"
                ? "Dispensed By"
                : "Served By",
            valueGetter: (item) => item.server?.full_name,
            show: status === "Served",
          },
          {
            field: status !== "Served" ? "created_at" : "served_at",
            headerName:
              status !== "Served"
                ? "Date Created"
                : consultationType === "Pharmacy" ||
                    consultationType === "Glass" ||
                    consultationType === "Others"
                  ? "Date Dispensed"
                  : "Date Served",
          },
          {
            field: "status",
            headerName: "Status",
            renderCell: (item, index) => (
              <Chip
                size="small"
                color={getStatusColor(item.status)}
                label={getStatusLabel(item.status)}
              />
            ),
            valueGetter: (item) => getStatusLabel(item.status),
          },
        ]}
      />
    </Page>
  );
};

export default PatientItems;
