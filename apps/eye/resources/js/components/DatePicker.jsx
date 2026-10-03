import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDownRounded";
import CalendarIcon from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightIcon from "@mui/icons-material/ChevronRightRounded";

const DatePicker = (
  {
    containerProps,
    fullWidth,
    label,
    required,
    horizontal,
    views,
    rules,
    value,
    onChange,
    ...rest
  },
  ref
) => {
  const inputRef = useRef();

  const [state, setState] = useState({
    value,
    error: null,
    validate: false,
    open: false,
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
      onChange(value);
    }

    setState({ ...state, value, validate });
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

  useImperativeHandle(ref, () => ({
    validate: _validate,
    setValue: _setValue,
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          <MuiDatePicker
            inputRef={inputRef}
            format="yyyy-MM-dd"
            {...rest}
            value={value}
            slots={{
              leftArrowIcon: ChevronLeftIcon,
              openPickerIcon: CalendarIcon,
              rightArrowIcon: ChevronRightIcon,
              switchViewIcon: ArrowDropDownIcon,
            }}
            slotProps={{
              textField: {
                variant: "outlined",
                type: "text",
                size: "small",
                margin: "none",
                autoComplete: "off",
                fullWidth,
                required,
                readOnly: true,
                id: rest.id || rest.name || `datepicker-${Math.random().toString(36).substr(2, 9)}`,
                name: rest.name || rest.id || `datepicker-${Math.random().toString(36).substr(2, 9)}`,
                InputProps: {
                  error: !!state.error,
                  onClick: () => setState({ ...state, open: true }),
                },
              },
            }}
            views={views}
            open={state.open}
            onClose={() => setState({ ...state, open: false })}
            onChange={(value) => _onChange(value, true)}
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
    </LocalizationProvider>
  );
};

export default forwardRef(DatePicker);
