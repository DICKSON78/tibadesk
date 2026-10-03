import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import SelectClinic from "../../../components/SelectClinic";
import useFetch from "../../../hooks/useFetch";

import { throttle } from "../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {
  const { data: departments } = useFetch(
    "api/departments",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: jobTitles } = useFetch(
    "api/job-titles",
    {
      status: "Active",
      per_page: 500,
    },
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
            <TextField
              fullWidth
              label="Full Name"
              placeholder="Search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(value) =>
                throttle(() => setParams({ ...params, name: value }), 1000)
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
              label="Employee Number"
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
                  () => setParams({ ...params, employee_number: value }),
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
              onChange={(value) => setParams({ ...params, gender: value })}
            />
          </Grid>
          {window.user.role === "Admin" ? (
            <Grid
              item
              md
              sm={12}
              xs={12}
            >
              <SelectClinic
                clearable
                onChange={(value) =>
                  setParams({ ...params, clinic_id: value?.id })
                }
              />
            </Grid>
          ) : null}
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <Select
              label="Department"
              fullWidth
              options={departments}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) =>
                setParams({ ...params, department_id: value })
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
              label="Job Title"
              fullWidth
              options={jobTitles}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) =>
                setParams({ ...params, job_title_id: value })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
