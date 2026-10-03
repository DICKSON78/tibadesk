import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Badge,
  Chip,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  NotificationsRounded as NotificationsIcon,
  PersonAddRounded as PersonAddIcon,
  CheckCircleRounded as CheckCircleIcon,
  DeleteRounded as DeleteIcon,
  MoreVertRounded as MoreVertIcon,
  CloseRounded as CloseIcon,
} from "@mui/icons-material";

import { useFetch, usePost, useToast } from "../hooks";
import { formatError } from "../helpers";

const PatientNotificationsPanel = () => {
  const addToast = useToast();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fetch notifications
  const { data: notifications, loading, error, handleFetch } = useFetch(
    "api/patient-notifications",
    { status: "unread", per_page: 10 },
    true,
    { data: [], total: 0 }
  );

  // Debug: Log notifications structure
  useEffect(() => {
    console.log('Notifications data:', notifications);
    console.log('Notifications.data:', notifications?.data);
    console.log('Is array:', Array.isArray(notifications?.data));
  }, [notifications]);

  // Fetch unread count
  const { data: unreadCount } = useFetch(
    "api/patient-notifications/unread-count",
    {},
    true,
    { count: 0 }
  );

  // Mark as read
  const { handlePost: markAsRead } = usePost(
    `api/patient-notifications/${selectedNotification?.id}/mark-as-read`,
    {},
    false
  );

  // Mark all as read
  const { handlePost: markAllAsRead } = usePost(
    "api/patient-notifications/mark-all-as-read",
    {},
    false
  );

  // Delete notification
  const { handlePost: deleteNotification } = usePost(
    `api/patient-notifications/${selectedNotification?.id}`,
    {},
    false,
    "DELETE"
  );

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsRead();
      addToast({ message: "Notification marked as read", severity: "success" });
      handleFetch(); // Refresh notifications
      handleMenuClose();
    } catch (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      addToast({ message: "All notifications marked as read", severity: "success" });
      handleFetch(); // Refresh notifications
    } catch (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotification();
      addToast({ message: "Notification deleted", severity: "success" });
      handleFetch(); // Refresh notifications
      handleMenuClose();
    } catch (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_registration":
        return <PersonAddIcon color="primary" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "new_registration":
        return "primary";
      default:
        return "default";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (notifications.data.length === 0) {
    return (
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <NotificationsIcon />
              <Typography variant="h6">Patient Notifications</Typography>
            </Box>
          }
        />
        <CardContent>
          <Alert severity="info">No new notifications</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Badge badgeContent={unreadCount.count} color="error">
              <NotificationsIcon />
            </Badge>
            <Typography variant="h6">Patient Notifications</Typography>
          </Box>
        }
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount.count === 0}
            >
              Mark All Read
            </Button>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Loading notifications...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">
              Failed to load notifications
            </Alert>
          </Box>
        ) : !notifications?.data || !Array.isArray(notifications.data) ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No notifications available
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.data.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: "none" },
              }}
              secondaryAction={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    {formatTime(notification.created_at)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, notification)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {notification.title}
                    </Typography>
                    <Chip
                      label={notification.type.replace("_", " ")}
                      size="small"
                      color={getNotificationColor(notification.type)}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {notification.message}
                    </Typography>
                    {notification.data?.patient_name && (
                      <Typography variant="caption" color="primary">
                        Patient: {notification.data.patient_name}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        )}
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleMarkAsRead}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          Mark as Read
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default PatientNotificationsPanel;
