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
  TrendingUpRounded as CampaignIcon,
  VisibilityRounded as ViewsIcon,
  MouseRounded as ClicksIcon,
  PersonAddRounded as ConversionsIcon,
} from "@mui/icons-material";

import Page from "../../../components/Page";
import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const CampaignPerformance = () => {
  const addToast = useToast();

  const { data, loading, error } = useFetch(
    "api/marketing/campaign-performance",
    {},
    true,
    {
      summary: {
        total_campaigns: 0,
        active_campaigns: 0,
        total_views: 0,
        total_clicks: 0,
        total_conversions: 0,
        average_ctr: 0,
      },
      campaigns: [],
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Campaign Performance - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  if (loading) {
    return (
      <Page title="Campaign Performance">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      </Page>
    );
  }

  return (
    <Page
      title="Campaign Performance"
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "Reports" },
        { title: "Campaign Performance" },
      ]}
    >
      <CardHeader
        title="Campaign Performance Report"
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
                  <CampaignIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {numberFormat(data.summary.total_campaigns || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Campaigns
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <ViewsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {numberFormat(data.summary.total_views || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Views
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <ClicksIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {numberFormat(data.summary.total_clicks || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clicks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <ConversionsIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {numberFormat(data.summary.total_conversions || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Conversions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Campaign Details */}
          <Card>
            <CardHeader title="Campaign Details" />
            <CardContent>
              {data.campaigns && data.campaigns.length > 0 ? (
                <Grid container spacing={2}>
                  {data.campaigns.map((campaign, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {campaign.name || `Campaign ${index + 1}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {campaign.description || "No description available"}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              Views: {numberFormat(campaign.views || 0)}
                            </Typography>
                            <Typography variant="body2">
                              Clicks: {numberFormat(campaign.clicks || 0)}
                            </Typography>
                            <Typography variant="body2">
                              CTR: {((campaign.ctr || 0) * 100).toFixed(2)}%
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No campaign data available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Campaign performance data will appear here when available
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

export default CampaignPerformance;
