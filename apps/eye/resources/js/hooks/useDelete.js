import { useState } from "react";

const useDelete = (uri = null) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handleDelete = (newUri) => {
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
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  };

  return { data, loading, error, handleDelete, setData, setError };
};

export default useDelete;
