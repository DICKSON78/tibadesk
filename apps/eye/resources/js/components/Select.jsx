import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Paper,
  Stack,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import DropDownIcon from "@mui/icons-material/ArrowDropDownRounded";
import ClearIcon from "@mui/icons-material/CloseRounded";

const Select = (
  {
    containerProps,
    label,
    placeholder,
    helperText,
    required,
    horizontal,
    rules,
    value,
    onChange,
    options,
    optionsLabel,
    optionsValue,
    clearable,
    endAdornment,
    loading,
    InputProps,
    ...rest
  },
  ref
) => {
  const [state, setState] = useState({
    value,
    error: null,
    validate: false,
  });

  useEffect(() => {
    setState({ ...state, value });
  }, [value]);

  useEffect(() => {
    if (state.validate) {
      _validate();
    }
  }, [state.value, state.validate]);

  const _onChange = (value, validate = true) => {
    if (onChange) {
      onChange(value || "");
    }

    setState({ ...state, value: value || "", validate });
  };

  const _validate = () => {
    rules = rules || [];
    let i = 0;
    if (required) {
      rules.unshift((value) => !!value || "This field is required.");
    }

    for (; i < rules.length; i++) {
      let validate = rules[i](state.value);
      if (validate !== true) {
        setState({ ...state, error: validate });
        return false;
      } else {
        setState({ ...state, error: undefined });
      }
    }

    return true;
  };

  const _setValue = (value, validate = false) => {
    _onChange(value, validate);
  };

  const _getOptionLabel = (option) => {
    if (!option) return "";
    
    if (typeof option === "string") {
      return option;
    }

    if (typeof optionsLabel === "string" && typeof option === "object") {
      return option[optionsLabel] || "";
    }

    return "";
  };

  const _getSelectedOption = () => {
    if (!state.value) return null;
    
    if (typeof optionsValue === "string") {
      // For object options with optionsValue
      return Array.isArray(options) ? options.find(option => option && option[optionsValue] === state.value) || null : null;
    } else {
      // For string options
      return state.value;
    }
  };

  useImperativeHandle(ref, () => ({
    validate: _validate,
    setValue: _setValue,
  }));

  return (
    <Box
      component="div"
      {...(horizontal && {
        display: "flex",
        flexDirection: "row",
      })}
      {...containerProps}
    >
      {label ? (
        <Typography
          fontWeight={500}
          {...(horizontal && {
            mr: 1,
          })}
          {...(!horizontal && {
            mx: 0.5,
            mb: 0.5,
          })}
        >
          {label}
          {required ? (
            <Typography
              component="span"
              color="error.main"
              fontWeight="bold"
              ml={0.25}
            >
              *
            </Typography>
          ) : null}
        </Typography>
      ) : null}
      <Box
        component="div"
        {...(horizontal && {
          flexGrow: 1,
        })}
      >
        <Autocomplete
          {...rest}
          getOptionLabel={_getOptionLabel}
          options={Array.isArray(options) ? options : []}
          disableClearable={!clearable}
          loading={loading}
          value={_getSelectedOption()}
          noOptionsText="No options available"
          renderInput={(params) => (
            <MuiTextField
              {...params}
              placeholder={placeholder || "Select"}
              helperText={helperText}
              variant="outlined"
              size="small"
              margin="none"
              required={required}
              error={!!state.error}
              id={rest.id || rest.name || `select-${Math.random().toString(36).substr(2, 9)}`}
              name={rest.name || rest.id || `select-${Math.random().toString(36).substr(2, 9)}`}
              InputProps={{
                ...params.InputProps,
                ...InputProps,
                endAdornment: (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    {loading ? (
                      <CircularProgress
                        color="inherit"
                        size={18}
                      />
                    ) : null}
                    {endAdornment}
                    {params.InputProps.endAdornment}
                  </Stack>
                ),
              }}
            />
          )}
          clearIcon={<ClearIcon />}
          popupIcon={<DropDownIcon />}
          PaperComponent={(params) => (
            <Paper
              elevation={8}
              {...params}
            />
          )}
          onChange={(event, value) => {
            if (
              typeof value === "object" &&
              value &&
              typeof optionsValue === "string"
            ) {
              _onChange(value[optionsValue] || "", true);
            } else {
              _onChange(value || "", true);
            }
          }}
        />
        {state.error ? (
          <Typography
            variant="body2"
            color="error.main"
            mt={0.25}
            {...(!horizontal && {
              mx: 0.5,
            })}
          >
            {state.error}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};

export default forwardRef(Select);
