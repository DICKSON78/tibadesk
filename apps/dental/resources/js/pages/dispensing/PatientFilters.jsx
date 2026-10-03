import React from "react";
import DatePicker from "../../components/DatePicker";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import SelectUser from "../../components/SelectUser";
import useFetch from "../../hooks/useFetch";

import { throttle } from "../../helpers";
import { Card, CardContent, Grid, InputAdornment } from "../../components/ui/index.jsx";
import { Search as SearchIcon } from "../../components/ui/icons.jsx";

const PatientFilters = ({ params, setParams, ...rest }) => {
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

  const { data: items } = useFetch(
    "api/items",
    { status: "Active", per_page: 500 },
    true,
    [],
    (response) => response.data.data.data
  );

  return (
    <Card
      variant="outlined"
      {...rest}
      sx={{
        bgcolor: "background.default",
        ...(rest && rest.sx),
      }}
    >
      <CardContent>
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            md
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
            md
            sm={6}
            xs={12}
          >
            <DatePicker
              fullWidth
              label="End Date"
              value={params.end_date || null}
              onChange={(value) =>
                setParams({ ...params, end_date: !isNaN(value) ? value : null })
              }
            />
          </Grid>
          <Grid
            item
            md
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
                  () => setParams(prev => ({ ...prev, patient_name: value })),
                  1000,
                  'patient_name'
                )
              }
            />
          </Grid>
          <Grid
            item
            md
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
                  () => setParams(prev => ({ ...prev, patient_id: value })),
                  1000,
                  'patient_id'
                )
              }
            />
          </Grid>
          <Grid
            item
            md
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
                setParams({ ...params, item_payment_mode_id: value })
              }
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Item"
              fullWidth
              options={items}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) => setParams({ ...params, item_id: value })}
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <SelectUser
              label="Consultant"
              clearable
              params={{ designation: "Doctor" }}
              onChange={(value) =>
                setParams({ ...params, consultant_id: value?.id })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PatientFilters;
