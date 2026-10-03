import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import MuiTextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const TextField = (
  {
    containerProps,
    label,
    required,
    horizontal,
    rules,
    value,
    defaultValue,
    valueFilter,
    onChange,
    ...rest
  },
  ref
) => {
  const inputRef = useRef();

  const [state, setState] = useState({
    value: defaultValue,
    error: null,
    validate: false,
  });

  useEffect(() => {
    setState({ ...state, value: defaultValue || value });
  }, [defaultValue, value]);

  useEffect(() => {
    if (state.validate) {
      _validate();
    }
  }, [state.value, state.validate]);

  const _onChange = (value, validate = true) => {
    if (valueFilter) {
      value = valueFilter(value);
    }

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
    if (inputRef.current) {
      inputRef.current.value = value || "";
    }
    _onChange(value, validate);
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
        <MuiTextField
          inputRef={inputRef}
          variant="outlined"
          size="small"
          margin="none"
          autoComplete="off"
          {...rest}
          defaultValue={defaultValue}
          value={value}
          required={required}
          error={!!state.error}
          onChange={(event) => _onChange(event?.target?.value || "", true)}
          id={rest.id || rest.name || `field-${Math.random().toString(36).substr(2, 9)}`}
          name={rest.name || rest.id || `field-${Math.random().toString(36).substr(2, 9)}`}
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

export default forwardRef(TextField);
