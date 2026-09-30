import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUser,
  faEye,
  faEyeSlash,
  faCircleCheck,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import Form from "../../components/Form";
import TextField from "../../components/TextField";

import { usePost } from "../../hooks";
import { formatError } from "../../helpers";
import { setToken } from '../../lib/session';

const LogIn = () => {
  const navigate = useNavigate();

  const formRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [formData, setFormData] = useState({
    username: undefined,
    password: undefined,
  });
  const { data, loading, error, handlePost } = usePost(
    "/api/auth/login",
    formData
  );

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = `Login - ${window.APP_NAME || "Application"}`;
  }, []);

  useEffect(() => {
    if (data) {
        window.user = data.data.user;
        setToken(data.data.token);

      const u = data.data.user || {};
      let p = u.privileges || {};
      // Some backends send privileges as a JSON string
      if (typeof p === "string") {
        try {
          p = JSON.parse(p);
        } catch (e) {
          p = {};
        }
      }

      const isGranted = (v) =>
        v === true ||
        v === 1 ||
        v === "1" ||
        v === "true" ||
        v === "Yes" ||
        v === "yes";

      const defaultRoute = isGranted(p.dashboard)
        ? "/dashboard"
        : (() => {
            const candidates = [
              isGranted(p.reception) ? "/patient-records/patients" : null,
              isGranted(p.payment_center) ? "/payment-center/dashboard" : null,
              isGranted(p.consultation_room)
                ? "/consultation-room/dashboard"
                : null,
              isGranted(p.dental_lab) ? "/dental-lab/dashboard" : null,
              isGranted(p.medicine_center) ? "/medicine-center/dashboard" : null,
              isGranted(p.procedure_room) ? "/procedure-room/dashboard" : null,
              isGranted(p.dispensing) ? "/dispensing/dashboard" : null,
              isGranted(p.other_dispensing)
                ? "/other-dispensing/dashboard"
                : null,
              isGranted(p.inventory_management)
                ? "/inventory-management/dashboard"
                : null,
              isGranted(p.marketing) ? "/marketing/dashboard" : null,
              isGranted(p.financial_management)
                ? "/financial-management/dashboard"
                : null,
              isGranted(p.user_management) ? "/user-management/users" : null,
              isGranted(p.settings) ? "/settings/preferences" : null,
            ].filter(Boolean);
            return candidates[0] || "/login";
          })();

      // Immediate hard redirect to ensure leaving /login even if router is cached
      try {
        navigate(defaultRoute, { replace: true });
      } catch (_) {}
      window.location.replace(defaultRoute);
    }
  }, [data, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  const handleFeedback = () => {
    if (data || error) {
      const message = error ? formatError(error) : data ? data.message : null;

      return (
        <div
          className={`alert ${error ? "alert-error" : "alert-success"} mb-5`}
          role="alert"
        >
          <FontAwesomeIcon
            icon={error ? faCircleExclamation : faCircleCheck}
            className="w-5 h-5 shrink-0"
          />
          <span>{message}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      <div className="card-body">
        {handleFeedback()}
        <Form ref={formRef} onSubmit={handleSubmit}>
          <TextField
            ref={usernameRef}
            placeholder="Username"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
              ),
            }}
            containerProps={{ className: "mb-4" }}
            onChange={(value) => setFormData({ ...formData, username: value })}
          />
          <TextField
            ref={passwordRef}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <FontAwesomeIcon icon={faLock} className="w-4 h-4" />
              ),
              endAdornment: (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer text-mist-400 hover:text-azure-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEye : faEyeSlash}
                    className="w-4 h-4"
                  />
                </button>
              ),
            }}
            containerProps={{ className: "mb-6" }}
            onChange={(value) => setFormData({ ...formData, password: value })}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full"
            onClick={handleSubmit}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </Form>
      </div>
      {loading ? (
        <div className="h-1 w-full overflow-hidden rounded-b-2xl bg-mist-200">
          <div className="h-full w-1/2 bg-azure-600 animate-progress" />
        </div>
      ) : null}
    </React.Fragment>
  );
};

export default LogIn;
