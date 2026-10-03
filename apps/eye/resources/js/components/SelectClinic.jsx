import React, { forwardRef, useEffect, useState } from "react";
import Select from "./Select";
import useFetch from "../hooks/useFetch";

import { throttle } from "../helpers";

const SelectClinic = ({ params, value, onChange, ...rest }, ref) => {
  const [selected, setSelected] = useState();
  const [searchQuery, setSearchQuery] = useState();

  const { data, loading } = useFetch(
    "api/clinics",
    {
      per_page: 25,
      ...params,
      q: searchQuery,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <Select
      label="Clinic"
      fullWidth
      {...rest}
      ref={ref}
      loading={loading}
      options={data}
      optionsLabel="name"
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={selected}
      onInputChange={(event) =>
        throttle(() => setSearchQuery(event?.target?.value), 500)
      }
      onChange={(value) => {
        setSelected(value);
        if (typeof onChange === "function") {
          onChange(value);
        }
      }}
    />
  );
};

export default forwardRef(SelectClinic);
