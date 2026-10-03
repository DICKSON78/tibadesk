/**
 * Tailwind-styled stand-ins for the MUI components still referenced by pages
 * that have not been migrated yet.
 *
 * These are a deliberate migration bridge: they keep the old MUI markup and
 * prop contract (including `sx`) working while rendering the TibaDesk/Tailwind
 * design language from `resources/css/app.css`. Pages should be rewritten to
 * native Tailwind over time and these imports dropped.
 */

import React, { cloneElement, forwardRef, useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { sxToProps, sxToStyle } from "./sx";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const cx = (...parts) => parts.filter(Boolean).join(" ");

const pickColor = (color) => {
  if (typeof color !== "string") return "azure";
  if (color === "primary" || color === "secondary") return "azure";
  return color;
};

const SEVERITY = {
  error: { cls: "alert-error", icon: faCircleExclamation },
  warning: { cls: "alert-warning", icon: faTriangleExclamation },
  info: { cls: "alert-info", icon: faCircleInfo },
  success: { cls: "alert-success", icon: faCircleCheck },
};

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const Box = forwardRef(function Box(
  { component: Component = "div", sx, className, style, children, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <Component
      ref={ref}
      className={cx(sxProps.className, className) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
});

const GRID_COLS = 12;
const bpValue = (v) => (v === true ? GRID_COLS : v === false ? 0 : Number(v) || 0);
const pct = (v) => `${(bpValue(v) / GRID_COLS) * 100}%`;

/** MUI propagates container `spacing` to descendants via context. */
const GridSpacingContext = React.createContext(undefined);

const spacingHalf = (v) => `${(Number(Array.isArray(v) ? v[1] : v) * 8) / 2}px`;
const spacingFull = (v) => `${Number(Array.isArray(v) ? v[1] : v) * 8}px`;

const responsiveSpacing = (spacing, transform) => {
  if (!spacing) return undefined;
  const out = {};
  let last;
  ["xs", "sm", "md", "lg", "xl"].forEach((bp) => {
    const v = spacing[bp];
    if (v === undefined) return;
    const css = transform(v);
    if (css !== last) {
      out[bp] = css;
      last = css;
    }
  });
  return Object.keys(out).length ? out : undefined;
};

/** MUI v1-style Grid: `<Grid container>` + `<Grid item xs={12} md={4}>`. */
const Grid = forwardRef(function Grid(
  {
    container,
    item,
    xs,
    sm,
    md,
    lg,
    xl,
    spacing = 0,
    rowSpacing,
    justifyContent,
    alignItems,
    direction,
    wrap,
    sx,
    className,
    style,
    component: Component = "div",
    children,
    ...rest
  },
  ref
) {
  const sxProps = sxToProps(sx);

  if (container) {
    const containerSx = { ...(sx || {}) };
    if (justifyContent) containerSx.justifyContent = justifyContent;
    if (alignItems) containerSx.alignItems = alignItems;
    if (wrap) containerSx.flexWrap = wrap;

    // MUI applies spacing as padding on items plus a negative margin on the
    // container. Both are breakpoint-aware, so emit them as responsive CSS.
    const hasBreakpointSpacing =
      spacing && typeof spacing === "object" && !Array.isArray(spacing);
    const containerProps = sxToProps(containerSx);

    const gridStyle = { display: "flex", flexWrap: "wrap" };
    if (direction) gridStyle.flexDirection = direction;

    const spacingCls = (() => {
      if (!spacing) return undefined;
      const pad = hasBreakpointSpacing
        ? responsiveSpacing(spacing, spacingHalf)
        : { xs: spacingHalf(spacing) };
      const margin = hasBreakpointSpacing
        ? responsiveSpacing(spacing, (v) => `-${spacingFull(v)}`)
        : { xs: `-${spacingFull(spacing)}` };
      if (!pad) return undefined;
      return sxToProps({ padding: pad, margin }).className;
    })();

    return (
      <Component
        ref={ref}
        className={cx(containerProps.className, spacingCls, className) || undefined}
        style={{ ...gridStyle, ...style }}
        {...rest}
      >
        <GridSpacingContext.Provider value={spacing}>
          {children}
        </GridSpacingContext.Provider>
      </Component>
    );
  }

  // Item: width from breakpoint props, emitted as responsive CSS.
  const widths = { xs, sm, md, lg, xl };
  const hasAny = Object.entries(widths).some(([, v]) => v !== undefined && v !== false);
  const itemStyle = { minWidth: 0 };
  let widthClass;

  if (hasAny) {
    const responsive = {};
    let current = 12; // xs defaults to full width when unspecified
    ["xs", "sm", "md", "lg", "xl"].forEach((bp) => {
      const v = widths[bp];
      if (v !== undefined && v !== false && v !== true) current = v;
      responsive[bp] = pct(current);
    });
    if (widths.xs !== undefined && widths.xs !== false) {
      responsive.xs = pct(widths.xs);
    }
    // Collapse the chain so each breakpoint only emits when it changes.
    const widthObj = {};
    let last;
    ["xs", "sm", "md", "lg", "xl"].forEach((bp) => {
      if (responsive[bp] !== last) {
        widthObj[bp] = responsive[bp];
        last = responsive[bp];
      }
    });
    widthClass = sxToProps({
      width: widthObj,
      flexBasis: widthObj,
      maxWidth: widthObj,
    }).className;
    itemStyle.width = "100%";
  }

  const inheritedSpacing = React.useContext(GridSpacingContext);
  const effectiveSpacing = spacing ?? inheritedSpacing;
  const padCls = (() => {
    if (!effectiveSpacing) return undefined;
    const pad =
      effectiveSpacing && typeof effectiveSpacing === "object" && !Array.isArray(effectiveSpacing)
        ? responsiveSpacing(effectiveSpacing, spacingHalf)
        : { xs: spacingHalf(effectiveSpacing) };
    return pad ? sxToProps({ padding: pad }).className : undefined;
  })();

  return (
    <Component
      ref={ref}
      className={cx("mui-grid-item", widthClass, padCls, sxProps.className, className) || undefined}
      style={{ ...itemStyle, ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
});

const Stack = forwardRef(function Stack(
  {
    direction = "column",
    spacing = 0,
    divider,
    alignItems,
    justifyContent,
    flexWrap,
    sx,
    className,
    style,
    component: Component = "div",
    children,
    ...rest
  },
  ref
) {
  const stackStyle = { display: "flex", flexDirection: direction };
  if (spacing) {
    const s = typeof spacing === "number" ? spacing : Number(spacing) || 0;
    if (s) {
      if (direction === "row" || direction === "row-reverse") {
        stackStyle.columnGap = `${s * 8}px`;
      } else {
        stackStyle.rowGap = `${s * 8}px`;
      }
    }
  }
  if (alignItems) stackStyle.alignItems = alignItems;
  if (justifyContent) stackStyle.justifyContent = justifyContent;
  if (flexWrap) stackStyle.flexWrap = flexWrap;

  const sxProps = sxToProps(sx);
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <Component
      ref={ref}
      className={cx(sxProps.className, className) || undefined}
      style={{ ...stackStyle, ...style }}
      {...rest}
    >
      {divider
        ? items.flatMap((child, i) => {
            const parts = [child];
            if (i < items.length - 1) {
              parts.push(
                <div
                  key={`divider-${i}`}
                  className="shrink-0 bg-mist-200"
                  style={
                    direction === "row"
                      ? { width: "1px", alignSelf: "stretch" }
                      : { height: "1px", width: "100%" }
                  }
                />
              );
            }
            return parts;
          })
        : items}
    </Component>
  );
});

const Typography = forwardRef(function Typography(
  {
    variant = "body1",
    component,
    align,
    color,
    fontWeight,
    noWrap,
    paragraph,
    gutterBottom,
    button,
    sx,
    className,
    style,
    children,
    ...rest
  },
  ref
) {
  let Tag = component;
  if (!Tag) {
    if (paragraph || variant === "body2") Tag = "p";
    else if (variant.startsWith("h")) Tag = variant;
    else Tag = "span";
  }

  const scale = {
    h1: "text-3xl font-bold",
    h2: "text-2xl font-bold",
    h3: "text-xl font-semibold",
    h4: "text-lg font-semibold",
    h5: "text-base font-semibold",
    h6: "text-base font-semibold",
    subtitle1: "text-base",
    subtitle2: "text-sm",
    body1: "text-sm",
    body2: "text-xs",
    caption: "text-xs",
    overline: "text-xs uppercase tracking-wide",
  };

  const colorCls = color
    ? {
        error: "text-red-600",
        warning: "text-amber-600",
        info: "text-azure-600",
        success: "text-emerald-600",
        primary: "text-azure-600",
        secondary: "text-navy-900",
        text: { primary: "text-navy-900", secondary: "text-mist-500" }[color] || "",
      }[color] || (color.startsWith("#") ? "" : "")
      : "";

  const sxProps = sxToProps(sx);
  return (
    <Tag
      ref={ref}
      className={cx(
        scale[variant] || scale.body1,
        colorCls,
        align === "center" && "text-center",
        align === "right" && "text-right",
        noWrap && "truncate",
        sxProps.className,
        className
      ) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
});

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

const Card = forwardRef(function Card(
  { variant = "elevation", elevation = 1, sx, className, style, children, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <div
      ref={ref}
      className={cx("card", variant === "outlined" && "bg-transparent", sxProps.className, className) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

const CardContent = forwardRef(function CardContent(
  { sx, className, style, children, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <div
      ref={ref}
      className={cx("p-6", sxProps.className, className) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

const CardHeader = forwardRef(function CardHeader(
  { title, subheader, action, avatar, sx, className, style, children, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <div
      ref={ref}
      className={cx("px-6 pt-5 pb-2 flex items-start gap-3", sxProps.className, className) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {avatar ? <div className="shrink-0">{avatar}</div> : null}
      <div className="min-w-0 flex-grow">
        {typeof title === "string" ? (
          <h3 className="text-base font-semibold text-navy-900 truncate">{title}</h3>
        ) : (
          title
        )}
        {subheader ? (
          typeof subheader === "string" ? (
            <p className="text-xs text-mist-500 mt-0.5 truncate">{subheader}</p>
          ) : (
            subheader
          )
        ) : null}
        {children}
      </div>
      {action ? <div className="shrink-0 ml-auto">{action}</div> : null}
    </div>
  );
});

const CardActions = forwardRef(function CardActions(
  { spacing = 1, disableSpacing, sx, className, style, children, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <div
      ref={ref}
      className={cx(
        disableSpacing ? "px-6 pb-5" : "px-6 pb-5 flex items-center",
        sxProps.className,
        className
      ) || undefined}
      style={{ ...style, ...(disableSpacing ? {} : { gap: `${spacing * 8}px` }), ...sxToStyle(sx) }}
      {...rest}
    >
      {children}
    </div>
  );
});

const Paper = forwardRef(function Paper(
  { variant = "elevation", elevation = 1, sx, className, style, children, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <div
      ref={ref}
      className={cx("bg-white rounded-2xl border border-mist-200 shadow-sm", sxProps.className, className) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

const Divider = forwardRef(function Divider(
  { orientation = "horizontal", flexItem, sx, className, style, children, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cx(
        orientation === "vertical"
          ? "w-px self-stretch bg-mist-200"
          : "h-px w-full bg-mist-200",
        sxProps.className,
        className
      ) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

const BUTTON_VARIANT = {
  contained: "",
  outlined: "btn-outline",
  text: "btn-ghost",
};

const BUTTON_COLOR = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  error: "btn-danger",
  danger: "btn-danger",
  warning: "btn-warning",
  info: "btn-info",
  success: "btn-success",
  inherit: "",
};

const Button = forwardRef(function Button(
  {
    variant = "text",
    color = "primary",
    size = "medium",
    startIcon,
    endIcon,
    fullWidth,
    disabled,
    disableElevation,
    href,
    sx,
    className,
    style,
    type = "button",
    children,
    ...rest
  },
  ref
) {
  const sxProps = sxToProps(sx);
  const cls = cx(
    "btn",
    BUTTON_VARIANT[variant] ?? "",
    BUTTON_COLOR[color] ?? "",
    size === "small" && "btn-sm",
    size === "large" && "btn-lg",
    fullWidth && "w-full",
    sxProps.className,
    className
  );
  const content = (
    <>
      {startIcon ? (
        <span className="shrink-0 [&_svg]:w-4 [&_svg]:h-4">{startIcon}</span>
      ) : null}
      {children}
      {endIcon ? (
        <span className="shrink-0 [&_svg]:w-4 [&_svg]:h-4">{endIcon}</span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={cls || undefined}
        style={{ ...sxToStyle(sx), ...style }}
        {...rest}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cls || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {content}
    </button>
  );
});

const IconButton = forwardRef(function IconButton(
  { size = "medium", color = "default", edge, sx, className, style, children, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  const dims = {
    small: "h-8 w-8",
    medium: "h-10 w-10",
    large: "h-12 w-12",
  }[size] || "h-10 w-10";
  const colorCls = {
    error: "text-red-600 hover:bg-red-50",
    warning: "text-amber-600 hover:bg-amber-50",
    info: "text-azure-600 hover:bg-azure-50",
    success: "text-emerald-600 hover:bg-emerald-50",
    primary: "text-azure-600 hover:bg-azure-50",
    secondary: "text-navy-900 hover:bg-mist-100",
  }[color] || "text-mist-600 hover:bg-mist-100";

  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        dims,
        "inline-flex items-center justify-center rounded-lg transition-colors [&_svg]:w-5 [&_svg]:h-5 disabled:opacity-40 disabled:pointer-events-none",
        colorCls,
        sxProps.className,
        className
      ) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {children}
    </button>
  );
});

const Chip = forwardRef(function Chip(
  { label, color = "default", size = "medium", variant = "filled", onDelete, icon, onClick, sx, className, style, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  const colorCls = {
    primary: "badge-azure",
    secondary: "badge-gray",
    error: "badge-red",
    warning: "badge-yellow",
    info: "badge-blue",
    success: "badge-green",
    default: "badge-gray",
  }[color] || "badge-gray";

  return (
    <span
      ref={ref}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full",
        size === "small" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        variant === "outlined" && "bg-transparent border border-current",
        colorCls,
        onClick && "cursor-pointer hover:opacity-80",
        sxProps.className,
        className
      ) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      onClick={onClick}
      {...rest}
    >
      {icon ? <span className="[&_svg]:w-3 [&_svg]:h-3">{icon}</span> : null}
      {label}
      {onDelete ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="ml-0.5 opacity-60 hover:opacity-100"
          aria-label="delete"
        >
          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
        </button>
      ) : null}
    </span>
  );
});

const Tooltip = ({ title, children, placement = "top", arrow, sx }) => {
  if (!title) return children;
  return (
    <span className="relative inline-flex group" title={typeof title === "string" ? title : undefined}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-navy-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{
          bottom: placement === "top" ? "calc(100% + 6px)" : undefined,
          top: placement === "bottom" ? "calc(100% + 6px)" : undefined,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {title}
      </span>
    </span>
  );
};

const Switch = forwardRef(function Switch(
  { checked, onChange, disabled, size, sx, className, style, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={!!checked}
      disabled={disabled}
      onClick={() =>
        onChange?.({ target: { checked: !checked }, stopPropagation: () => {} })
      }
      className={cx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-azure-600" : "bg-mist-300",
        sxProps.className,
        className
      )}
      style={style}
      {...rest}
    >
      <span
        className={cx(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
});

const Checkbox = forwardRef(function Checkbox(
  { checked, onChange, disabled, size, value, name, color, sx, className, style, inputRef, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <input
      ref={ref}
      type="checkbox"
      name={name}
      value={value}
      checked={!!checked}
      disabled={disabled}
      onChange={(e) => onChange?.({ target: { checked: e.target.checked, value: e.target.value, name }, stopPropagation: () => {} })}
      className={cx(
        "h-4 w-4 rounded border-mist-400 text-azure-600 focus:ring-2 focus:ring-azure-500/30 cursor-pointer disabled:opacity-50",
        sxProps.className,
        className
      )}
      style={style}
      {...rest}
    />
  );
});

const Radio = forwardRef(function Radio(
  { checked, onChange, disabled, value, name, size, color, sx, className, style, ...rest },
  ref
) {
  const sxProps = sxToProps(sx);
  return (
    <input
      ref={ref}
      type="radio"
      name={name}
      value={value}
      checked={!!checked}
      disabled={disabled}
      onChange={(e) => onChange?.({ target: { checked: e.target.checked, value: e.target.value, name }, stopPropagation: () => {} })}
      className={cx(
        "h-4 w-4 border-mist-400 text-azure-600 focus:ring-2 focus:ring-azure-500/30 cursor-pointer disabled:opacity-50",
        sxProps.className,
        className
      )}
      style={style}
      {...rest}
    />
  );
});

const RadioGroup = ({ value, onChange, name, children, row, sx }) => (
  <div
    className={cx(row ? "flex items-center gap-4 flex-wrap" : "space-y-2")}
    role="radiogroup"
    style={sxToStyle(sx)}
  >
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? cloneElement(child, {
            name,
            checked: child.props.value === value,
            onChange,
          })
        : child
    )}
  </div>
);

const FormControlLabel = ({ control, label, value, sx, className }) => (
  <label
    className={cx("inline-flex items-center gap-2 cursor-pointer text-sm text-navy-900", className)}
    style={sxToStyle(sx)}
  >
    {control}
    <span>{label}</span>
  </label>
);

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

const LinearProgress = ({ variant = "indeterminate", value = 0, color = "primary", sx, className, style }) => {
  const barColor = {
    primary: "bg-azure-600",
    secondary: "bg-navy-900",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
    success: "bg-emerald-500",
  }[color] || "bg-azure-600";

  return (
    <div
      role="progressbar"
      className={cx("h-1 w-full overflow-hidden rounded-full bg-mist-200", className)}
      style={style}
    >
      <div
        className={cx("h-full", barColor, variant === "determinate" ? "" : "w-1/2 animate-progress")}
        style={variant === "determinate" ? { width: `${Math.min(100, value)}%` } : undefined}
      />
    </div>
  );
};

const CircularProgress = ({ size = 40, thickness = 4, color = "primary", value, sx, className, style }) => {
  const stroke = {
    primary: "#2D4EA8",
    secondary: "#010736",
    error: "#D64545",
    warning: "#D9822B",
    info: "#2D4EA8",
    success: "#22A06B",
  }[color] || "#2D4EA8";
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cx("animate-spin", className)}
      style={style}
      role="progressbar"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#EEEEEF"
        strokeWidth={thickness}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={
          value === undefined ? circumference * 0.75 : circumference * (1 - value / 100)
        }
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

const Skeleton = ({ variant = "text", width, height, animation = "wave", sx, className, style, children }) => {
  const dims =
    variant === "circular"
      ? { borderRadius: "9999px", width: width || 40, height: height || 40 }
      : variant === "rounded"
        ? { borderRadius: "1rem", width: width || "100%", height: height || 60 }
        : { borderRadius: "0.375rem", width: width || "100%", height: height || 16 };

  return (
    <div
      className={cx("bg-mist-200 shimmer", className)}
      style={{ ...dims, ...sxToStyle(sx), ...style }}
    >
      {children}
    </div>
  );
};

const Alert = forwardRef(function Alert(
  { severity = "info", icon, action, onClose, sx, className, style, children, ...rest },
  ref
) {
  const conf = SEVERITY[severity] || SEVERITY.info;
  return (
    <div
      ref={ref}
      role="alert"
      className={cx("alert", conf.cls, sxToProps(sx).className, className) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {icon ?? <FontAwesomeIcon icon={conf.icon} className="w-5 h-5 shrink-0" />}
      <div className="flex-grow min-w-0">{children}</div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 opacity-60 hover:opacity-100"
          aria-label="close"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>
      ) : action ? (
        <div className="shrink-0">{action}</div>
      ) : null}
    </div>
  );
});

const AlertTitle = ({ children, className }) => (
  <p className={cx("font-semibold mb-0.5", className)}>{children}</p>
);

/* ------------------------------------------------------------------ */
/* Collapse / overlays                                                 */
/* ------------------------------------------------------------------ */

const Collapse = ({ in: inProp = false, unmountOnExit, timeout, children, sx }) => {
  if (unmountOnExit && !inProp) return null;
  return (
    <div className={inProp ? "animate-fadeIn" : "hidden"} style={sxToStyle(sx)}>
      {children}
    </div>
  );
};

const Dialog = ({
  open = false,
  onClose,
  fullScreen,
  maxWidth = "sm",
  fullWidth,
  PaperProps,
  children,
}) => {
  if (!open) return null;
  const width = {
    xs: "max-w-full",
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  }[maxWidth] || "max-w-md";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "relative w-full bg-white rounded-2xl shadow-glow max-h-[90vh] flex flex-col animate-fadeIn",
          fullWidth ? width : "max-w-sm",
          fullScreen && "max-w-full h-full max-h-full"
        )}
        style={PaperProps?.style}
      >
        {children}
      </div>
    </div>
  );
};

const DialogTitle = ({ children, className, ...rest }) => (
  <h2
    className={cx("text-base font-semibold text-navy-900 px-6 py-4 border-b border-mist-200 shrink-0", className)}
    {...rest}
  >
    {children}
  </h2>
);
const DialogContent = ({ children, className, dividers, ...rest }) => (
  <div className={cx("px-6 py-4 overflow-y-auto flex-grow", className)} {...rest}>
    {children}
  </div>
);
const DialogContentText = ({ children, className, ...rest }) => (
  <p className={cx("text-sm text-mist-700", className)} {...rest}>
    {children}
  </p>
);
const DialogActions = ({ children, className, ...rest }) => (
  <div
    className={cx("px-6 py-4 border-t border-mist-200 flex items-center justify-end gap-2 shrink-0", className)}
    {...rest}
  >
    {children}
  </div>
);

const Badge = ({ badgeContent, color = "primary", children, sx, className }) => (
  <span className="relative inline-flex" style={sxToStyle(sx)}>
    {children}
    {badgeContent ? (
      <span
        className={cx(
          "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center",
          color === "error" ? "bg-red-500" : "bg-azure-600"
        )}
      >
        {badgeContent}
      </span>
    ) : null}
  </span>
);

/* ------------------------------------------------------------------ */
/* Navigation primitives                                               */
/* ------------------------------------------------------------------ */

const List = ({ dense, sx, className, children, ...rest }) => (
  <ul
    className={cx(dense ? "list-none p-0" : "list-none p-0", sxToProps(sx).className, className) || undefined}
    style={sxToStyle(sx)}
    {...rest}
  >
    {children}
  </ul>
);
const ListItem = ({ sx, className, children, ...rest }) => (
  <li className={cx(sxToProps(sx).className, className) || undefined} style={sxToStyle(sx)} {...rest}>
    {children}
  </li>
);
const ListItemText = ({ primary, secondary, sx, className }) => (
  <div className={cx("min-w-0", className)} style={sxToStyle(sx)}>
    {typeof primary === "string" ? (
      <p className="text-sm text-navy-900 truncate">{primary}</p>
    ) : (
      primary
    )}
    {secondary ? (
      typeof secondary === "string" ? (
        <p className="text-xs text-mist-500 truncate">{secondary}</p>
      ) : (
        secondary
      )
    ) : null}
  </div>
);
const ListItemIcon = ({ children, sx, className }) => (
  <span className={cx("shrink-0 flex", className)} style={sxToStyle(sx)}>
    {children}
  </span>
);

const Tabs = ({ value, onChange, children, variant, sx, className }) => (
  <div className={cx("flex items-center gap-1 border-b border-mist-200", sxToProps(sx).className, className)}>
    {React.Children.map(children, (child) =>
      React.isValidElement(child) && value !== undefined
        ? cloneElement(child, { selected: child.props.value === value, onChange })
        : child
    )}
  </div>
);

const Tab = ({ label, value, selected, onChange, sx, className }) => (
  <button
    type="button"
    onClick={(e) => onChange?.(e, value)}
    className={cx(
      "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
      selected
        ? "border-azure-600 text-azure-700"
        : "border-transparent text-mist-500 hover:text-navy-900",
      className
    )}
    style={sxToStyle(sx)}
  >
    {label}
  </button>
);

/* ------------------------------------------------------------------ */
/* Avatars / image lists                                               */
/* ------------------------------------------------------------------ */

const Avatar = ({ children, src, alt, sx, className, style, ...rest }) => {
  const sxProps = sxToProps(sx);
  if (src) {
    return (
      <img
        src={src}
        alt={alt || ""}
        className={cx("h-10 w-10 rounded-full object-cover", sxProps.className, className)}
        style={{ ...style }}
        {...rest}
      />
    );
  }
  return (
    <div
      className={cx(
        "h-10 w-10 rounded-full bg-azure-100 text-azure-700 flex items-center justify-center font-semibold text-sm shrink-0 [&_svg]:w-5 [&_svg]:h-5",
        sxProps.className,
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
};

const ImageList = ({ cols = 3, gap = 8, sx, className, children }) => (
  <div
    className={cx("grid", className)}
    style={{
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: `${gap}px`,
      ...sxToStyle(sx),
    }}
  >
    {children}
  </div>
);
const ImageListItem = ({ sx, children, ...rest }) => (
  <div className="relative overflow-hidden rounded-xl" style={sxToStyle(sx)} {...rest}>
    {children}
  </div>
);
const ImageListItemBar = ({ title, subtitle, position, actionIcon, sx }) => (
  <div
    className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-navy-950/85 to-transparent text-white"
    style={sxToStyle(sx)}
  >
    {title ? <p className="text-sm font-semibold">{title}</p> : null}
    {subtitle ? <p className="text-xs opacity-90">{subtitle}</p> : null}
    {actionIcon ? <div className="mt-1">{actionIcon}</div> : null}
  </div>
);

/* ------------------------------------------------------------------ */
/* Inputs (MUI-compatible surface)                                     */
/* ------------------------------------------------------------------ */

const FormControl = ({
  fullWidth,
  margin,
  error,
  required,
  variant,
  disabled,
  sx,
  className,
  children,
  ...rest
}) => (
  <div
    className={cx(fullWidth ? "w-full" : "inline-flex flex-col", "min-w-0", className)}
    style={sxToStyle(sx)}
    {...rest}
  >
    {children}
  </div>
);

/** MUI `Input` / `OutlinedInput` stand-in rendered as a plain text control. */
const Input = forwardRef(function Input(
  {
    value,
    defaultValue,
    onChange,
    onBlur,
    type = "text",
    placeholder,
    disabled,
    readOnly,
    name,
    id,
    fullWidth,
    size,
    startAdornment,
    endAdornment,
    inputRef,
    inputProps,
    multiline,
    rows,
    sx,
    className,
    style,
    ...rest
  },
  ref
) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className={cx("relative flex items-center", fullWidth && "w-full")} style={style}>
      {startAdornment ? (
        <span className="absolute left-3 flex items-center text-mist-400 pointer-events-none">
          {startAdornment}
        </span>
      ) : null}
      <Tag
        ref={ref}
        id={id}
        name={name}
        type={multiline ? undefined : type}
        value={value ?? defaultValue ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        onBlur={onBlur}
        onChange={(e) =>
          onChange?.({ target: { value: e.target.value, name, id }, stopPropagation: () => {} })
        }
        className={cx(
          "form-input w-full disabled:opacity-50",
          multiline && "min-h-[80px] resize-y",
          startAdornment && "pl-9",
          endAdornment && "pr-9",
          className
        )}
        style={sxToStyle(sx)}
        {...inputProps}
        {...rest}
      />
      {endAdornment ? (
        <span className="absolute right-3 flex items-center text-mist-400">{endAdornment}</span>
      ) : null}
    </div>
  );
});

const OutlinedInput = Input;

const InputLabel = ({ htmlFor, shrink, id, children, sx, className, ...rest }) => (
  <label
    htmlFor={htmlFor}
    id={id}
    className={cx(
      "block text-sm font-medium text-navy-800 mb-1 transition-all",
      !shrink && "absolute -translate-y-1/2",
      className
    )}
    style={sxToStyle(sx)}
    {...rest}
  >
    {children}
  </label>
);

const InputAdornment = ({ position = "end", children, sx, className }) => (
  <span
    className={cx(
      "flex items-center text-mist-400 [&_svg]:w-4 [&_svg]:h-4",
      position === "start" && "mr-2",
      position === "end" && "ml-2",
      className
    )}
    style={sxToStyle(sx)}
  >
    {children}
  </span>
);

const MenuItem = ({
  value,
  onClick,
  selected,
  disabled,
  dense,
  divider,
  sx,
  className,
  children,
  ...rest
}) => (
  <li
    role="menuitem"
    aria-selected={!!selected}
    onClick={disabled ? undefined : onClick}
    data-value={value}
    className={cx(
      "px-4 py-2.5 text-sm flex items-center gap-2 transition-colors",
      selected ? "bg-azure-50 text-azure-700 font-medium" : "text-navy-900 hover:bg-mist-100",
      disabled && "opacity-40 pointer-events-none",
      divider && "border-b border-mist-100",
      sxToProps(sx).className,
      className
    )}
    style={sxToStyle(sx)}
    {...rest}
  >
    {children}
  </li>
);

const Menu = ({
  anchorEl,
  open = false,
  onClose,
  children,
  sx,
  className,
  getContentAnchorEl,
  anchorOrigin,
  transformOrigin,
  ...rest
}) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <ul
        role="menu"
        className={cx(
          "fixed z-50 min-w-[180px] bg-white rounded-xl border border-mist-200 shadow-lift py-1 animate-fadeIn overflow-auto",
          sxToProps(sx).className,
          className
        )}
        style={{
          top: anchorEl?.getBoundingClientRect?.().bottom ?? 0,
          left: anchorEl?.getBoundingClientRect?.().left ?? 0,
          maxHeight: "60vh",
          ...sxToStyle(sx),
        }}
        {...rest}
      >
        {children}
      </ul>
    </>
  );
};

const Select = forwardRef(function Select(
  {
    value = "",
    onChange,
    label,
    id,
    name,
    required,
    disabled,
    multiple,
    displayEmpty,
    renderValue,
    labelId,
    size,
    fullWidth,
    input,
    SelectProps,
    FormControlProps,
    inputProps,
    children,
    sx,
    className,
    style,
    ...rest
  },
  ref
) {
  const genId = useId();
  const selectId = id || labelId || genId;
  const items = React.Children.toArray(children);
  const [internal, setInternal] = useState(
    multiple ? Array.isArray(value) ? value : [] : ""
  );
  const current = value !== undefined ? value : internal;

  const handle = (e) => {
    const next = multiple
      ? Array.from(e.target.selectedOptions).map((o) => o.value)
      : e.target.value;
    if (value === undefined) setInternal(next);
    onChange?.({
      target: { value: next, name, id: selectId },
      stopPropagation: () => {},
    });
  };

  let display;
  if (renderValue) display = renderValue(current);
  else if (multiple) display = null;
  else {
    const match = items.find(
      (c) => React.isValidElement(c) && String(c.props.value) === String(current)
    );
    display = match ? match.props.children : current;
  }

  return (
    <div className={cx("relative", fullWidth && "w-full", className)} style={style}>
      {label ? (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-navy-800 mb-1"
        >
          {label}
          {required ? <span className="ml-0.5 font-bold text-red-500">*</span> : null}
        </label>
      ) : null}
      <select
        ref={ref}
        id={selectId}
        name={name}
        value={current}
        multiple={multiple}
        disabled={disabled}
        required={required}
        onChange={handle}
        className="form-input w-full appearance-none disabled:opacity-50"
        style={sxToStyle(sx)}
        {...rest}
      >
        {displayEmpty ? <option value="">{display || ""}</option> : null}
        {items}
      </select>
    </div>
  );
});

const TextField = forwardRef(function TextField(
  {
    label,
    value,
    defaultValue,
    onChange,
    onBlur,
    type = "text",
    placeholder,
    required,
    disabled,
    error,
    helperText,
    fullWidth,
    multiline,
    rows,
    maxRows,
    minRows,
    size,
    variant,
    margin,
    name,
    id,
    placeholder: _ph,
    InputProps,
    inputProps,
    InputLabelProps,
    FormHelperTextProps,
    select,
    SelectProps,
    type: _t,
    sx,
    className,
    style,
    children,
    ...rest
  },
  ref
) {
  const genId = useId();
  const fieldId = id || name || genId;
  const isSelect = !!select;
  const Tag = multiline ? "textarea" : "select";

  const control = isSelect ? (
    <select
      ref={ref}
      id={fieldId}
      name={name}
      value={value ?? ""}
      disabled={disabled}
      required={required}
      onChange={(e) => onChange?.({ target: { value: e.target.value, name, id: fieldId } })}
      className="form-input w-full disabled:opacity-50"
      style={sxToStyle(sx)}
      {...rest}
    >
      {select === true
        ? children_shim(SelectProps, inputProps)
        : select}
    </select>
  ) : (
    <Tag
      ref={ref}
      id={fieldId}
      name={name}
      type={isSelect ? undefined : type}
      value={value ?? defaultValue ?? ""}
      rows={rows}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      onBlur={onBlur}
      onChange={(e) =>
        onChange?.({ target: { value: e.target.value, name, id: fieldId } })
      }
      className={cx(
        "form-input w-full disabled:opacity-50",
        multiline && "min-h-[80px] resize-y",
        InputProps?.startAdornment && "pl-9",
        InputProps?.endAdornment && "pr-9",
        className
      )}
      style={sxToStyle(sx)}
      {...rest}
    />
  );

  return (
    <div className={cx(fullWidth ? "w-full" : "inline-flex flex-col", "min-w-0")} style={style}>
      {label ? (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-navy-800 mb-1"
        >
          {label}
          {required ? <span className="ml-0.5 font-bold text-red-500">*</span> : null}
        </label>
      ) : null}
      <div className="relative flex items-center">
        {InputProps?.startAdornment ? (
          <span className="absolute left-3 flex items-center text-mist-400 pointer-events-none">
            {InputProps.startAdornment}
          </span>
        ) : null}
        {control}
        {InputProps?.endAdornment ? (
          <span className="absolute right-3 flex items-center text-mist-400">
            {InputProps.endAdornment}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{helperText}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-mist-500">{helperText}</p>
      ) : null}
    </div>
  );
});

/* `select` prop children helper (SelectProps is a partial <Select>). */
function children_shim(SelectProps, inputProps) {
  if (SelectProps?.children) return SelectProps.children;
  if (inputProps?.children) return inputProps.children;
  return null;
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

const Table = ({ size, sx, className, style, children, ...rest }) => (
  <table
    className={cx("w-full border-collapse text-sm", sxToProps(sx).className, className) || undefined}
    style={sxToStyle(sx)}
    {...rest}
  >
    {children}
  </table>
);
const TableContainer = ({ component: Component = "div", sx, className, style, children, ...rest }) => (
  <Component
    className={cx("re-table-wrap", sxToProps(sx).className, className) || undefined}
    style={sxToStyle(sx)}
    {...rest}
  >
    {children}
  </Component>
);
const TableHead = ({ sx, className, children, ...rest }) => (
  <thead className={cx(sxToProps(sx).className, className)} style={sxToStyle(sx)} {...rest}>
    {children}
  </thead>
);
const TableBody = ({ sx, className, children, ...rest }) => (
  <tbody className={cx(sxToProps(sx).className, className)} style={sxToStyle(sx)} {...rest}>
    {children}
  </tbody>
);
const TableRow = ({ hover, selected, sx, className, children, ...rest }) => (
  <tr
    className={cx(
      "border-b border-mist-200 last:border-0",
      hover && "hover:bg-mist-50 transition-colors",
      selected && "bg-azure-50",
      sxToProps(sx).className,
      className
    )}
    style={sxToStyle(sx)}
    {...rest}
  >
    {children}
  </tr>
);
const TableCell = ({ align, head, variant, sx, className, style, children, colSpan, ...rest }) => {
  const Tag = head ? "th" : "td";
  const alignCls = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align] || "";
  return (
    <Tag
      colSpan={colSpan}
      scope={head ? "col" : undefined}
      className={cx(
        "px-4 py-3",
        head ? "text-left text-xs font-semibold uppercase tracking-wide text-mist-500 bg-mist-50" : alignCls,
        sxToProps(sx).className,
        className
      ) || undefined}
      style={{ ...sxToStyle(sx), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const TablePagination = ({ count, page, rowsPerPage, onPageChange, component, sx }) => (
  <div className="flex items-center justify-between px-4 py-3 text-sm" style={sxToStyle(sx)}>
    <span className="text-mist-500">
      {count ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, count)} of ${count}` : "0 of 0"}
    </span>
    <input
      type="number"
      min={1}
      max={Math.max(1, Math.ceil(count / rowsPerPage))}
      value={page + 1}
      onChange={(e) => onPageChange?.(e, Number(e.target.value) - 1)}
      className="form-input w-20 text-center"
    />
  </div>
);

export {
  Box,
  Grid,
  Stack,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Paper,
  Divider,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  CircularProgress,
  Skeleton,
  Alert,
  AlertTitle,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Avatar,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  FormControl,
  Input,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
};
