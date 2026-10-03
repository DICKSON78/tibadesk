import React, { createContext, useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const ToastContext = createContext();

const SEVERITIES = {
  success: {
    icon: faCircleCheck,
    className: "alert-success",
    iconClass: "text-emerald-600",
  },
  error: {
    icon: faCircleExclamation,
    className: "alert-error",
    iconClass: "text-red-600",
  },
  warning: {
    icon: faTriangleExclamation,
    className: "alert-warning",
    iconClass: "text-amber-600",
  },
  info: {
    icon: faCircleInfo,
    className: "alert-info",
    iconClass: "text-azure-600",
  },
};

const ToastContextProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (toasts.length) {
      const timer = window.setTimeout(
        () => setToasts((current) => current.slice(1)),
        5000
      );
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [toasts]);

  const addToast = useCallback((toast) => {
    setToasts((current) => {
      const duplicate = current.some(
        (t) => t.message === toast.message && t.severity === toast.severity
      );
      if (duplicate) {
        return current;
      }
      return [...current, { ...toast, id: Date.now() + Math.random() }];
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => {
          const severity = SEVERITIES[toast.severity] || SEVERITIES.info;
          const ToastIcon = severity.icon;

          return (
            <div
              key={toast.id}
              role="alert"
              className={`${severity.className} shadow-lift toast-enter`}
            >
              <FontAwesomeIcon
                icon={ToastIcon}
                className={`alert-icon w-4 h-4 ${severity.iconClass}`}
              />
              <span className="flex-grow">{toast.message}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export { ToastContextProvider };
export default ToastContext;
