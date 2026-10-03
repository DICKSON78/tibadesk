import React, { useEffect, useState } from "react";

import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";

import useFetch from "../../../hooks/useFetch";
import {
  formatDateForDb,
  getDateRangeTitle,
  getFullName,
  numberFormat,
  throttle,
  getTodayDate,
} from "../../../helpers";
import { Card, CardContent, Grid, InputAdornment } from "../../../components/ui/index.jsx";
import { Search as SearchIcon } from "../../../components/ui/icons.jsx";

const DailyCashCollection = ({ module }) => {
  const { data: paymentChannels } = useFetch(
    "api/payment-channels",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [params, setParams] = useState({
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    payment_channel_id: undefined,
    start_date: getTodayDate(),
  });

  useEffect(() => {
    document.title = `Daily Cash Collection Report - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Payment Center" },
        { title: "Reports" },
        { title: "Daily Cash Collection Report" },
      ]}
    >
      <Report
        title="Daily Cash Collection Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/reports/payment-center/cash-collection"
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
                      category="gender"
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
                    <Select
                      label="Payment Channel"
                      fullWidth
                      options={paymentChannels}
                      optionsLabel="name"
                      optionsValue="id"
                      clearable
                      onChange={(value) =>
                        setParams({ ...params, payment_channel_id: value })
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
              getFullName(item.first_name, item.middle_name, item.last_name),
          },
          {
            field: "patient_id",
            headerName: "Patient Number",
            valueGetter: (item, index) => item.patient_id,
          },
          {
            field: "items",
            headerName: "Items",
          },
          {
            field: "amount",
            headerName: "Amount",
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
            field: "channel",
            headerName: "Payment Channel",
            valueGetter: (item, index) => item.channel?.name,
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
          {
            field: "transaction_type",
            headerName: "Transaction Type",
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
        ]}
      />
    </Page>
  );
};

export default DailyCashCollection;
