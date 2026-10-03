import { useState } from "react";

const useDelete = (uri = null) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handleDelete = (newUri, onSuccess = null, onError = null) => {
    if (typeof newUri === "string") {
      uri = newUri;
    }

    setData(null);
    setLoading(true);
    setError(null);

    window.axios
      .delete("/" + uri)
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

        if (typeof onError === "function") {
          onError(error);
        }
      });
  };

  return { data, loading, error, handleDelete, setData, setError };
};

export default useDelete;
