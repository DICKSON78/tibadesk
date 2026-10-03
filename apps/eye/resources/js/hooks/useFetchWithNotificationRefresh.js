import { useState, useEffect, useCallback } from "react";
import useNotificationRefresh from "./useNotificationRefresh";

const useFetchWithNotificationRefresh = (
  uri,
  params = null,
  fetchOnMount = true,
  defaultValue = null,
  transform = null
) => {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const refreshNotifications = useNotificationRefresh();

  const handleFetch = useCallback((newParams = null) => {
    const fetchParams = newParams || params;
    
    setLoading(true);
    setError(null);

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 25000); // 25 second timeout
    });

    // Normalize URI to avoid double slashes and protocol-relative URLs
    const normalizedUri = String(uri || "").replace(/^\/+/, "");

    // Race between the actual request and timeout
    Promise.race([
      window.axios.get("/" + normalizedUri, { params: fetchParams }),
      timeoutPromise
    ])
      .then((response) => {
        const result = transform ? transform(response) : response.data;
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
        console.error('API Error:', error.message);
      });
  }, [uri, params, transform]);

  useEffect(() => {
    if (fetchOnMount) {
      handleFetch();
    }
  }, [fetchOnMount, handleFetch]);

  // Enhanced handleFetch that also refreshes notifications
  const handleFetchWithRefresh = useCallback((newParams = null) => {
    handleFetch(newParams);
    refreshNotifications();
  }, [handleFetch, refreshNotifications]);

  return { 
    data, 
    loading, 
    error, 
    handleFetch, 
    handleFetchWithRefresh,
    setData, 
    setError 
  };
};

export default useFetchWithNotificationRefresh;
