import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Stack,
  Typography,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import {
  WarningRounded as WarningIcon,
  ErrorRounded as ErrorIcon,
  InfoRounded as InfoIcon,
  RefreshRounded as RefreshIcon,
  MedicationRounded as MedicineIcon,
  AddRounded as AddIcon,
} from "@mui/icons-material";
import {
  blue,
  cyan,
  green,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from "@mui/material/colors";
import { alpha, useTheme } from "@mui/material/styles";

import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import { useFetch, useToast } from "../../hooks";
import { formatError } from "../../helpers";

const MedicineAlerts = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const theme = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);

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
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Medicine Alerts - ${window.APP_NAME}`;
  }, []);

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

  const renderOutOfStockTable = () => (
    <Table
      loading={medicineLoading}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
        },
        {
          field: "name",
          headerName: "Medicine Name",
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
          valueGetter: (item) => `Tz${item.unit_buying_price || 0}`,
        },
        {
          field: "status",
          headerName: "Status",
          renderCell: (item) => (
            <Chip
              label="Out of Stock"
              color="error"
              size="small"
              icon={<ErrorIcon />}
            />
          ),
        },
      ]}
      items={medicineData?.out_of_stock || []}
      itemCount={medicineData?.out_of_stock?.length || 0}
    />
  );

  const renderExpiredTable = () => (
    <Table
      loading={medicineLoading}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
        },
        {
          field: "name",
          headerName: "Medicine Name",
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
          headerName: "Status",
          renderCell: (item) => (
            <Chip
              label="Expired"
              color="error"
              size="small"
              icon={<WarningIcon />}
            />
          ),
        },
      ]}
      items={medicineData?.expired || []}
      itemCount={medicineData?.expired?.length || 0}
    />
  );

  const renderExpiringSoonTable = () => (
    <Table
      loading={medicineLoading}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
        },
        {
          field: "name",
          headerName: "Medicine Name",
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
          headerName: "Status",
          renderCell: (item) => {
            const status = getExpiryStatus(item.expiry_date);
            return (
              <Chip
                label={status.status === 'out_of_stock' ? 'Out of stock' : 'Warning'}
                color={status.color}
                size="small"
                icon={<InfoIcon />}
              />
            );
          },
        },
      ]}
      items={medicineData?.expiring_soon || []}
      itemCount={medicineData?.expiring_soon?.length || 0}
    />
  );

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicine Alerts" },
      ]}
    >
      <Card>
        <PageHeader
          title="Medicine Alerts"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Alerts">
                <IconButton onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/medicine-center/add-medicine')}
              >
                Add Medicine
              </Button>
            </Box>
          }
        />
        <Divider />

        {/* Summary Alerts - Using main dashboard styling */}
        <CardContent>
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
            sx={{ mb: 4 }}
          >
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(red[400], 0.25)}`,
                  },
                  background: `linear-gradient(to bottom right, ${alpha(red[400], 0.8)}, ${alpha(red[400], 0.18)})`,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  flexWrap="wrap"
                  spacing={2}
                >
                  <Box flexGrow={1}>
                    <Typography variant="body2" color="text.secondary">Out of Stock</Typography>
                    <Typography
                      variant="body1"
                      fontWeight="600"
                      mt="4px"
                    >
                      {medicineData.summary?.out_of_stock_count || 0}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: red[400],
                      boxShadow: `0 7px 30px ${alpha(red[400], 0.15)}`,
                      width: 40,
                      height: 40,
                      position: "relative",
                      "&::before": {
                        content: `""`,
                        position: "absolute",
                        width: "7px",
                        height: "38px",
                        borderBottomRightRadius: "11px",
                        borderTopRightRadius: "6px",
                        top: "10%",
                        right: "30%",
                        backgroundColor: "rgba(255, 255, 255, 0.135)",
                        transform: "rotate(35deg)",
                      },
                      "&::after": {
                        content: `""`,
                        position: "absolute",
                        width: "6px",
                        height: "40px",
                        borderTopLeftRadius: "5px",
                        borderBottomLeftRadius: "3px",
                        top: "-4%",
                        right: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.135)",
                        transform: "rotate(35deg)",
                      },
                    }}
                  >
                    <ErrorIcon />
                  </Avatar>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(orange[300], 0.25)}`,
                  },
                  background: `linear-gradient(to bottom right, ${alpha(orange[300], 0.8)}, ${alpha(orange[300], 0.18)})`,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  flexWrap="wrap"
                  spacing={2}
                >
                  <Box flexGrow={1}>
                    <Typography variant="body2" color="text.secondary">Expired</Typography>
                    <Typography
                      variant="body1"
                      fontWeight="600"
                      mt="4px"
                    >
                      {medicineData.summary?.expired_count || 0}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: orange[300],
                      boxShadow: `0 7px 30px ${alpha(orange[300], 0.15)}`,
                      width: 40,
                      height: 40,
                      position: "relative",
                      "&::before": {
                        content: `""`,
                        position: "absolute",
                        width: "7px",
                        height: "38px",
                        borderBottomRightRadius: "11px",
                        borderTopRightRadius: "6px",
                        top: "10%",
                        right: "30%",
                        backgroundColor: "rgba(255, 255, 255, 0.135)",
                        transform: "rotate(35deg)",
                      },
                      "&::after": {
                        content: `""`,
                        position: "absolute",
                        width: "6px",
                        height: "40px",
                        borderTopLeftRadius: "5px",
                        borderBottomLeftRadius: "3px",
                        top: "-4%",
                        right: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.135)",
                        transform: "rotate(35deg)",
                      },
                    }}
                  >
                    <WarningIcon />
                  </Avatar>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(yellow[600], 0.25)}`,
                  },
                  background: `linear-gradient(to bottom right, ${alpha(yellow[600], 0.8)}, ${alpha(yellow[600], 0.18)})`,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  flexWrap="wrap"
                  spacing={2}
                >
                  <Box flexGrow={1}>
                    <Typography variant="body2" color="text.secondary">Expiring Soon</Typography>
                    <Typography
                      variant="body1"
                      fontWeight="600"
                      mt="4px"
                    >
                      {medicineData.summary?.expiring_soon_count || 0}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: yellow[600],
                      boxShadow: `0 7px 30px ${alpha(yellow[600], 0.15)}`,
                      width: 40,
                      height: 40,
                      position: "relative",
                      "&::before": {
                        content: `""`,
                        position: "absolute",
                        width: "7px",
                        height: "38px",
                        borderBottomRightRadius: "11px",
                        borderTopRightRadius: "6px",
                        top: "10%",
                        right: "30%",
                        backgroundColor: "rgba(255, 255, 255, 0.135)",
                        transform: "rotate(35deg)",
                      },
                      "&::after": {
                        content: `""`,
                        position: "absolute",
                        width: "6px",
                        height: "40px",
                        borderTopLeftRadius: "5px",
                        borderBottomLeftRadius: "3px",
                        top: "-4%",
                        right: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.135)",
                        transform: "rotate(35deg)",
                      },
                    }}
                  >
                    <InfoIcon />
                  </Avatar>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(teal[400], 0.25)}`,
                  },
                  background: `linear-gradient(to bottom right, ${alpha(teal[400], 0.8)}, ${alpha(teal[400], 0.18)})`,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  flexWrap="wrap"
                  spacing={2}
                >
                  <Box flexGrow={1}>
                    <Typography variant="body2" color="text.secondary">Total Alerts</Typography>
                    <Typography
                      variant="body1"
                      fontWeight="600"
                      mt="4px"
                    >
                      {medicineData.summary?.total_alerts || 0}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: teal[400],
                      boxShadow: `0 7px 30px ${alpha(teal[400], 0.15)}`,
                      width: 40,
                      height: 40,
                      position: "relative",
                      "&::before": {
                        content: `""`,
                        position: "absolute",
                        width: "7px",
                        height: "38px",
                        borderBottomRightRadius: "11px",
                        borderTopRightRadius: "6px",
                        top: "10%",
                        right: "30%",
                        backgroundColor: "rgba(255, 255, 255, 0.135)",
                        transform: "rotate(35deg)",
                      },
                      "&::after": {
                        content: `""`,
                        position: "absolute",
                        width: "6px",
                        height: "40px",
                        borderTopLeftRadius: "5px",
                        borderBottomLeftRadius: "3px",
                        top: "-4%",
                        right: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.135)",
                        transform: "rotate(35deg)",
                      },
                    }}
                  >
                    <MedicineIcon />
                  </Avatar>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* Alert Cards - Compact layout like main dashboard */}
          <Grid
            container
            spacing={{ xs: 2, sm: 2, md: 3 }}
          >
            {/* Out of Stock Medicines */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Out of Stock Medicines"
                  titleTypographyProps={{ variant: "h6" }}
                  action={
                    <Chip
                      label={medicineData.summary?.out_of_stock_count || 0}
                      sx={{ bgcolor: red[400], color: 'white' }}
                      size="small"
                    />
                  }
                />
                <CardContent sx={{ p: 2 }}>
                  {medicineData?.out_of_stock?.length > 0 ? (
                    <Box>
                      {medicineData.out_of_stock.slice(0, 6).map((item, index) => (
                        <Box key={index} sx={{ 
                          mb: 1, 
                          p: 1.5, 
                          bgcolor: red[50], 
                          borderRadius: 1,
                          border: `1px solid ${red[200]}`,
                          '&:hover': { bgcolor: red[100] }
                        }}>
                          <Typography variant="body2" fontWeight="bold" color={red[700]} sx={{ fontSize: '0.7875rem' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.675rem' }}>
                            Stock: {item.balance} | Min: {item.minimum_stock} | Price: Tz{item.unit_buying_price || 0}
                          </Typography>
                        </Box>
                      ))}
                      {medicineData.out_of_stock.length > 6 && (
                        <Typography variant="caption" color="textSecondary">
                          +{medicineData.out_of_stock.length - 6} more medicines
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">No out of stock medicines</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Expired Medicines */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader
                  title="Expired Medicines"
                  titleTypographyProps={{ variant: "h6" }}
                  action={
                    <Chip
                      label={medicineData.summary?.expired_count || 0}
                      sx={{ bgcolor: orange[300], color: 'white' }}
                      size="small"
                    />
                  }
                />
                <CardContent sx={{ p: 2 }}>
                  {medicineData?.expired?.length > 0 ? (
                    <Box>
                      {medicineData.expired.slice(0, 6).map((item, index) => (
                        <Box key={index} sx={{ 
                          mb: 1, 
                          p: 1.5, 
                          bgcolor: orange[50], 
                          borderRadius: 1,
                          border: `1px solid ${orange[200]}`,
                          '&:hover': { bgcolor: orange[100] }
                        }}>
                          <Typography variant="body2" fontWeight="bold" color={orange[600]} sx={{ fontSize: '0.7875rem' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.675rem' }}>
                            Expired: {formatDate(item.expiry_date)} | Stock: {item.balance}
                          </Typography>
                        </Box>
                      ))}
                      {medicineData.expired.length > 6 && (
                        <Typography variant="caption" color="textSecondary">
                          +{medicineData.expired.length - 6} more medicines
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">No expired medicines</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Expiring Soon Medicines - Compact grid */}
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Expiring Soon Medicines (Next 30 Days)"
                  titleTypographyProps={{ variant: "h6" }}
                  action={
                    <Chip
                      label={medicineData.summary?.expiring_soon_count || 0}
                      sx={{ bgcolor: yellow[600], color: 'white' }}
                      size="small"
                    />
                  }
                />
                <CardContent sx={{ p: 2 }}>
                  {medicineData?.expiring_soon?.length > 0 ? (
                    <Grid
                      container
                      spacing={{ xs: 1, sm: 1, md: 2 }}
                    >
                      {medicineData.expiring_soon.map((item, index) => {
                        const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);
                        const status = getExpiryStatus(item.expiry_date);
                        const bgColor = status.color === 'error' ? red[50] : yellow[50];
                        const borderColor = status.color === 'error' ? red[200] : yellow[200];
                        const textColor = status.color === 'error' ? red[700] : yellow[700];
                        
                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Box sx={{ 
                              p: 1.5, 
                              bgcolor: bgColor, 
                              borderRadius: 1,
                              border: `1px solid ${borderColor}`,
                              height: '100%',
                              '&:hover': { 
                                bgcolor: status.color === 'error' ? red[100] : yellow[100],
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.2s ease'
                            }}>
                              <Typography variant="body2" fontWeight="bold" color={textColor} sx={{ fontSize: '0.7875rem' }}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.675rem' }}>
                                Expires: {formatDate(item.expiry_date)} ({daysUntilExpiry} days)
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.675rem' }}>
                                Stock: {item.balance} | Price: Tz{item.unit_buying_price || 0}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="textSecondary">No medicines expiring soon</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Tables */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Detailed Reports</Typography>
            
            {/* Out of Stock Table */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Out of Stock Medicines - Detailed List" />
              <CardContent>
                {renderOutOfStockTable()}
              </CardContent>
            </Card>

            {/* Expired Table */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Expired Medicines - Detailed List" />
              <CardContent>
                {renderExpiredTable()}
              </CardContent>
            </Card>

            {/* Expiring Soon Table */}
            <Card>
              <CardHeader title="Expiring Soon Medicines - Detailed List" />
              <CardContent>
                {renderExpiringSoonTable()}
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>
    </Page>
  );
};

export default MedicineAlerts;
