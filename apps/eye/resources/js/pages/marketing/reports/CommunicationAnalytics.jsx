import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  PhoneInTalkRounded as CallIcon,
  EmailRounded as EmailIcon,
  SmsRounded as SmsIcon,
  AssessmentRounded as AnalyticsIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const CommunicationAnalytics = () => {
  const addToast = useToast();

  const { data, loading, error } = useFetch(
    "api/marketing/communication-analytics",
    {},
    true,
    {
      summary: {
        total_communications: 0,
        successful_communications: 0,
        failed_communications: 0,
        response_rate: 0,
        average_response_time: 0,
      },
      communications_by_type: [],
      communications_by_status: [],
      response_times: [],
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Communication Analytics - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Communication Analytics">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Communication Analytics"
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Reports" },
        { title: "Communication Analytics" },
      ]}
    >
      <CardHeader
        title="Communication Analytics Report"
        titleTypographyProps={{
          variant: "h4",
          fontWeight: 700,
        }}
        sx={{
          p: 0,
          mb: 2,
        }}
      />

      {!loading && data ? (
        <React.Fragment>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {numberFormat(data.summary.total_communications || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Communications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <CallIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {numberFormat(data.summary.successful_communications || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Successful
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <EmailIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {((data.summary.response_rate || 0) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Response Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <SmsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {data.summary.average_response_time || 0}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Communication Details */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Communications by Type" />
                <CardContent>
                  {data.communications_by_type && data.communications_by_type.length > 0 ? (
                    <Box>
                      {data.communications_by_type.map((type, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {type.type || `Type ${index + 1}`}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {numberFormat(type.count || 0)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {((type.percentage || 0) * 100).toFixed(1)}% of total communications
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No communication type data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Communications by Status" />
                <CardContent>
                  {data.communications_by_status && data.communications_by_status.length > 0 ? (
                    <Box>
                      {data.communications_by_status.map((status, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {status.status || `Status ${index + 1}`}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {numberFormat(status.count || 0)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {((status.percentage || 0) * 100).toFixed(1)}% of total communications
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No communication status data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Response Times */}
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Response Time Analysis" />
            <CardContent>
              {data.response_times && data.response_times.length > 0 ? (
                <Grid container spacing={2}>
                  {data.response_times.map((time, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {time.period || `Period ${index + 1}`}
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {time.average_time || 0}h
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Average response time
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No response time data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
    </Page>
  );
};

export default CommunicationAnalytics;
