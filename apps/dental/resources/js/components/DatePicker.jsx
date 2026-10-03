import React, {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faChevronLeft,
  faChevronRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

/** Accepts a Date, a Date-like string, or null. */
const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    // Treat bare `yyyy-mm-dd` as a local date, not a UTC instant.
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
    if (dateOnly) {
      return new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      );
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const pad = (n) => String(n).padStart(2, "0");

const toInputValue = (date) =>
  date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : "";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** Monday-first grid of the given month, padded to whole weeks. */
const buildMonthGrid = (year, month) => {
  const first = new Date(year, month, 1);
  // getDay() is 0=Sun; shift so Monday is column 0.
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < leading; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

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
    minDate,
    maxDate,
    disabled,
    id,
    name,
    className,
    ...rest
  },
  ref
) => {
  const inputRef = useRef();
  const containerRef = useRef(null);
  const genId = useId();
  const fieldId = id || name || genId;

  const selected = useMemo(() => toDate(value), [value]);

  const [state, setState] = useState({
    value: selected,
    error: null,
    validate: false,
    open: false,
  });

  const [cursor, setCursor] = useState(() => {
    const base = toDate(value) || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, value: selected }));
  }, [selected]);

  useEffect(() => {
    if (state.open) {
      const base = toDate(state.value) || new Date();
      setCursor(new Date(base.getFullYear(), base.getMonth(), 1));
    }
  }, [state.open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.validate) {
      _validate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value, state.validate]);

  useEffect(() => {
    if (!state.open) return undefined;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setState((prev) => ({ ...prev, open: false }));
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [state.open]);

  const _onChange = (next, validate = true) => {
    onChange?.(next);
    setState((prev) => ({
      ...prev,
      value: next,
      validate,
      error: validate ? undefined : prev.error,
    }));
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

  useImperativeHandle(ref, () => ({
    validate: _validate,
    setValue: _setValue,
    focus: () => inputRef.current?.focus(),
  }));

  const pick = (date) => {
    const min = toDate(minDate);
    const max = toDate(maxDate);
    if (min && date < min) return;
    if (max && date > max) return;
    setState((prev) => ({ ...prev, open: false }));
    _onChange(date, true);
  };

  const shiftMonth = (delta) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const isSameDay = (a, b) =>
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const today = new Date();
  const cells = buildMonthGrid(cursor.getFullYear(), cursor.getMonth());

  return (
    <div
      ref={containerRef}
      className={`${horizontal ? "flex flex-row items-start gap-1" : "w-full"} ${fullWidth ? "w-full" : ""} ${className || ""}`}
      {...containerProps}
    >
      {label ? (
        <label
          htmlFor={fieldId}
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
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              id={fieldId}
              name={name}
              type="text"
              readOnly
              value={toInputValue(state.value)}
              placeholder="yyyy-mm-dd"
              disabled={disabled}
              onClick={() =>
                setState((prev) => ({ ...prev, open: !prev.open }))
              }
              className={`form-input w-full pl-9 pr-9 cursor-pointer ${
                state.error ? "border-red-500 ring-2 ring-red-500/20" : ""
              }`}
              {...rest}
            />
            <span className="absolute left-3 text-mist-400 pointer-events-none">
              <FontAwesomeIcon icon={faCalendarDay} className="w-4 h-4" />
            </span>
            {state.value ? (
              <button
                type="button"
                onClick={() => _onChange(null, true)}
                aria-label="Clear date"
                className="absolute right-3 text-mist-400 hover:text-mist-600 transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {state.open ? (
            <div className="absolute z-30 mt-1 w-[290px] bg-white rounded-xl border border-mist-200 shadow-lift p-3 animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                  className="p-1.5 rounded-lg text-mist-500 hover:bg-mist-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                </button>
                <p className="text-sm font-semibold text-navy-900">
                  {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
                </p>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  className="p-1.5 rounded-lg text-mist-500 hover:bg-mist-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-semibold uppercase text-mist-400 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((date, index) => {
                  if (!date) {
                    // eslint-disable-next-line react/no-array-index-key
                    return <div key={`pad-${index}`} className="h-8" />;
                  }
                  const min = toDate(minDate);
                  const max = toDate(maxDate);
                  const blocked =
                    (min && date < min) || (max && date > max);
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      disabled={blocked}
                      onClick={() => pick(date)}
                      className={`h-8 rounded-lg text-xs font-medium transition-colors ${
                        isSameDay(date, state.value)
                          ? "bg-azure-600 text-white"
                          : isSameDay(date, today)
                            ? "text-azure-700 bg-azure-50 hover:bg-azure-100"
                            : "text-navy-900 hover:bg-mist-100"
                      } ${blocked ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-mist-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => pick(new Date())}
                  className="text-xs font-medium text-azure-600 hover:underline"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setState((prev) => ({ ...prev, open: false }));
                    _onChange(null, true);
                  }}
                  className="text-xs font-medium text-mist-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {state.error ? (
          <p className="mt-1 text-xs text-red-600">{state.error}</p>
        ) : null}
      </div>
    </div>
  );
};

export default forwardRef(DatePicker);
