import React from "react";

const Header = ({
  title,
  subtitle,
  leading,
  trailing,
  containerProps,
  titleProps,
}) => {
  return (
    <div
      className="flex flex-row items-center flex-wrap gap-3 mb-5"
      {...containerProps}
    >
      {leading}
      {title ? (
        <div className="flex-1 min-w-0">
          <h1
            className="text-xl font-bold text-navy-900 truncate"
            {...titleProps}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-mist-500 mt-0.5">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      {trailing ? (
        <div className="flex items-center gap-2 flex-wrap">{trailing}</div>
      ) : null}
    </div>
  );
};

const Page = ({ children }) => {
  return <div className="content-area animate-fadeIn">{children}</div>;
};

export { Header };
export default Page;
