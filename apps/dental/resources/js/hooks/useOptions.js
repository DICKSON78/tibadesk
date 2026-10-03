import { useEffect, useState } from "react";

let optionsCache = null;
let optionsPromise = null;
const subscribers = new Set();

const useOptions = () => {
  const [state, setState] = useState({
    loading: optionsCache === null,
    options: optionsCache || {},
  });

  useEffect(() => {
    if (optionsCache) {
      setState({ loading: false, options: optionsCache });
      return;
    }

    subscribers.add(setState);

    if (!optionsPromise) {
      optionsPromise = window.axios
        .get("/api/options")
        .then((response) => response.data?.data || {})
        .catch(() => ({}))
        .then((data) => {
          optionsCache = data;
          subscribers.forEach((fn) => fn({ loading: false, options: data }));
          return data;
        });
    }

    return () => subscribers.delete(setState);
  }, []);

  return state;
};

export default useOptions;