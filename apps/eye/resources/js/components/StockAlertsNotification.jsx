import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  Grid,
  IconButton,
  Typography,
  Chip,
  Alert,
  Button,
} from "@mui/material";
import {
  WarningRounded as WarningIcon,
  ErrorRounded as ErrorIcon,
  InfoRounded as InfoIcon,
  CloseRounded as CloseIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  ExpandLessRounded as ExpandLessIcon,
  InventoryRounded as InventoryIcon,
  MedicationRounded as MedicineIcon,
} from "@mui/icons-material";

import { useFetch } from "../hooks";

const StockAlertsNotification = ({ onNavigateToAlerts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch stock alerts summary
  const { data: summary, loading } = useFetch(
    "api/stock-alerts/summary",
    {},
    true,
    {
      out_of_stock_count: 0,
      expired_count: 0,
      expiring_soon_count: 0,
      total_alerts: 0,
    }
  );

  // Only show if there are alerts
  const hasAlerts = summary.total_alerts > 0;

  if (!hasAlerts || !isVisible) {
    return null;
  }

  const getSeverity = () => {
    if (summary.expired_count > 0 || summary.out_of_stock_count > 0) {
      return "error";
    } else if (summary.expiring_soon_count > 0) {
      return "warning";
    }
    return "info";
  };

  const getIcon = () => {
    if (summary.expired_count > 0 || summary.out_of_stock_count > 0) {
      return <ErrorIcon />;
    } else if (summary.expiring_soon_count > 0) {
      return <WarningIcon />;
    }
    return <InfoIcon />;
  };

  const getTitle = () => {
    if (summary.expired_count > 0) {
      return `⚠️ ${summary.expired_count} items have expired!`;
    } else if (summary.out_of_stock_count > 0) {
      return `🚨 ${summary.out_of_stock_count} items are out of stock!`;
    } else if (summary.expiring_soon_count > 0) {
      return `⚠️ ${summary.expiring_soon_count} items expiring soon`;
    }
    return "Stock Alerts";
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: `2px solid ${getSeverity() === 'error' ? 'error.main' : 'warning.main'}`,
        bgcolor: getSeverity() === 'error' ? 'error.light' : 'warning.light',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getIcon()}
            <Typography variant="h6" fontWeight="bold">
              {getTitle()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={summary.total_alerts}
              color={getSeverity()}
              size="small"
            />
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setIsVisible(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={isExpanded}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {summary.out_of_stock_count > 0 && (
                <Grid item xs={12} sm={4}>
                  <Alert severity="error" icon={<ErrorIcon />}>
                    <Typography variant="h6">{summary.out_of_stock_count}</Typography>
                    <Typography variant="body2">Out of Stock Items</Typography>
                  </Alert>
                </Grid>
              )}
              {summary.expired_count > 0 && (
                <Grid item xs={12} sm={4}>
                  <Alert severity="error" icon={<WarningIcon />}>
                    <Typography variant="h6">{summary.expired_count}</Typography>
                    <Typography variant="body2">Expired Items</Typography>
                  </Alert>
                </Grid>
              )}
              {summary.expiring_soon_count > 0 && (
                <Grid item xs={12} sm={4}>
                  <Alert severity="warning" icon={<InfoIcon />}>
                    <Typography variant="h6">{summary.expiring_soon_count}</Typography>
                    <Typography variant="body2">Expiring Soon</Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color={getSeverity()}
                startIcon={<InventoryIcon />}
                onClick={() => onNavigateToAlerts && onNavigateToAlerts('/inventory-management/stock-alerts')}
              >
                View All Alerts
              </Button>
              <Button
                variant="outlined"
                startIcon={<MedicineIcon />}
                onClick={() => onNavigateToAlerts && onNavigateToAlerts('/medicine-center/medicine-alerts')}
              >
                Medicine Alerts
              </Button>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default StockAlertsNotification;
