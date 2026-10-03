import React from "react";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import useFetch from "../../../hooks/useFetch";

import { throttle } from "../../../helpers";
import { Card, CardContent, Grid, InputAdornment } from "../../../components/ui/index.jsx";
import { Search as SearchIcon } from "../../../components/ui/icons.jsx";

const Filters = ({ params, setParams, ...rest }) => {
  const { data: users } = useFetch(
    "api/users",
    { per_page: 500 },
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
            <Select
              label="Created By"
              fullWidth
              options={users}
              optionsLabel="full_name"
              optionsValue="user_id"
              clearable
              onChange={(value) => setParams({ ...params, created_by: value })}
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
              label="Title"
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
            md
            sm={6}
            xs={12}
          >
            <Select
              label="Status"
              fullWidth
              category="marketingStrategyStatus"
              clearable
              value={params.status}
              onChange={(value) => setParams({ ...params, status: value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
