import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Descriptions from "../../../components/Descriptions";

const MarketingStrategyDetails = ({ item, modal }) => {
  return (
    <React.Fragment>
      <CardContent>
        <Descriptions
          columns={1}
          items={[
            { label: "Title", value: item.title },
            { label: "Overview", value: item.overview },
            { label: "Goals", value: item.goals },
            { label: "Target Audience", value: item.target_audience },
            { label: "Budget", value: item.budget },
            { label: "Channels", value: item.channels },
          ]}
          containerProps={{ variant: "outlined", sx: { p: 2 } }}
        />
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default MarketingStrategyDetails;
