import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  LinearProgress,
  Typography,
} from "../../../components/ui/index.jsx";
import {
  AttachMoneyRounded as RevenueIcon,
  MoneyOffRounded as ExpenseIcon,
  TrendingUpRounded as ProfitIcon,
  ReceiptRounded as BillsIcon,
} from "../../../components/ui/icons.jsx";
import {
  cyan,
  purple,
  teal,
  pink,
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

  const { data, loading, error } = useFetch(
    "api/financial-management/dashboard",
    dateParams,
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Financial Management Dashboard - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Dashboard API Error:", error);
        if (error?.response?.status === 401) {
          addToast({ message: "Authentication failed. Please login again.", severity: "error" });
          // Under this application's own key, and to the mounted login path.
          // The unprefixed "token" key is shared with another application
          // TibaDesk mounts alongside this one, so clearing it here would sign
          // the user out of that one too.
          localStorage.removeItem(import.meta.env.VITE_TOKEN_STORAGE_KEY ?? 'tibadesk.dental.token');
          setTimeout(() => {
            window.location.href = `${import.meta.env.VITE_APP_MOUNT ?? ''}/login`;
          }, 2000);
      } else {
        addToast({ message: formatError(error), severity: "error" });
      }
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Box>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Financial Management Dashboard" />
      {data ? (
        <Grid
          container
          spacing={{ xs: 2, sm: 2, md: 3 }}
          sx={{ mb: 4 }}
        >
          <InfoCard
            title="Total Revenue"
            count={numberFormat(data.summary?.total_revenue || 0)}
            icon={<RevenueIcon />}
            color={purple[400]}
            onClick={() => navigate('/financial-management/reports/cash-collection')}
          />
          <InfoCard
            title="Total Expenses"
            count={numberFormat(data.summary?.total_expenses || 0)}
            icon={<ExpenseIcon />}
            color={pink[400]}
            onClick={() => navigate('/financial-management/expenses')}
          />
          <InfoCard
            title="Net Profit"
            count={numberFormat(data.summary?.net_profit || 0)}
            icon={<ProfitIcon />}
            color={cyan[500]}
            onClick={() => navigate('/financial-management/reports/expenses')}
          />
          <InfoCard
            title="Pending Bills"
            count={numberFormat(data.summary?.pending_bills || 0)}
            icon={<BillsIcon />}
            color={teal[400]}
            onClick={() => navigate('/payment-center/dashboard')}
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
