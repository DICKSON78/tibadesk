import React, { forwardRef, useImperativeHandle, useRef } from "react";

const Form = ({ children, ...rest }, ref) => {
  const formRef = useRef();

  const allFields = useRef(0);
  const validFields = useRef(0);

  const _validateInputs = (children) => {
    if (!children) return true;

    if (typeof children.forEach !== "function") {
      children = [children];
    }

    children
      .filter((e) => !!e)
      .forEach((e) => {
        const hasChildren = e.props && e.props.children;
        if (hasChildren) {
          _validateInputs(e.props.children);
        } else {
          if (e.ref && e.props && (e.props.required || e.props.rules)) {
            const component = e.ref.current;
            if (component) {
              allFields.current++;
              if (component.validate()) {
                validFields.current++;
              }
            }
          }
        }
      });
  };

  const _clearInputs = (children) => {
    if (!children) return true;

    if (typeof children.forEach !== "function") {
      children = [children];
    }

    children
      .filter((e) => !!e)
      .forEach((e) => {
        const hasChildren = e.props && e.props.children;
        if (hasChildren) {
          _clearInputs(e.props.children);
        } else {
          if (e.ref) {
            const component = e.ref.current;
            if (component && typeof component.setValue === "function") {
              component.setValue(null);
            }
          }
        }
      });
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      allFields.current = 0;
      validFields.current = 0;
      _validateInputs(children);
      return allFields.current === validFields.current;
    },
    clear: () => _clearInputs(children),
  }));

  return (
    <form
      ref={formRef}
      autoComplete={"off"}
      {...rest}
    >
      {children}
    </form>
  );
};

export default forwardRef(Form);
