import React from "react";
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/SearchRounded";
import TextField from "../../../../components/TextField";
import Select from "../../../../components/Select";
import SelectClinic from "../../../../components/SelectClinic";
import useFetch from "../../../../hooks/useFetch";

import { throttle } from "../../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {
  const { data: itemTypes } = useFetch(
    "api/item-types",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: consultationTypes } = useFetch(
    "api/consultation-types",
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
            md={3}
            sm={12}
            xs={12}
          >
            <TextField
              label="Item Name/Code"
              fullWidth
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
            md={3}
            sm={12}
            xs={12}
          >
            <Select
              label="Item Type"
              fullWidth
              options={itemTypes}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) =>
                setParams({ ...params, item_type_id: value })
              }
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            xs={12}
          >
            <Select
              label="Consultation Type"
              fullWidth
              options={consultationTypes}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) =>
                setParams({ ...params, consultation_type_id: value })
              }
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            xs={12}
          >
            <Select
              label="Status"
              fullWidth
              options={["Active", "Inactive"]}
              clearable
              value={params.status}
              onChange={(value) => setParams({ ...params, status: value })}
            />
          </Grid>
          {window.user.role === "Admin" ? (
            <Grid
              item
              md={3}
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
            md={3}
            sm={12}
            xs={12}
            alignSelf="flex-end"
          >
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(event) =>
                    setParams({
                      ...params,
                      is_consultation_item: event.target.checked ? "Yes" : "No",
                    })
                  }
                />
              }
              label="Consultation Item"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
