import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, LinearProgress, Paper, Typography,
} from "../../components/ui/index.jsx";
import { Header as PageHeader } from "../../components/Page";
import DatePicker from "../../components/DatePicker";
import Table from "../../components/Table";
import InfoCard from "../dashboard/InfoCard";
import { useToast } from "../../hooks";
import { numberFormat } from "../../helpers";

const CancerReport = () => {
  const addToast = useToast();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const formatDateParam = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date.split("T")[0];
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstOfMonth);
    setEndDate(today);
  }, []);

  const handleFetch = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/moh/cancer-report?start_date=${formatDateParam(startDate)}&end_date=${formatDateParam(endDate)}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) {
      addToast("Failed to load report", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { handleFetch(); }, [handleFetch]);

  return (
    <Card>
      <PageHeader title="HMIS 003 — Cancer Report (Tanzania MoH)" />
      <Divider />
      <CardContent>
        <Grid container spacing={2} mb={2}>
          <Grid item md={3} sm={6} xs={12}>
            <DatePicker label="Start Date" fullWidth value={startDate} onChange={setStartDate} />
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            <DatePicker label="End Date" fullWidth value={endDate} onChange={setEndDate} />
          </Grid>
          <Grid item md={2} sm={12} xs={12}>
            <Button variant="contained" onClick={handleFetch} disabled={loading} sx={{ mt: 1 }}>
              {loading ? "Loading..." : "Load Report"}
            </Button>
          </Grid>
        </Grid>

        {loading && <LinearProgress />}

        {data && (
          <>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6} md={3}>
                <InfoCard icon={null} title="Total Cancer Cases" value={numberFormat(data.total_cases)} />
              </Grid>
            </Grid>

            {data.by_cancer_type?.length > 0 && (
              <Box mb={3}>
                <Typography variant="h6" mb={1}>Cases by Cancer Type</Typography>
                <Table
                  columns={[
                    { field: "type", headerName: "Cancer Type", width: 250 },
                    { field: "count", headerName: "Number of Cases", width: 150,
                      valueGetter: (row) => numberFormat(row.count) },
                  ]}
                  items={data.by_cancer_type}
                  hidePaginationFooter
                />
              </Box>
            )}

            {data.by_age_group && (
              <Box mb={3}>
                <Typography variant="h6" mb={1}>Cases by Age Group</Typography>
                <Table
                  columns={[
                    { field: "group", headerName: "Age Group", width: 150,
                      valueGetter: (_row, index) => Object.keys(data.by_age_group)[index] },
                    { field: "count", headerName: "Number of Cases", width: 150,
                      valueGetter: (_row, index) => numberFormat(Object.values(data.by_age_group)[index]) },
                  ]}
                  items={Object.keys(data.by_age_group)}
                  hidePaginationFooter
                />
              </Box>
            )}
          </>
        )}

        {!data && !loading && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            Select date range and click "Load Report"
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default CancerReport;
