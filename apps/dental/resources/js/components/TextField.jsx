import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

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
    // MUI-specific props accepted by the old API. They are stripped so they
    // never reach the DOM, and mapped onto Tailwind equivalents where they
    // carry meaning.
    fullWidth,
    multiline,
    rows,
    InputProps,
    inputProps,
    variant,
    size,
    margin,
    helperText,
    sx,
    className,
    type = "text",
    ...rest
  },
  ref
) => {
  const inputRef = useRef();
  const idRef = useRef(
    rest.id || rest.name || `field-${Math.random().toString(36).substr(2, 9)}`
  );

  const [state, setState] = useState({
    value: defaultValue || "",
    error: null,
    validate: false,
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, value: defaultValue || value || "" }));
  }, [defaultValue, value]);

  useEffect(() => {
    if (state.validate) {
      _validate();
    }
  }, [state.value, state.validate]);

  const _onChange = (newValue, validate = true) => {
    let next = newValue;
    if (valueFilter) {
      next = valueFilter(next);
    }

    if (onChange) {
      onChange(next || "");
    }

    setState((prev) => ({ ...prev, value: next || "", validate }));
  };

  const _validate = () => {
    let activeRules = rules ? [...rules] : [];
    if (required) {
      activeRules.unshift((val) => !!val || "This field is required.");
    }

    for (const rule of activeRules) {
      const result = rule(state.value);
      if (result !== true) {
        setState((prev) => ({ ...prev, error: result }));
        return false;
      }
    }

    setState((prev) => ({ ...prev, error: undefined }));
    return true;
  };

  const _setValue = (newValue, validate = false) => {
    _onChange(newValue, validate);
  };

  useImperativeHandle(ref, () => ({
    validate: _validate,
    setValue: _setValue,
  }));

  const controlClassName = [
    "form-input",
    multiline ? "min-h-[80px] resize-y py-2" : "",
    state.error ? "border-red-500 ring-2 ring-red-500/20" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const sharedProps = {
    id: idRef.current,
    name: rest.name || idRef.current,
    value: state.value,
    required,
    onChange: (event) => _onChange(event?.target?.value ?? "", true),
    ...inputProps,
    ...rest,
    ref: inputRef,
  };

  return (
    <div
      className={horizontal ? "flex flex-row items-start gap-1" : "w-full"}
      {...containerProps}
    >
      {label ? (
        <label
          htmlFor={idRef.current}
          className={`block text-sm font-medium text-navy-800 ${
            horizontal ? "shrink-0 pt-2" : "mb-1"
          }`}
        >
          {label}
          {required ? <span className="ml-0.5 font-bold text-red-500">*</span> : null}
        </label>
      ) : null}
      <div className={horizontal ? "min-w-0 flex-grow" : "w-full"}>
        <div
          className={`relative flex items-center ${
            horizontal ? "w-full" : "w-full"
          }`}
        >
          {InputProps?.startAdornment ? (
            <span className="pointer-events-none absolute left-3 flex items-center text-mist-500">
              {InputProps.startAdornment}
            </span>
          ) : null}
          {multiline ? (
            <textarea
              {...sharedProps}
              rows={rows || 3}
              className={`${controlClassName} ${
                InputProps?.startAdornment ? "pl-9" : ""
              }`}
            />
          ) : (
            <input
              {...sharedProps}
              type={type}
              className={`${controlClassName} ${
                InputProps?.startAdornment ? "pl-9" : ""
              } ${InputProps?.endAdornment ? "pr-9" : ""}`}
            />
          )}
          {InputProps?.endAdornment ? (
            <span className="absolute right-2 flex items-center text-mist-500">
              {InputProps.endAdornment}
            </span>
          ) : null}
        </div>
        {state.error ? (
          <p className="mt-1 text-xs text-red-600">{state.error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-mist-500">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
};

export default forwardRef(TextField);