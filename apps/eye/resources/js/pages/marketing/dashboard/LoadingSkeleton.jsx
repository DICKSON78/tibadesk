import React from "react";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

const LoadingSkeleton = () => {
  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 2, md: 3 }}
    >
      <Grid
        item
        md={3}
        sm={6}
        xs={12}
      >
        <Skeleton
          variant="rounded"
          height={250}
        />
      </Grid>
      <Grid
        item
        md={3}
        sm={6}
        xs={12}
      >
        <Skeleton
          variant="rounded"
          height={250}
        />
      </Grid>
      <Grid
        item
        md={3}
        sm={6}
        xs={12}
      >
        <Skeleton
          variant="rounded"
          height={250}
        />
      </Grid>
      <Grid
        item
        md={3}
        sm={6}
        xs={12}
      >
        <Skeleton
          variant="rounded"
          height={250}
        />
      </Grid>
      <Grid
        item
        md={6}
        sm={12}
        xs={12}
      >
        <Skeleton
          variant="rounded"
          height={300}
        />
      </Grid>
      <Grid
        item
        md={6}
        sm={12}
        xs={12}
      >
        <Skeleton
          variant="rounded"
          height={300}
        />
      </Grid>
    </Grid>
  );
};

export default LoadingSkeleton;
