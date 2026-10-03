import React, { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import DatePicker from "../../../components/DatePicker";
import TextField from "../../../components/TextField";

import {
  formatDateForDb,
  getDateRangeTitle,
  getFullName,
  numberFormat,
  throttle,
  getWeekStartDate,
} from "../../../helpers";

const PartnerFramePayments = () => {
  const [params, setParams] = useState({
    patient_name: undefined,
    patient_phone: undefined,
    collaborator_name: undefined,
    start_date: getWeekStartDate(),
    end_date: undefined,
  });

  useEffect(() => {
    document.title = `Partner Frame Payments Report - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Reports" },
        { title: "Partner Frame Payments" },
      ]}
    >
      <Report
        title="Partner Frame Payments Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/reports/payment-center/partner-frame-payments"
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
                    md={3}
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
                    md={3}
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
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Patient Phone"
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
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Collaborator Name"
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
                          () => setParams({ ...params, collaborator_name: value }),
                          1000
                        )
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
              item.payment_cache?.check_in?.patient
                ? getFullName(
                    item.payment_cache.check_in.patient.first_name,
                    item.payment_cache.check_in.patient.middle_name,
                    item.payment_cache.check_in.patient.last_name
                  )
                : "N/A",
          },
          {
            field: "patient_id",
            headerName: "Patient Number",
            valueGetter: (item, index) =>
              item.payment_cache?.check_in?.patient_id || "N/A",
          },
          {
            field: "patient_phone",
            headerName: "Phone",
            valueGetter: (item, index) =>
              item.payment_cache?.check_in?.patient?.phone || "N/A",
          },
          {
            field: "item_name",
            headerName: "Frame Item",
            valueGetter: (item, index) => item.item?.name || "N/A",
          },
          {
            field: "quantity",
            headerName: "Quantity",
            valueGetter: (item, index) => numberFormat(item.quantity || 0),
          },
          {
            field: "amount",
            headerName: "Amount",
            valueGetter: (item, index) =>
              numberFormat((item.unit_price || 0) * (item.quantity || 0)),
          },
          {
            field: "collaborator_name",
            headerName: "Collaborator",
            valueGetter: (item, index) => item.collaborator_name || "N/A",
          },
          {
            field: "created_at",
            headerName: "Payment Date",
          },
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 5, index: 1 },
          {
            reducer: (acc, item, index) =>
              acc + (parseFloat(item.unit_price || 0) * parseFloat(item.quantity || 0)),
            index: 5,
          },
        ]}
      />
    </Page>
  );
};

export default PartnerFramePayments;
