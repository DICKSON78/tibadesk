import { useState } from "react";

const usePatch = (uri, payload = null) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handlePatch = (
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

    return window.axios
      .patch("/" + uri, payload, {
        timeout: 45000
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);

        if (typeof onSuccess === "function") {
          onSuccess(response);
        }
        return response.data;
      })
      .catch((error) => {
        setLoading(false);
        setError(error);

        // See usePost: keep the returned promise always-resolving to avoid
        // unhandled rejections across the app (callers use `error` state or an
        // optional onError callback).
        if (typeof onError === "function") {
          onError(error);
        }
        return undefined;
      });
  };

  return { data, loading, error, handlePatch, setData, setError };
};

export default usePatch;
