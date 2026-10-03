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
import {
  formatDateForDb,
  getDateRangeTitle,
  numberFormat,
  throttle,
} from "../../../helpers";

const PatientBills = ({ module, status }) => {
  const [params, setParams] = useState({
    status,
    id: undefined,
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  useEffect(() => {
    document.title = `${status} Patient Bills Report - ${window.APP_NAME}`;
    setParams({ ...params, status });
  }, [status]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Payment Center" },
        { title: "Reports" },
        { title: `${status} Patient Bills Report` },
      ]}
    >
      <Report
        title={`${status} Patient Bills Report`}
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/patient-item-bills"
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
                    md={3}
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
                    md={3}
                    sm={6}
                    xs={12}
                  >
                    <TextField
                      fullWidth
                      label="Bill Number"
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
                          () => setParams({ ...params, id: value }),
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
            field: "id",
            headerName: "Bill Number",
          },
          {
            field: "patient_name",
            headerName: "Patient Name",
            valueGetter: (item, index) =>
              item.first_item.payment_cache.check_in.patient.full_name,
          },
          {
            field: "patient_id",
            headerName: "Patient Number",
            valueGetter: (item, index) =>
              item.first_item.payment_cache.check_in.patient_id,
          },
          {
            field: "amount",
            headerName: "Bill Amount",
            valueGetter: (item, index) => numberFormat(item.amount),
          },
          {
            field: "discount",
            headerName: "Discount",
            valueGetter: (item, index) => numberFormat(item.discount),
          },
          {
            field: "subtotal",
            headerName: "Subtotal",
            valueGetter: (item, index) =>
              numberFormat(item.amount - item.discount),
          },
          {
            field: "amount_paid",
            headerName: "Amount Paid",
            valueGetter: (item, index) => numberFormat(item.amount_paid || 0),
          },
          {
            field: "created_by",
            headerName: "Created By",
            valueGetter: (item) => item.creator?.full_name,
          },
          {
            field: "created_at",
            headerName: "Date Created",
          },
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 4, index: 1 },
          { reducer: (acc, item, index) => acc + (parseFloat(item.amount) || 0), index: 4 },
          { reducer: (acc, item, index) => acc + (parseFloat(item.discount) || 0), index: 5 },
          {
            reducer: (acc, item, index) => acc + ((parseFloat(item.amount) || 0) - (parseFloat(item.discount) || 0)),
            index: 6,
          },
          {
            reducer: (acc, item, index) => acc + (parseFloat(item.amount_paid) || 0),
            index: 7,
          },
        ]}
      />
    </Page>
  );
};

export default PatientBills;
