import React from "react";
import { Link } from "react-router-dom";

/**
 * Where a user lands when they are signed in but hold nothing to open.
 *
 * This is deliberately not the sign-in page. Sending somebody who is
 * genuinely authenticated back to a login form tells them their account is
 * broken, when in fact the only thing missing is somebody here to grant them a
 * module — which is a conversation with an administrator, not a password.
 */
const NoAccess = () => {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-azure-50 text-azure-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="size-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <h1 className="mt-4 text-lg font-semibold text-navy-900">
        Nothing is set up for you yet
      </h1>

      <p className="mt-2 text-sm text-mist-500">
        You are signed in, but no module has been assigned to your account. Ask
        an administrator to grant you access to the area you work in.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn btn-secondary"
        >
          Check again
        </button>
        <Link to="/login" className="btn btn-ghost">
          Sign in as someone else
        </Link>
      </div>
    </div>
  );
};

export default NoAccess;
