import { useState } from "react";
import notificationEvents from "../utils/notificationEvents";

const usePost = (uri, payload = null) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handlePost = (
    newUri,
    newPayload = null,
    onSuccess = null,
    onError = null
  ) => {
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

    return Promise.race([
      window.axios.post("/" + normalizedUri, payload),
      timeoutPromise
    ])
      .then((response) => {
        setData(response.data);
        setLoading(false);

        // Trigger notification refresh for specific endpoints that affect notification counts
        const notificationEndpoints = [
          'api/patient-payment-cache-items/complete',
          'api/patient-payment-cache-items/dispense',
          'api/patient-payment-cache-items/make-cash-payment',
          'api/patient-payment-cache-items/approve-credit-payment',
          'api/patient-payment-cache-items/create-bill',
          'api/consultations',
          'api/patient-check-ins'
        ];

        if (notificationEndpoints.some(endpoint => uri.includes(endpoint))) {
          // Trigger notification refresh immediately so badges update fast
          notificationEvents.refresh();
        }

        if (typeof onSuccess === "function") {
          onSuccess(response);
        }
        return response.data;
      })
      .catch((error) => {
        setLoading(false);
        setError(error);

        // Keep the returned promise always-resolving: callers across the app use
        // the `error` state (or an optional onError callback), not promise
        // rejection, so re-throwing here caused unhandled rejections on every
        // failed request.
        if (typeof onError === "function") {
          onError(error);
        }
        return undefined;
      });
  };

  return { data, loading, error, handlePost, setData, setError };
};

export default usePost;
