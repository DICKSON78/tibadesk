import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const SIZE_CLASSES = {
  xs: "max-w-sm",
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-3xl",
};

const Modal = (props, ref) => {
  const [state, setState] = useState({
    open: false,
    title: undefined,
    subtitle: undefined,
    component: null,
    size: "sm",
  });

  const close = useCallback(() => {
    setState((prev) => ({
      ...prev,
      open: false,
      title: undefined,
      subtitle: undefined,
      component: null,
    }));
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open: (title, component, size = "sm", subtitle = "") =>
        setState({ open: true, title, subtitle, component, size }),
      close,
    }),
    [close]
  );

  useEffect(() => {
    if (!state.open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [state.open, close]);

  if (!state.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={state.title}
        className={`relative bg-white rounded-2xl ${
          SIZE_CLASSES[state.size] || SIZE_CLASSES.sm
        } w-full max-h-[90vh] overflow-y-auto shadow-glow animate-fadeIn`}
      >
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-mist-100 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-navy-900">{state.title}</h3>
            {state.subtitle ? (
              <p className="text-sm text-mist-500 mt-0.5">{state.subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-mist-400 hover:text-mist-600 transition-colors p-1 rounded-lg hover:bg-mist-100 shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{state.component}</div>
      </div>
    </div>
  );
};

export default forwardRef(Modal);
