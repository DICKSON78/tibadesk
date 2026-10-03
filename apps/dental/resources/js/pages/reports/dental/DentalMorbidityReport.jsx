import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, CardContent, Grid, LinearProgress, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "../../../components/ui/index.jsx";
import { Header as PageHeader } from "../../../components/Page";
import DatePicker from "../../../components/DatePicker";
import { useToast } from "../../../hooks";

const ageGroups = ["0-4", "5-14", "15-24", "25-44", "45-64", "65+"];

const DentalMorbidityReport = () => {
  const addToast = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split("T")[0];
    setStartDate(firstOfMonth);
    setEndDate(today);
  }, []);

  const handleFetch = async () => {
    if (!startDate || !endDate) {
      addToast("Select date range", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/dental/morbidity?start_date=${startDate}&end_date=${endDate}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) {
      addToast("Failed to load report", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Dental Morbidity Report (HMIS Form 3)" />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={handleFetch} disabled={loading} fullWidth>
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress />}

      {data && (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Total Consultations</Typography>
                  <Typography variant="h5">{data.total_consultations}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Unique Patients</Typography>
                  <Typography variant="h5">{data.total_patients_consulted}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Treatments</Typography>
                  <Typography variant="h5">{data.total_treatments}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Extractions</Typography>
                  <Typography variant="h5">{data.extractions_performed}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Morbidity by Age Group & Gender</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Age Group</TableCell>
                      <TableCell align="right">Male</TableCell>
                      <TableCell align="right">Female</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ageGroups.map((group) => {
                      const d = data.morbidity_by_age_gender?.[group] || {};
                      return (
                        <TableRow key={group}>
                          <TableCell>{group}</TableCell>
                          <TableCell align="right">{d.male || 0}</TableCell>
                          <TableCell align="right">{d.female || 0}</TableCell>
                          <TableCell align="right"><strong>{d.total || 0}</strong></TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right">
                        <strong>
                          {ageGroups.reduce((s, g) => s + (data.morbidity_by_age_gender?.[g]?.male || 0), 0)}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {ageGroups.reduce((s, g) => s + (data.morbidity_by_age_gender?.[g]?.female || 0), 0)}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{data.total_patients_consulted}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Treatments Performed</Typography>
              {data.treatments_performed?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Treatment Type</TableCell>
                        <TableCell align="right">Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.treatments_performed.map((t, i) => (
                        <TableRow key={i}>
                          <TableCell>{t.treatment_type}</TableCell>
                          <TableCell align="right">{t.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No treatments recorded in this period</Typography>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default DentalMorbidityReport;
