import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import useOptions from "../hooks/useOptions";

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
    category,
    optionsLabel,
    optionsValue,
    clearable,
    endAdornment,
    loading,
    // Accepted for API parity with the old MUI-backed field, then ignored.
    InputProps,
    inputProps,
    variant,
    size,
    margin,
    sx,
    className,
    ...rest
  },
  ref
) => {
  const { options: dbOptions } = useOptions();
  const effectiveOptions = useMemo(
    () => (category ? dbOptions[category] || [] : options || []),
    [category, dbOptions, options]
  );

  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const [state, setState] = useState({
    value,
    error: null,
    validate: false,
    open: false,
    search: "",
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, value }));
  }, [value]);

  useEffect(() => {
    if (state.validate) {
      _validate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value, state.validate]);

  useEffect(() => {
    if (!state.open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setState((prev) => ({ ...prev, open: false }));
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [state.open]);

  useEffect(() => {
    if (state.open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [state.open]);

  const _onChange = (next, validate = true) => {
    if (onChange) {
      onChange(next || "");
    }
    setState((prev) => ({ ...prev, value: next || "", validate, open: false, search: "" }));
  };

  const _validate = () => {
    const activeRules = rules ? [...rules] : [];
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

  const _setValue = (next, validate = false) => {
    _onChange(next, validate);
  };

  const getOptionLabel = (option) => {
    if (option === null || option === undefined) return "";
    if (typeof option === "string" || typeof option === "number") {
      return String(option);
    }
    if (typeof optionsLabel === "string") return option[optionsLabel] || "";
    return option.label || option.name || option.title || "";
  };

  const getOptionValue = (option) => {
    if (option === null || option === undefined) return "";
    if (typeof option !== "object") return option;
    if (typeof optionsValue === "string") return option[optionsValue] ?? "";
    if ("value" in option) return option.value ?? "";
    return option.id ?? "";
  };

  const getSelectedLabel = () => {
    if (state.value === null || state.value === undefined || state.value === "") {
      return "";
    }
    if (typeof state.value === "object") return getOptionLabel(state.value);

    const match = effectiveOptions.find(
      (option) => getOptionValue(option) === state.value
    );
    return match ? getOptionLabel(match) : String(state.value);
  };

  const isSelected = (option) => {
    const optionValue = getOptionValue(option);
    if (state.value && typeof state.value === "object") {
      return getOptionValue(state.value) === optionValue;
    }
    return state.value === optionValue;
  };

  const filteredOptions = useMemo(() => {
    if (!state.search) return effectiveOptions;
    const term = state.search.toLowerCase();
    return effectiveOptions.filter((option) =>
      getOptionLabel(option).toLowerCase().includes(term)
    );
  }, [effectiveOptions, state.search]);

  const handleSelect = useCallback(
    (option) => {
      if (typeof option === "object" && option !== null) {
        if (typeof optionsValue === "string") {
          _onChange(option[optionsValue] ?? "");
        } else if ("value" in option) {
          _onChange(option.value ?? "");
        } else {
          _onChange(option);
        }
      } else {
        _onChange(option ?? "");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [optionsValue, onChange]
  );

  useImperativeHandle(ref, () => ({
    validate: _validate,
    setValue: _setValue,
  }));

  const selectedLabel = getSelectedLabel();

  return (
    <div
      ref={containerRef}
      className={horizontal ? "flex flex-row items-start gap-1" : "w-full"}
      {...containerProps}
    >
      {label ? (
        <label
          className={`block text-sm font-medium text-navy-800 ${
            horizontal ? "shrink-0 pt-2" : "mb-1"
          }`}
        >
          {label}
          {required ? <span className="ml-0.5 font-bold text-red-500">*</span> : null}
        </label>
      ) : null}

      <div className={horizontal ? "min-w-0 flex-grow" : "w-full"}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setState((prev) => ({ ...prev, open: !prev.open }))}
            aria-haspopup="listbox"
            aria-expanded={state.open}
            className={`form-input flex items-center justify-between gap-2 text-left ${
              state.error ? "border-red-500 ring-2 ring-red-500/20" : ""
            } ${className || ""}`}
          >
            <span className={selectedLabel ? "text-navy-900" : "text-mist-400"}>
              {selectedLabel || placeholder || "Select"}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-azure-600 border-t-transparent rounded-full animate-spin" />
              ) : null}
              {endAdornment}
              {clearable && selectedLabel ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear selection"
                  onClick={(event) => {
                    event.stopPropagation();
                    _onChange("", true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.stopPropagation();
                      event.preventDefault();
                      _onChange("", true);
                    }
                  }}
                  className="text-mist-400 hover:text-mist-600 px-1"
                >
                  &times;
                </span>
              ) : (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`w-3.5 h-3.5 text-mist-400 transition-transform ${
                    state.open ? "rotate-180" : ""
                  }`}
                />
              )}
            </span>
          </button>

          {state.open ? (
            <div
              role="listbox"
              className="absolute z-30 mt-1 w-full bg-white rounded-xl border border-mist-200 shadow-lift overflow-hidden animate-fadeIn"
            >
              <div className="p-2 border-b border-mist-100">
                <input
                  ref={searchRef}
                  type="text"
                  value={state.search}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, search: event.target.value }))
                  }
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-mist-200 outline-none focus:border-azure-500 focus:ring-2 focus:ring-azure-500/20"
                />
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-mist-400">
                    No options available
                  </p>
                ) : (
                  filteredOptions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      role="option"
                      aria-selected={isSelected(option)}
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        isSelected(option)
                          ? "bg-azure-50 text-azure-700 font-medium"
                          : "text-mist-700 hover:bg-mist-50"
                      }`}
                    >
                      {getOptionLabel(option)}
                    </button>
                  ))
                )}
              </div>
            </div>
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

export default forwardRef(Select);
