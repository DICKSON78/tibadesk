import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import AttachmentIcon from "@mui/icons-material/AttachmentRounded";

const FileInput = (
  {
    containerProps,
    label,
    fullWidth,
    required,
    horizontal,
    rules,
    onChange,
    ...rest
  },
  ref
) => {
  const inputRef = useRef();

  const [state, setState] = useState({
    value: null,
    error: null,
    validate: false,
    focused: false,
  });

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

  useImperativeHandle(ref, () => ({
    validate: _validate,
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
        <Box
          component="label"
          position="relative"
          display={fullWidth ? "block" : "inline-block"}
          border={(theme) => `1px solid ${theme.palette.divider}`}
          borderRadius={(theme) => `${theme.shape.borderRadius}px`}
          bgcolor={(theme) =>
            theme.components.MuiOutlinedInput.styleOverrides?.root
              ?.backgroundColor
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              opacity: 0,
            },
            ...(state.focused && {
              borderColor: (theme) => theme.palette.primary.main,
              borderWidth: 2,
            }),
            ...(state.error && {
              borderColor: (theme) => theme.palette.error.main,
            }),
          }}
        >
          <Box
            borderRadius="inherit"
            display="flex"
            alignItems="center"
            position="absolute"
            top={0}
            width="100%"
            height="100%"
            px={1.5}
            sx={{
              gap: 1,
              ...(rest?.disabled && {
                color: (theme) =>
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.38)"
                    : "rgba(255, 255, 255, 0.5)",
                "& .MuiTypography-root": {
                  color: "inherit",
                },
              }),
            }}
          >
            <Typography
              color={state.value ? "text.primary" : "text.secondary"}
              flexGrow={1}
              noWrap
            >
              {state.value ? state.value[0].name : "Browse files..."}
            </Typography>
            <AttachmentIcon fontSize="small" />
          </Box>
          <OutlinedInput
            inputRef={inputRef}
            variant="outlined"
            size="small"
            margin="none"
            autoComplete="off"
            fullWidth={fullWidth}
            {...rest}
            type="file"
            required={required}
            onChange={(event) => _onChange(event.target.files, true)}
            onFocus={(event) => setState({ ...state, focused: true })}
            onBlur={(event) => setState({ ...state, focused: false })}
          />
        </Box>
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

export default forwardRef(FileInput);
