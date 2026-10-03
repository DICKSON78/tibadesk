import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  LinearProgress,
} from "../../../components/ui/index.jsx";
import {
  MedicationRounded as DispensingIcon,
  AssignmentRounded as RequestsIcon,
  CheckCircleRounded as CompletedIcon,
  TrendingUpRounded as DispensedIcon,
} from "../../../components/ui/icons.jsx";
import {
  green,
  orange,
  cyan,
  purple,
} from "../../../components/ui/colors.js";

import { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const { data, loading, error } = useFetch(
    "api/dispensing/dashboard",
    {
      start_date: getWeekStartDate().toISOString().split('T')[0],
      end_date: getWeekEndDate().toISOString().split('T')[0],
    },
    true,
    {
      summary: {
        total_dispensed: 0,
        pending_requests: 0,
        completed_today: 0,
        items_dispensed: 0,
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Dispensing Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <Box>
      <PageHeader title="Dispensing Dashboard" />

      {loading && <LinearProgress />}

      {!loading && data ? (
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
          <InfoCard
            title="Total Dispensed"
            count={numberFormat(data.summary?.total_dispensed || 0)}
            icon={<DispensingIcon />}
            color={green[400]}
            onClick={() => navigate('/dispensing/reports/items-dispensed')}
          />
          <InfoCard
            title="Pending Requests"
            count={numberFormat(data.summary?.pending_requests || 0)}
            icon={<RequestsIcon />}
            color={orange[400]}
            onClick={() => navigate('/dispensing/dispensing-requests')}
          />
          <InfoCard
            title="Completed Today"
            count={numberFormat(data.summary?.completed_today || 0)}
            icon={<CompletedIcon />}
            color={cyan[500]}
            onClick={() => navigate('/dispensing/reports/items-dispensed')}
          />
          <InfoCard
            title="Items Dispensed"
            count={numberFormat(data.summary?.items_dispensed || 0)}
            icon={<DispensedIcon />}
            color={purple[400]}
            onClick={() => navigate('/dispensing/reports/items-dispensed')}
          />
        </Grid>
      ) : null}
    </Box>
  );
};

export default Dashboard;
