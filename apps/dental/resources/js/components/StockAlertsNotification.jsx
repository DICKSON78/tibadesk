import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faCircleExclamation,
  faCircleInfo,
  faXmark,
  faChevronDown,
  faChevronUp,
  faBoxesStacked,
  faPills,
} from "@fortawesome/free-solid-svg-icons";

import { useFetch } from "../hooks";

const StockAlertsNotification = ({ onNavigateToAlerts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch stock alerts summary
  const { data: summary, loading } = useFetch(
    "api/stock-alerts/summary",
    {},
    true,
    {
      out_of_stock_count: 0,
      expired_count: 0,
      expiring_soon_count: 0,
      total_alerts: 0,
    }
  );

  // Only show if there are alerts
  const hasAlerts = summary.total_alerts > 0;

  if (!hasAlerts || !isVisible) {
    return null;
  }

  const getSeverity = () => {
    if (summary.expired_count > 0 || summary.out_of_stock_count > 0) {
      return "error";
    } else if (summary.expiring_soon_count > 0) {
      return "warning";
    }
    return "info";
  };

  const getIcon = () => {
    if (summary.expired_count > 0 || summary.out_of_stock_count > 0) {
      return faCircleExclamation;
    } else if (summary.expiring_soon_count > 0) {
      return faTriangleExclamation;
    }
    return faCircleInfo;
  };

  const getTitle = () => {
    if (summary.expired_count > 0) {
      return `${summary.expired_count} items have expired!`;
    } else if (summary.out_of_stock_count > 0) {
      return `${summary.out_of_stock_count} items are out of stock!`;
    } else if (summary.expiring_soon_count > 0) {
      return `${summary.expiring_soon_count} items expiring soon`;
    }
    return "Stock Alerts";
  };

  const isError = getSeverity() === "error";
  const isWarning = getSeverity() === "warning";

  return (
    <div
      className={`mb-5 rounded-2xl border-2 bg-white shadow-sm overflow-hidden ${
        isError
          ? "border-red-400"
          : isWarning
            ? "border-amber-400"
            : "border-azure-400"
      }`}
    >
      <div
        className={`px-5 py-4 flex flex-wrap items-center justify-between gap-3 ${
          isError
            ? "bg-red-50"
            : isWarning
              ? "bg-amber-50"
              : "bg-azure-50"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <FontAwesomeIcon
            icon={getIcon()}
            className={`w-5 h-5 shrink-0 ${
              isError
                ? "text-red-600"
                : isWarning
                  ? "text-amber-600"
                  : "text-azure-600"
            }`}
          />
          <h2
            className={`text-base font-bold truncate ${
              isError
                ? "text-red-800"
                : isWarning
                  ? "text-amber-800"
                  : "text-navy-900"
            }`}
          >
            {getTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`badge ${
              isError
                ? "badge-red"
                : isWarning
                  ? "badge-yellow"
                  : "badge-azure"
            }`}
          >
            {summary.total_alerts}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
            className="p-1.5 rounded-lg text-mist-500 hover:text-navy-900 hover:bg-white/70 transition-colors"
          >
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className="w-4 h-4"
            />
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss"
            className="p-1.5 rounded-lg text-mist-500 hover:text-navy-900 hover:bg-white/70 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="px-5 py-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summary.out_of_stock_count > 0 ? (
              <div className="alert alert-error">
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  className="w-5 h-5 shrink-0"
                />
                <div>
                  <p className="text-lg font-bold leading-tight">
                    {summary.out_of_stock_count}
                  </p>
                  <p className="text-sm">Out of Stock Items</p>
                </div>
              </div>
            ) : null}
            {summary.expired_count > 0 ? (
              <div className="alert alert-error">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="w-5 h-5 shrink-0"
                />
                <div>
                  <p className="text-lg font-bold leading-tight">
                    {summary.expired_count}
                  </p>
                  <p className="text-sm">Expired Items</p>
                </div>
              </div>
            ) : null}
            {summary.expiring_soon_count > 0 ? (
              <div className="alert alert-warning">
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className="w-5 h-5 shrink-0"
                />
                <div>
                  <p className="text-lg font-bold leading-tight">
                    {summary.expiring_soon_count}
                  </p>
                  <p className="text-sm">Expiring Soon</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() =>
                onNavigateToAlerts &&
                onNavigateToAlerts("/inventory-management/stock-alerts")
              }
            >
              <FontAwesomeIcon icon={faBoxesStacked} className="w-4 h-4" />
              View All Alerts
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                onNavigateToAlerts &&
                onNavigateToAlerts("/medicine-center/medicine-alerts")
              }
            >
              <FontAwesomeIcon icon={faPills} className="w-4 h-4" />
              Medicine Alerts
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StockAlertsNotification;
