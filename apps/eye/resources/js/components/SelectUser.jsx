import React, { forwardRef, useEffect, useState } from "react";
import Select from "./Select";
import useFetch from "../hooks/useFetch";

const SelectUser = ({ params, value, onChange, ...rest }, ref) => {
  const [selected, setSelected] = useState();

  const { data, loading } = useFetch(
    "api/users",
    { per_page: 25, ...params },
    true,
    [],
    (response) => response.data.data.data
  );

  useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <Select
      label="User"
      fullWidth
      {...rest}
      ref={ref}
      loading={loading}
      options={data}
      optionsLabel="full_name"
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={selected}
      onChange={(value) => {
        setSelected(value);
        if (typeof onChange === "function") {
          onChange(value);
        }
      }}
    />
  );
};

export default forwardRef(SelectUser);
