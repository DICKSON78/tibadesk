import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import notificationEvents from '../utils/notificationEvents';
import { useNotificationRefresh } from '../hooks/useNotificationRefresh';
import { getToken } from '../lib/session';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    patients_sent_to_cashier: 0,
    credit_patients_approval: 0,
    patients_sent_to_doctor: 0,
    dispensing_requests: 0,
    procedure_requests: 0,
    other_dispensing_requests: 0,
    patients_to_return: 0,
    vip_patients: 0,
    waiting_patients: 0,
    patients_sent_to_lab: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentParams, setCurrentParams] = useState({});
  // Keep previous snapshot to avoid abrupt zeroing
  const [previousNotifications, setPreviousNotifications] = useState(null);
  // Stabilization window per key to prevent flicker right after actions
  const [stabilizeUntil, setStabilizeUntil] = useState({}); // { key: timestampMs }
  // Require two consecutive zeros before clearing a badge
  const [zeroStreak, setZeroStreak] = useState({}); // { key: count }
  // Prevent server from overwriting page-driven updates for a short time
  const [stickyUntil, setStickyUntil] = useState({}); // { key: timestampMs }
  // Hard locks per key while on a page
  const [lockedKeys, setLockedKeys] = useState({}); // { key: true }

  // Use notification refresh hook
  useNotificationRefresh(() => {
    console.log('Notification refresh triggered from context');
    fetchNotifications(currentParams);
  });

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      console.log('NotificationContext: Starting to fetch notifications...');
      setLoading(true);
      setCurrentParams(params);
      
      // Use the globally configured axios instance (with auth/interceptors)
      console.log('NotificationContext: Making API call to /api/notifications');
      const response = await window.axios.get('/api/notifications');
      console.log('NotificationContext: API response received:', response);
      
      if (response.data && response.data.data) {
        const serverData = response.data.data;
        console.log('Fetched notifications:', serverData);
        
        // Set notifications with stabilization to prevent flickering
        setNotifications(prev => {
          // Only update if the data has actually changed
          const hasChanged = !prev || Object.keys(serverData).some(key => 
            prev[key] !== serverData[key]
          );
          
          if (hasChanged) {
            console.log('Notifications updated:', { prev, serverData });
            setPreviousNotifications(prev);
            // If certain keys are locked, preserve current values for those keys
            const merged = { ...serverData };
            Object.keys(lockedKeys || {}).forEach((key) => {
              if (lockedKeys[key] && prev && typeof prev[key] !== 'undefined') {
                merged[key] = prev[key];
              }
            });
            return merged;
          }
          return prev;
        });
        
        return serverData;
      }
    } catch (error) {
      console.error('NotificationContext: Failed to fetch notifications:', error);
      console.error('NotificationContext: Error details:', error.response?.data || error.message);
      // Set default values on error to prevent undefined state
      setNotifications({
        patients_sent_to_cashier: 0,
        credit_patients_approval: 0,
        patients_sent_to_doctor: 0,
        dispensing_requests: 0,
        procedure_requests: 0,
        other_dispensing_requests: 0,
        patients_to_return: 0,
        vip_patients: 0,
        waiting_patients: 0,
        patients_sent_to_lab: 0,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [lockedKeys]);

  const refreshNotifications = useCallback(() => {
    // Defer by one tick to allow pages to lock keys first
    return new Promise((resolve) => {
      setTimeout(() => resolve(fetchNotifications(currentParams)), 0);
    });
  }, [fetchNotifications, currentParams]);

  // One-time initial fetch for basic notifications
  useEffect(() => {
    // Check if user is authenticated before fetching notifications
    const token = getToken();
    if (token) {
      console.log('NotificationContext: User authenticated, fetching notifications...');
      fetchNotifications({});
    } else {
      console.log('NotificationContext: User not authenticated, skipping notification fetch');
    }
    // Expose events globally so layouts can trigger refresh on auth ready
    window.notificationEvents = notificationEvents;
  }, []); // Only run once on mount

  // Periodic polling every 15 seconds to keep notifications fresh
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const pollInterval = setInterval(() => {
      fetchNotifications(currentParams);
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [fetchNotifications, currentParams]);

  // Listen to notification refresh events with debouncing to prevent flickering
  useEffect(() => {
    let timeoutId;
    
    const unsubscribe = notificationEvents.subscribe(() => {
      // Debounce refresh calls to prevent rapid updates
      clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
        refreshNotifications();
      }, 200);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [refreshNotifications]);

  // Listen for authentication changes and fetch notifications when user logs in
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && e.newValue) {
        console.log('NotificationContext: Token detected, fetching notifications...');
        fetchNotifications({});
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for token changes within the same tab
    const checkToken = () => {
      const token = getToken();
      if (token && !notifications || Object.values(notifications).every(v => v === 0)) {
        console.log('NotificationContext: Token found, fetching notifications...');
        fetchNotifications({});
      }
    };

    // Check every 2 seconds for token changes
    const interval = setInterval(checkToken, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [fetchNotifications, notifications]);

  const setNotificationField = useCallback((key, value, ttlMs = 0) => {
    // Only update if the value has actually changed to prevent flickering
    setNotifications((prev) => {
      if (prev && prev[key] === value) {
        return prev;
      }
      return { ...(prev || {}), [key]: value };
    });
  }, []);

  // Expose lock/unlock functions for pages
  const lockNotificationKey = useCallback((key) => {
    setLockedKeys((prev) => ({ ...prev, [key]: true }));
  }, []);

  const unlockNotificationKey = useCallback((key) => {
    setLockedKeys((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const value = {
    notifications,
    loading,
    fetchNotifications,
    refreshNotifications,
    setNotificationField,
    lockNotificationKey,
    unlockNotificationKey
  };

  // Expose refresh function globally for debugging
  useEffect(() => {
    window.refreshNotifications = refreshNotifications;
    window.debugNotifications = () => {
      console.log('Current notifications:', notifications);
      console.log('Loading:', loading);
      return { notifications, loading };
    };
  }, [refreshNotifications, notifications, loading]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};