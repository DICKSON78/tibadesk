import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";

import { usePatch, useToast } from "../../../hooks";
import { formatError, getPrivileges } from "../../../helpers";

const EditUserAccessDetails = ({ item, modal, fetchUsers }) => {
  const addToast = useToast();

  const formRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: item.username,
    password: undefined,
    privileges: item.privileges.map((e) => e.privilege),
    status: item.status,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/users/${item.id}`,
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchUsers();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch();
    }
  };

  const getPrivilegesTree = (items) => {
    if (!items) return null;

    return items
      .filter((e) => typeof e.show === "undefined" || e.show)
      .map((e) => {
        const hasChildren = e.children && e.children.length;
        return hasChildren ? (
          <Paper
            key={e.value}
            variant="outlined"
            sx={{ my: 1, px: 2, py: 1 }}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                md={3}
                sm={6}
                xs={12}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.privileges.indexOf(e.value) !== -1}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          privileges: event.target.checked
                            ? [...formData.privileges, e.value]
                            : formData.privileges.filter((f) => f !== e.value),
                        })
                      }
                    />
                  }
                  label={e.label}
                />
              </Grid>
              <Grid
                item
                md={9}
                sm={12}
                xs={12}
              >
                {getPrivilegesTree(e.children)}
              </Grid>
            </Grid>
          </Paper>
        ) : (
          <FormControlLabel
            key={e.value}
            control={
              <Checkbox
                checked={formData.privileges.indexOf(e.value) !== -1}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    privileges: event.target.checked
                      ? [...formData.privileges, e.value]
                      : formData.privileges.filter((f) => f !== e.value),
                  })
                }
              />
            }
            label={e.label}
          />
        );
      });
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              md={6}
              sm={6}
              xs={12}
            >
              <TextField
                ref={usernameRef}
                label="Username"
                fullWidth
                required
                defaultValue={formData.username}
                onChange={(value) =>
                  setFormData({ ...formData, username: value })
                }
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={6}
              xs={12}
            >
              <TextField
                ref={passwordRef}
                label="Password"
                helperText="Leave blank to keep the current one."
                fullWidth
                type={showPassword ? "text" : "password"}
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
                  setFormData({ ...formData, password: value })
                }
              />
            </Grid>
          </Grid>

          <Card
            variant="outlined"
            sx={{ mt: 2 }}
          >
            <CardHeader title="Access Privileges" />
            <Divider />
            <CardContent>
              {getPrivilegesTree(
                getPrivileges(window.user?.clinic?.preferences || [])
              )}
            </CardContent>
          </Card>

          <Box mt={2}>
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked={item.status === "Active"}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      status: event.target.checked ? "Active" : "Inactive",
                    })
                  }
                />
              }
              label="Active"
            />
          </Box>
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

export default EditUserAccessDetails;
