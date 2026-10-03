import React from "react";
import { alpha } from "../../themes/app";

const InfoCard = ({ title, count, icon, color = "#2D4EA8", onClick, ...rest }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      className={`stat-card group ${onClick ? "cursor-pointer" : "cursor-default"}`}
      {...rest}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-mist-500 truncate">{title}</p>
          <p
            className="mt-2 text-2xl font-bold text-navy-900"
            style={{ color: color }}
          >
            {count}
          </p>
        </div>
        <div
          className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-white text-lg shadow-sm"
          style={{ background: alpha(color, 0.9) }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
