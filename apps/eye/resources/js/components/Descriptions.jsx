import React from "react";
import { Grid, Paper, Typography } from "@mui/material";

const Descriptions = ({
  columns,
  items,
  containerProps,
  itemSpacing,
  itemProps,
}) => {
  items = (items || []).filter((e) => !!e.value);
  itemSpacing = itemSpacing || 2;
  columns = columns || 3;

  return (
    <Paper {...containerProps} sx={{ width: "100%", ...containerProps?.sx }}>
      <Grid
        container
        spacing={itemSpacing}
        sx={{ width: "100%" }}
      >
        {items.map((e, i) => (
          <Grid
            key={i}
            item
            md={Math.ceil(12 / columns)}
            sm={6}
            xs={12}
            sx={{ width: "100%" }}
            {...itemProps}
          >
            <Typography
              variant="body2"
              fontWeight="bold"
            >
              {e.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5 }}
            >
              {e.value}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default Descriptions;
