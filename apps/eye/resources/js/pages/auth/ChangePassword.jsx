import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardActions,
  CardContent,
  Grid,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import Form from "../../components/Form";
import TextField from "../../components/TextField";

import { usePost } from "../../hooks";
import { formatError } from "../../helpers";

const ChangePassword = ({ modal }) => {
  const formRef = useRef();
  const currentPasswordRef = useRef();
  const newPasswordRef = useRef();

  const [formData, setFormData] = useState({
    current_password: undefined,
    new_password: undefined,
  });
  const { data, loading, error, handlePost } = usePost(
    "api/auth/change-password",
    formData
  );

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePost();
    }
  };

  useEffect(() => {
    if (data) {
      window.setTimeout(() => {
        modal.close();
      }, 1000);
    }
  }, [data]);

  const handleFeedback = () => {
    if (data || error) {
      return (
        <Alert
          sx={{ mb: 2 }}
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
      {loading && <LinearProgress />}
      <CardContent>
        {handleFeedback()}
        <Form ref={formRef}>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={currentPasswordRef}
                type={showPassword ? "text" : "password"}
                label="Current Password"
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </InputAdornment>
                  ),
                }}
                onChange={(value) =>
                  setFormData({ ...formData, current_password: value })
                }
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={newPasswordRef}
                type={showPassword ? "text" : "password"}
                label="New Password"
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      sx={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </InputAdornment>
                  ),
                }}
                onChange={(value) =>
                  setFormData({ ...formData, new_password: value })
                }
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          sx={{ mr: 1 }}
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default ChangePassword;
