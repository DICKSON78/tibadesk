import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
  Chip,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  WarningRounded as WarningIcon,
  ErrorRounded as ErrorIcon,
  InfoRounded as InfoIcon,
  RefreshRounded as RefreshIcon,
  InventoryRounded as InventoryIcon,
  MedicationRounded as MedicineIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import { useFetch, useToast } from "../../hooks";
import { formatError } from "../../helpers";

const StockAlerts = () => {
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch stock alerts summary
  const { data: summary, loading: summaryLoading, error: summaryError } = useFetch(
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

  // Fetch out of stock items
  const { data: outOfStockData, loading: outOfStockLoading, error: outOfStockError } = useFetch(
    "api/stock-alerts/out-of-stock",
    {},
    true,
    { data: [], count: 0 }
  );

  // Fetch expired items
  const { data: expiredData, loading: expiredLoading, error: expiredError } = useFetch(
    "api/stock-alerts/expired",
    {},
    true,
    { data: [], count: 0 }
  );

  // Fetch expiring soon items
  const { data: expiringSoonData, loading: expiringSoonLoading, error: expiringSoonError } = useFetch(
    "api/stock-alerts/expiring-soon",
    {},
    true,
    { data: [], count: 0 }
  );

  // Fetch medicine alerts
  const { data: medicineData, loading: medicineLoading, error: medicineError } = useFetch(
    "api/stock-alerts/medicine",
    {},
    true,
    {
      out_of_stock: [],
      expired: [],
      expiring_soon: [],
      summary: {
        out_of_stock_count: 0,
        expired_count: 0,
        expiring_soon_count: 0,
        total_alerts: 0,
      },
    }
  );

  useEffect(() => {
    document.title = `Stock Alerts - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (summaryError) {
      addToast({ message: formatError(summaryError), severity: "error" });
    }
  }, [summaryError]);

  useEffect(() => {
    if (outOfStockError) {
      addToast({ message: formatError(outOfStockError), severity: "error" });
    }
  }, [outOfStockError]);

  useEffect(() => {
    if (expiredError) {
      addToast({ message: formatError(expiredError), severity: "error" });
    }
  }, [expiredError]);

  useEffect(() => {
    if (expiringSoonError) {
      addToast({ message: formatError(expiringSoonError), severity: "error" });
    }
  }, [expiringSoonError]);

  useEffect(() => {
    if (medicineError) {
      addToast({ message: formatError(medicineError), severity: "error" });
    }
  }, [medicineError]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'no-expiry', color: 'default' };
    
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'error' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'out_of_stock', color: 'error' };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'warning', color: 'warning' };
    } else {
      return { status: 'safe', color: 'success' };
    }
  };

  const tabs = [
    { label: "Out of Stock", icon: <ErrorIcon />, count: summary.out_of_stock_count },
    { label: "Expired Items", icon: <WarningIcon />, count: summary.expired_count },
    { label: "Expiring Soon", icon: <InfoIcon />, count: summary.expiring_soon_count },
    { label: "Medicine Alerts", icon: <MedicineIcon />, count: medicineData.summary?.total_alerts || 0 },
  ];

  const renderOutOfStockTable = () => (
    <Table
      loading={outOfStockLoading}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
        },
        {
          field: "name",
          headerName: "Item Name",
          valueGetter: (item) => item.name,
        },
        {
          field: "code",
          headerName: "Code",
          valueGetter: (item) => item.code || 'N/A',
        },
        {
          field: "balance",
          headerName: "Current Stock",
          valueGetter: (item) => {
            const balance = parseFloat(item.balance) || 0;
            // Display 0 instead of negative values to avoid confusion during inspections
            return balance < 0 ? 0 : balance;
          },
        },
        {
          field: "minimum_stock",
          headerName: "Minimum Stock",
          valueGetter: (item) => item.minimum_stock || 0,
        },
        {
          field: "unit_buying_price",
          headerName: "Unit Price",
          valueGetter: (item) => `TZ ${item.unit_buying_price || 0}`,
        },
                 {
           field: "status",
           headerName: "Alert Status",
           renderCell: (item) => {
             const alerts = item.alerts || [];
             return (
               <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                 {alerts.includes('out_of_stock') && (
                   <Chip
                     label="Out of Stock"
                     color="error"
                     size="small"
                     icon={<ErrorIcon />}
                   />
                 )}
                 {alerts.includes('expired') && (
                   <Chip
                     label="Expired"
                     color="error"
                     size="small"
                     icon={<WarningIcon />}
                   />
                 )}
                 {alerts.includes('expiring_soon') && (
                   <Chip
                     label="Expiring Soon"
                     color="warning"
                     size="small"
                     icon={<InfoIcon />}
                   />
                 )}
               </Box>
             );
           },
         },
      ]}
      items={outOfStockData.data}
      itemCount={outOfStockData.count}
    />
  );

  const renderExpiredTable = () => (
    <Table
      loading={expiredLoading}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
        },
        {
          field: "name",
          headerName: "Item Name",
          valueGetter: (item) => item.name,
        },
        {
          field: "code",
          headerName: "Code",
          valueGetter: (item) => item.code || 'N/A',
        },
        {
          field: "balance",
          headerName: "Current Stock",
          valueGetter: (item) => {
            const balance = parseFloat(item.balance) || 0;
            // Display 0 instead of negative values to avoid confusion during inspections
            return balance < 0 ? 0 : balance;
          },
        },
        {
          field: "expiry_date",
          headerName: "Expiry Date",
          valueGetter: (item) => formatDate(item.expiry_date),
        },
        {
          field: "days_expired",
          headerName: "Days Expired",
          valueGetter: (item) => {
            const days = getDaysUntilExpiry(item.expiry_date);
            return days < 0 ? Math.abs(days) : 0;
          },
        },
                 {
           field: "status",
           headerName: "Alert Status",
           renderCell: (item) => {
             const alerts = item.alerts || [];
             return (
               <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                 {alerts.includes('out_of_stock') && (
                   <Chip
                     label="Out of Stock"
                     color="error"
                     size="small"
                     icon={<ErrorIcon />}
                   />
                 )}
                 {alerts.includes('expired') && (
                   <Chip
                     label="Expired"
                     color="error"
                     size="small"
                     icon={<WarningIcon />}
                   />
                 )}
                 {alerts.includes('expiring_soon') && (
                   <Chip
                     label="Expiring Soon"
                     color="warning"
                     size="small"
                     icon={<InfoIcon />}
                   />
                 )}
               </Box>
             );
           },
         },
      ]}
      items={expiredData.data}
      itemCount={expiredData.count}
    />
  );

  const renderExpiringSoonTable = () => (
    <Table
      loading={expiringSoonLoading}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
        },
        {
          field: "name",
          headerName: "Item Name",
          valueGetter: (item) => item.name,
        },
        {
          field: "code",
          headerName: "Code",
          valueGetter: (item) => item.code || 'N/A',
        },
        {
          field: "balance",
          headerName: "Current Stock",
          valueGetter: (item) => item.balance || 0,
        },
        {
          field: "expiry_date",
          headerName: "Expiry Date",
          valueGetter: (item) => formatDate(item.expiry_date),
        },
        {
          field: "days_until_expiry",
          headerName: "Days Until Expiry",
          valueGetter: (item) => {
            const days = getDaysUntilExpiry(item.expiry_date);
            return days > 0 ? days : 0;
          },
        },
                 {
           field: "status",
           headerName: "Alert Status",
           renderCell: (item) => {
             const alerts = item.alerts || [];
             return (
               <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                 {alerts.includes('out_of_stock') && (
                   <Chip
                     label="Out of Stock"
                     color="error"
                     size="small"
                     icon={<ErrorIcon />}
                   />
                 )}
                 {alerts.includes('expired') && (
                   <Chip
                     label="Expired"
                     color="error"
                     size="small"
                     icon={<WarningIcon />}
                   />
                 )}
                 {alerts.includes('expiring_soon') && (
                   <Chip
                     label="Expiring Soon"
                     color="warning"
                     size="small"
                     icon={<InfoIcon />}
                   />
                 )}
               </Box>
             );
           },
         },
      ]}
      items={expiringSoonData.data}
      itemCount={expiringSoonData.count}
    />
  );

  const renderMedicineAlerts = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader
            title="Out of Stock Medicines"
            titleTypographyProps={{ variant: "h6" }}
            action={
              <Chip
                label={medicineData.summary?.out_of_stock_count || 0}
                color="error"
                size="small"
              />
            }
          />
          <CardContent>
            {medicineData.out_of_stock?.length > 0 ? (
              <Box>
                {medicineData.out_of_stock.slice(0, 5).map((item, index) => (
                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Stock: {item.balance} | Min: {item.minimum_stock}
                    </Typography>
                  </Box>
                ))}
                {medicineData.out_of_stock.length > 5 && (
                  <Typography variant="caption" color="textSecondary">
                    +{medicineData.out_of_stock.length - 5} more items
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">No out of stock medicines</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader
            title="Expired Medicines"
            titleTypographyProps={{ variant: "h6" }}
            action={
              <Chip
                label={medicineData.summary?.expired_count || 0}
                color="error"
                size="small"
              />
            }
          />
          <CardContent>
            {medicineData.expired?.length > 0 ? (
              <Box>
                {medicineData.expired.slice(0, 5).map((item, index) => (
                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Expired: {formatDate(item.expiry_date)}
                    </Typography>
                  </Box>
                ))}
                {medicineData.expired.length > 5 && (
                  <Typography variant="caption" color="textSecondary">
                    +{medicineData.expired.length - 5} more items
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">No expired medicines</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader
            title="Expiring Soon Medicines"
            titleTypographyProps={{ variant: "h6" }}
            action={
              <Chip
                label={medicineData.summary?.expiring_soon_count || 0}
                color="warning"
                size="small"
              />
            }
          />
          <CardContent>
            {medicineData.expiring_soon?.length > 0 ? (
              <Box>
                {medicineData.expiring_soon.slice(0, 5).map((item, index) => (
                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Expires: {formatDate(item.expiry_date)} ({getDaysUntilExpiry(item.expiry_date)} days)
                    </Typography>
                  </Box>
                ))}
                {medicineData.expiring_soon.length > 5 && (
                  <Typography variant="caption" color="textSecondary">
                    +{medicineData.expiring_soon.length - 5} more items
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">No medicines expiring soon</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Inventory Management" },
        { title: "Stock Alerts" },
      ]}
    >
      <Card>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5">Stock Alerts</Typography>
              {summary.total_alerts > 0 && (
                <Chip
                  label={summary.total_alerts}
                  color="error"
                  size="small"
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.7875rem',
                    height: '24px'
                  }}
                />
              )}
            </Box>
          }
          action={
            <Tooltip title="Refresh Alerts">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />

                  {/* Summary Alerts */}
          <CardContent>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Alert 
                  severity="error" 
                  icon={<ErrorIcon />}
                  action={
                    <Chip
                      label={summary.out_of_stock_count}
                      color="error"
                      size="small"
                      sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                    />
                  }
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {summary.out_of_stock_count}
                  </Typography>
                  <Typography variant="body2">Out of Stock Items</Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Alert 
                  severity="error" 
                  icon={<WarningIcon />}
                  action={
                    <Chip
                      label={summary.expired_count}
                      color="error"
                      size="small"
                      sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                    />
                  }
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {summary.expired_count}
                  </Typography>
                  <Typography variant="body2">Expired Items</Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Alert 
                  severity="warning" 
                  icon={<InfoIcon />}
                  action={
                    <Chip
                      label={summary.expiring_soon_count}
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                    />
                  }
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {summary.expiring_soon_count}
                  </Typography>
                  <Typography variant="body2">Expiring Soon</Typography>
                </Alert>
              </Grid>
                             <Grid item xs={12} sm={6} md={3}>
                 <Alert 
                   severity="info" 
                   icon={<InventoryIcon />}
                   action={
                     <Chip
                       label={summary.unique_items_with_alerts || summary.total_alerts}
                       color="info"
                       size="small"
                       sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                     />
                   }
                 >
                   <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                     {summary.unique_items_with_alerts || summary.total_alerts}
                   </Typography>
                   <Typography variant="body2">Items with Alerts</Typography>
                 </Alert>
               </Grid>
            </Grid>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                      {tab.icon}
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {tab.label}
                      </Typography>
                      {tab.count > 0 && (
                        <Chip
                          label={tab.count}
                          size="small"
                          color={index === 0 || index === 1 ? "error" : index === 2 ? "warning" : "info"}
                          sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.675rem',
                            minWidth: '24px',
                            height: '20px'
                          }}
                        />
                      )}
                    </Box>
                  }
                  sx={{
                    minHeight: '48px',
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && renderOutOfStockTable()}
            {activeTab === 1 && renderExpiredTable()}
            {activeTab === 2 && renderExpiringSoonTable()}
            {activeTab === 3 && renderMedicineAlerts()}
          </Box>
        </CardContent>
      </Card>
    </Page>
  );
};

export default StockAlerts;
