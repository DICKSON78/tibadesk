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
  PersonAddRounded as LeadIcon,
  TrendingUpRounded as GrowthIcon,
  SourceRounded as SourceIcon,
  AssessmentRounded as QualityIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const LeadGeneration = () => {
  const addToast = useToast();

  const { data, loading, error } = useFetch(
    "api/marketing/lead-generation",
    {},
    true,
    {
      summary: {
        total_leads: 0,
        new_leads: 0,
        qualified_leads: 0,
        conversion_rate: 0,
        average_lead_quality: 0,
      },
      leads_by_source: [],
      leads_by_status: [],
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Lead Generation - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Lead Generation">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Lead Generation"
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Reports" },
        { title: "Lead Generation" },
      ]}
    >
      <CardHeader
        title="Lead Generation Report"
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
                  <LeadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {numberFormat(data.summary.total_leads || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Leads
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <GrowthIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {numberFormat(data.summary.new_leads || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Leads
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <QualityIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {numberFormat(data.summary.qualified_leads || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qualified Leads
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <SourceIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {((data.summary.conversion_rate || 0) * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Lead Sources */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Leads by Source" />
                <CardContent>
                  {data.leads_by_source && data.leads_by_source.length > 0 ? (
                    <Box>
                      {data.leads_by_source.map((source, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {source.source || `Source ${index + 1}`}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {numberFormat(source.count || 0)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {((source.percentage || 0) * 100).toFixed(1)}% of total leads
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No lead source data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Leads by Status" />
                <CardContent>
                  {data.leads_by_status && data.leads_by_status.length > 0 ? (
                    <Box>
                      {data.leads_by_status.map((status, index) => (
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
                            {((status.percentage || 0) * 100).toFixed(1)}% of total leads
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No lead status data available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </React.Fragment>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6">No data available.</Typography>
        </Box>
      )}
    </Page>
  );
};

export default LeadGeneration;
