import React from "react";
import Descriptions from "../../../components/Descriptions";
import { Box, Button, CardActions, CardContent } from "../../../components/ui/index.jsx";

const ResearchPlanDetails = ({ item, modal }) => {
  return (
    <React.Fragment>
      <CardContent>
        <Descriptions
          columns={1}
          items={[
            { label: "Title", value: item.title },
            { label: "Overview", value: item.overview },
            { label: "Goals", value: item.goals },
            { label: "Deliverables", value: item.deliverables },
            { label: "Target Audience", value: item.target_audience },
            { label: "Sample Plan", value: item.sample_plan },
            { label: "Research Methods", value: item.research_methods },
            { label: "Timeline", value: item.timeline },
            { label: "Budget", value: item.budget },
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

export default ResearchPlanDetails;
