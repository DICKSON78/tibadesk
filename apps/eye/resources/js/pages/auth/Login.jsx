import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import {
  LockRounded as LockIcon,
  Person2Rounded as UsernameIcon,
  VisibilityOffRounded as VisibilityOffIcon,
  VisibilityRounded as VisibilityIcon,
} from "@mui/icons-material";
import Form from "../../components/Form";
import TextField from "../../components/TextField";

import { usePost } from "../../hooks";
import { formatError } from "../../helpers";
import { setToken, clearToken } from '../../lib/session';

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
    document.title = `Login - ${window.APP_NAME || 'Application'}`;
  }, []);

  useEffect(() => {
    if (data) {
      window.user = data.data.user;
      clearToken();
      setToken( data.data.token);

      const u = data.data.user || {};
      let p = u.privileges || {};
      // Some backends send privileges as a JSON string
      if (typeof p === "string") {
        try { p = JSON.parse(p); } catch (e) { p = {}; }
      }

      const isGranted = (v) => v === true || v === 1 || v === "1" || v === "true" || v === "Yes" || v === "yes";

      const defaultRoute = (() => {
        const candidates = [
          isGranted(p.dashboard) ? "/dashboard" : null,
          isGranted(p.reception) ? "/reception/dashboard" : null,
          isGranted(p.payment_center) ? "/payment-center/dashboard" : null,
          isGranted(p.consultation_room) ? "/consultation-room/dashboard" : null,
          isGranted(p.optician_center) ? "/optician-center/dashboard" : null,
          isGranted(p.medicine_center) ? "/medicine-center/dashboard" : null,
          isGranted(p.procedure_room) ? "/procedure-room/dashboard" : null,
          isGranted(p.inventory_management) ? "/inventory-management/dashboard" : null,
          isGranted(p.marketing) ? "/marketing/dashboard" : null,
          isGranted(p.financial_management) ? "/financial-management/dashboard" : null,
          isGranted(p.user_management) ? "/user-management/users" : null,
          isGranted(p.settings) ? "/settings/preferences" : null,
        ].filter(Boolean);
        // Fallback: if no privileges found, send back to login (no dashboard access)
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
      return (
        <Alert
          sx={{
            mb: 2,
            border: "none",
          }}
          severity={error ? "error" : "success"}
        >
          {error ? formatError(error) : data ? data.message : null}
        </Alert>
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      <Box p={2}>
        {handleFeedback()}
        <Form
          ref={formRef}
          onSubmit={handleSubmit}
        >
          <TextField
            ref={usernameRef}
            placeholder="Username"
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <UsernameIcon />
                </InputAdornment>
              ),
            }}
            containerProps={{ sx: { mb: 2 } }}
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
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </InputAdornment>
              ),
            }}
            containerProps={{ sx: { mb: 2 } }}
            onChange={(value) => setFormData({ ...formData, password: value })}
          />
          <Button
            disabled={loading}
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            onClick={handleSubmit}
          >
            Login
          </Button>
        </Form>
      </Box>
      {loading && (
        <LinearProgress
          sx={{
            borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
            borderBottomRightRadius: (theme) => theme.shape.borderRadius,
          }}
        />
      )}
    </React.Fragment>
  );
};

export default LogIn;
