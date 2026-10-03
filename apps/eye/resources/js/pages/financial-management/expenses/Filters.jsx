import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import useFetch from "../../../hooks/useFetch";

const Filters = ({ params, setParams, ...rest }) => {
  const { data: categories } = useFetch(
    "api/expense-categories",
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
              label="Category"
              fullWidth
              options={categories}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) => setParams({ ...params, category_id: value })}
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
              options={["Pending", "Cleared"]}
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
