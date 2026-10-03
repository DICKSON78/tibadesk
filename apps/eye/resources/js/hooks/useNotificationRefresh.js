import { useEffect, useRef } from 'react';
import notificationEvents from '../utils/notificationEvents';

export const useNotificationRefresh = (callback) => {
  const callbackRef = useRef(callback);

  // Update the callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleRefresh = () => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    };

    // Subscribe to notification events
    const unsubscribe = notificationEvents.subscribe(handleRefresh);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);
};

export default useNotificationRefresh;