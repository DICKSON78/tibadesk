import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from "../../../components/ui/index.jsx";
import {
  AssignmentRounded as RequestsIcon,
  CheckCircleRounded as CompletedIcon,
  ScheduleRounded as ScheduledIcon,
  TrendingUpRounded as ProceduresIcon,
  RefreshRounded as RefreshIcon,
} from "../../../components/ui/icons.jsx";
import {
  green,
  purple,
  teal,
} from "../../../components/ui/colors.js";

import { Header as PageHeader } from "../../../components/Page";
import InfoCard from "../../dashboard/InfoCard";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat, getWeekStartDate, getWeekEndDate } from "../../../helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [dateParams, setDateParams] = useState({
    start_date: getWeekStartDate().toISOString().split('T')[0],
    end_date: getWeekEndDate().toISOString().split('T')[0],
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/procedure-room/dashboard",
    dateParams,
    true,
    {
      summary: {
        total_procedures: 0,
        scheduled_today: 0,
        completed_today: 0,
        pending_procedures: 0,
      },
      statistics: {
        top_procedures: [],
        procedure_trends: [],
      },
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Procedure Room Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const handleRefresh = () => {
    handleFetch();
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Procedure Room Dashboard"
        trailing={
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />
      {!loading && data ? (
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
          <InfoCard
            title="Total Procedures"
            count={numberFormat(data.summary?.total_procedures || 0)}
            icon={<ProceduresIcon />}
            color={purple[400]}
            onClick={() => navigate('/procedure-room/procedure-requests')}
          />
          <InfoCard
            title="Scheduled Today"
            count={numberFormat(data.summary?.scheduled_today || 0)}
            icon={<ScheduledIcon />}
            color={teal[400]}
            onClick={() => navigate('/procedure-room/procedure-requests')}
          />
          <InfoCard
            title="Completed Today"
            count={numberFormat(data.summary?.completed_today || 0)}
            icon={<CompletedIcon />}
            color={green[400]}
            onClick={() => navigate('/procedure-room/reports/served-procedures')}
          />
          <InfoCard
            title="Pending Procedures"
            count={numberFormat(data.summary?.pending_procedures || 0)}
            icon={<RequestsIcon />}
            color={teal[400]}
            onClick={() => navigate('/procedure-room/reports/pending-procedures')}
          />
        </Grid>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
