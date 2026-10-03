import { useState } from "react";

const usePatch = (uri, payload = null) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handlePatch = (newUri, newPayload = null) => {
    if (typeof newUri === "string") {
      uri = newUri;
    }

    if (newPayload) {
      payload = newPayload;
    }

    setData(null);
    setLoading(true);
    setError(null);

    // Use axios with its built-in timeout instead of race condition
    window.axios.patch("/" + uri, payload, {
      timeout: 45000 // 45 seconds timeout for complex operations
    })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
        console.error('API Error:', error.message);
      });
  };

  return { data, loading, error, handlePatch, setData, setError };
};

export default usePatch;
