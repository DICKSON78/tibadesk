import { useState } from "react";
import useNotificationRefresh from "./useNotificationRefresh";

const usePostWithNotificationRefresh = (uri, payload = null) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const refreshNotifications = useNotificationRefresh();

  const handlePost = (newUri, newPayload = null) => {
    if (typeof newUri === "string") {
      uri = newUri;
    }

    if (newPayload) {
      payload = newPayload;
    }

    setData(null);
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
      window.axios.post("/" + normalizedUri, payload),
      timeoutPromise
    ])
      .then((response) => {
        setData(response.data);
        setLoading(false);
        
        // Refresh notifications after successful API call
        refreshNotifications();
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
        console.error('API Error:', error.message);
      });
  };

  return { data, loading, error, handlePost, setData, setError };
};

export default usePostWithNotificationRefresh;
