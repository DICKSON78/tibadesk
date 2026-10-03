import { useState, useEffect, useRef } from 'react';
import notificationEvents from '../utils/notificationEvents';

export const useDynamicNotifications = (viewPeriod = 'daily', selectedDate = null) => {
  // Stable default values to prevent flickering
  const defaultNotifications = {
    waiting_patients: 0,
    vip_patients: 0,
    patients_to_return: 0,
    spectacle_patients: 0,
    completed_patients: 0,
    procedure_requests: 0,
    other_dispensing_requests: 0,
    patients_sent_to_cashier: 0,
    credit_patients_approval: 0,
    patients_sent_to_doctor: 0,
    patients_sent_to_optician: 0,
    glass_dispensing_requests: 0,
    dispensing_requests: 0,
  };

  const [notifications, setNotifications] = useState(defaultNotifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchNotifications = async () => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Try regular notifications API first (more stable)
      const response = await window.axios.get('/api/notifications');
      
      if (response.data && response.data.data) {
        // Merge with defaults to ensure all keys exist
        const newNotifications = { ...defaultNotifications, ...response.data.data };
        setNotifications(newNotifications);
        hasFetchedRef.current = true;
      }
    } catch (err) {
      console.error('useDynamicNotifications - API failed, using defaults:', err);
      setError(err);
      // Keep default values on error to prevent flickering
      setNotifications(defaultNotifications);
      hasFetchedRef.current = true;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Fetch when parameters change
  useEffect(() => {
    // Reset fetch state when parameters change
    hasFetchedRef.current = false;
    isFetchingRef.current = false;
    fetchNotifications();
  }, [viewPeriod, selectedDate]); // React to parameter changes

  // Listen to targeted notification refresh events
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      // Reset fetch state and fetch new notifications
      hasFetchedRef.current = false;
      isFetchingRef.current = false;
      fetchNotifications();
    });

    return unsubscribe;
  }, []); // Only set up listener once

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
  };
};
