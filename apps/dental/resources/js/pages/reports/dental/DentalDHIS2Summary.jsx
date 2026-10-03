import React, { useState, useEffect, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Box, Button, Card, CardContent, Divider, Grid, LinearProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from "../../../components/ui/index.jsx";
import { Header as PageHeader } from "../../../components/Page";
import DatePicker from "../../../components/DatePicker";
import { useToast } from "../../../hooks";
import { numberFormat } from "../../../helpers";

const DentalDHIS2Summary = () => {
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
      const res = await fetch(`/api/reports/dental/dhis2-summary?start_date=${formatDateParam(startDate)}&end_date=${formatDateParam(endDate)}`);
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
      <PageHeader title="DHIS2 Dental Summary (HMIS Form 3 — Dental)" />
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

        {data?.data_elements && (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data Element</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(data.data_elements).map(([key, val]) => (
                  <TableRow key={key}>
                    <TableCell>{key.replace(/_/g, " ")}</TableCell>
                    <TableCell align="right">{numberFormat(val)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {data?.procedures && (
          <Box mt={3}>
            <Typography variant="h6" mb={1}>Procedures Performed</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Procedure</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(data.procedures).map(([key, val]) => (
                    <TableRow key={key}>
                      <TableCell>{key.replace(/_/g, " ")}</TableCell>
                      <TableCell align="right">{numberFormat(val)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
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

export default DentalDHIS2Summary;
