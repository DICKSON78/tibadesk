import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Button, Card, CardContent, Divider, Grid, LinearProgress, Typography,
} from "../../components/ui/index.jsx";
import { Header as PageHeader } from "../../components/Page";
import DatePicker from "../../components/DatePicker";
import InfoCard from "../dashboard/InfoCard";
import { useToast } from "../../hooks";
import { numberFormat } from "../../helpers";

const BirthDeathNotification = () => {
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
      const res = await fetch(`/api/reports/moh/birth-death-notification?start_date=${formatDateParam(startDate)}&end_date=${formatDateParam(endDate)}`);
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
      <PageHeader title="Birth & Death Notification (RITA/MoT Format)" />
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
                <InfoCard icon={null} title="New Registrations" value={numberFormat(data.new_patient_registrations)} />
              </Grid>
            </Grid>

            {data.by_gender && Object.keys(data.by_gender).length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" mb={1}>By Gender</Typography>
                <Grid container spacing={2}>
                  {Object.entries(data.by_gender).map(([gender, count]) => (
                    <Grid item xs={6} md={2} key={gender}>
                      <InfoCard icon={null} title={gender || "Unknown"} value={numberFormat(count)} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {data.note && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                {data.note}
              </Typography>
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

export default BirthDeathNotification;
