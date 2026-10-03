import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import DatePicker from "../../../components/DatePicker";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { throttle } from "../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {
  console.log('Filters - params:', params);
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
            md={3}
            sm={6}
            xs={12}
          >
            <Select
              fullWidth
              label="View Period"
              options={["Daily", "Weekly", "Monthly"]}
              value={params.view_period === 'daily' ? 'Daily' : params.view_period === 'weekly' ? 'Weekly' : 'Monthly'}
              onChange={(value) => {
                console.log('View Period Select - onChange called with value:', value);
                const periodMap = {
                  'Daily': 'daily',
                  'Weekly': 'weekly', 
                  'Monthly': 'monthly'
                };
                const newParams = {
                  ...params,
                  view_period: periodMap[value],
                  to_return_date: null, // Always clear date when changing view period
                };
                console.log('View Period Select - newParams:', newParams);
                setParams(newParams);
              }}
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
              label="Select Return Date"
              value={params.to_return_date || null}
              onChange={(value) => {
                console.log('Date Picker - onChange called with value:', value);
                const newParams = {
                  ...params,
                  to_return_date: !isNaN(value) ? value : null,
                  view_period: !isNaN(value) ? 'daily' : params.view_period, // Set to daily when specific date is selected
                };
                console.log('Date Picker - newParams:', newParams);
                setParams(newParams);
              }}
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
                  () => setParams({ ...params, patient_name: value }),
                  1000
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
                  () => setParams({ ...params, patient_id: value }),
                  1000
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
              label="Gender"
              fullWidth
              options={["Male", "Female"]}
              clearable
              onChange={(value) =>
                setParams({ ...params, patient_gender: value })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
