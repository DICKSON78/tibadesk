import React, { useState } from "react";

import { Box, Button, CardActions, CardContent, Grid } from "@mui/material";
import DatePicker from "../../components/DatePicker";
import SelectClinic from "../../components/SelectClinic";

const Filters = ({ params: initial, setParams: updateParams, modal }) => {
  const [params, setParams] = useState(initial);

  const handleSubmit = () => {
    updateParams(params);
    modal.close();
  };

  return (
    <React.Fragment>
      <CardContent>
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            md={6}
            sm={12}
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
            md={6}
            sm={12}
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
          {window.user.role === "Admin" ? (
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <SelectClinic
                clearable
                value={params.clinic}
                onChange={(value) =>
                  setParams({ ...params, clinic: value, clinic_id: value?.id })
                }
              />
            </Grid>
          ) : null}
        </Grid>
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          sx={{ mr: 1 }}
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
        >
          Filter
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default Filters;
