import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import WeeklyDatePicker from "../../../components/WeeklyDatePicker";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { throttle } from "../../../helpers";

const GlassPatientFilters = ({
  params,
  setParams,
  ...rest
}) => {
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
            md={4}
            sm={6}
            xs={12}
          >
            <WeeklyDatePicker
              fullWidth
              label="Select Week"
              startDate={params.start_date}
              endDate={params.end_date}
              onStartDateChange={(value) =>
                setParams({
                  ...params,
                  start_date: value,
                })
              }
              onEndDateChange={(value) =>
                setParams({ 
                  ...params, 
                  end_date: value 
                })
              }
            />
          </Grid>
          <Grid
            item
            md={4}
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
            md={4}
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
            md={4}
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
            md={4}
            sm={6}
            xs={12}
          >
            <Select
              label="Gender"
              fullWidth
              options={[
                { id: "Male", name: "Male" },
                { id: "Female", name: "Female" },
              ]}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) => setParams({ ...params, patient_gender: value })}
            />
          </Grid>
          <Grid
            item
            md={4}
            sm={6}
            xs={12}
          >
            <Select
              label="Payment Mode"
              fullWidth
              options={[
                { id: "Cash", name: "Cash" },
                { id: "Credit", name: "Credit" },
                { id: "Insurance", name: "Insurance" },
              ]}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) => setParams({ ...params, item_payment_mode_id: value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GlassPatientFilters;
