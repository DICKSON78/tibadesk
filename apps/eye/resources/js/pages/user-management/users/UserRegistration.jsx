import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import SelectClinic from "../../../components/SelectClinic";

import { useFetch, usePost, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getPrivileges } from "../../../helpers";

const UserRegistration = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const clinicRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const usernameRef = useRef();
  const employeeNumberRef = useRef();
  const genderRef = useRef();
  const dateOfBirthRef = useRef();
  const designationRef = useRef();
  const departmentRef = useRef();
  const jobTitleRef = useRef();
  const nationalIdRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();

  const { data: departments } = useFetch(
    "api/departments",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: jobTitles } = useFetch(
    "api/job-titles",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    clinic_id: undefined,
    first_name: undefined,
    middle_name: undefined,
    last_name: undefined,
    username: undefined,
    employee_number: undefined,
    gender: undefined,
    date_of_birth: null,
    designation: undefined,
    department_id: undefined,
    job_title_id: undefined,
    national_id: undefined,
    phone: undefined,
    password: undefined,
    privileges: [],
  });

  const { data, loading, error, handlePost } = usePost("api/users", {
    ...formData,
    date_of_birth: formData.date_of_birth
      ? formatDateForDb(formData.date_of_birth)
      : null,
  });

  useEffect(() => {
    document.title = `User Registration - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });

      window.setTimeout(() => {
        navigate("/user-management/users");
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
      handlePost();
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
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "User Management" },
        { title: "User Registration" },
      ]}
    >
      <Card>
        <PageHeader title="User Registration" />
        <Divider />
        <CardContent>
          <Form ref={formRef}>
            <Grid
              container
              spacing={2}
            >
              {window.user.role === "Admin" ? (
                <Grid
                  item
                  md={4}
                  sm={6}
                  xs={12}
                >
                  <SelectClinic
                    ref={clinicRef}
                    required
                    onChange={(value) =>
                      setFormData({ ...formData, clinic_id: value?.id })
                    }
                  />
                </Grid>
              ) : null}
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={firstNameRef}
                  label="First Name"
                  fullWidth
                  required
                  onChange={(value) =>
                    setFormData({ ...formData, first_name: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={middleNameRef}
                  label="Middle Name"
                  fullWidth
                  onChange={(value) =>
                    setFormData({ ...formData, middle_name: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={lastNameRef}
                  label="Last Name"
                  fullWidth
                  required
                  onChange={(value) =>
                    setFormData({ ...formData, last_name: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={employeeNumberRef}
                  label="Employee Number"
                  fullWidth
                  onChange={(value) =>
                    setFormData({ ...formData, employee_number: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={genderRef}
                  label="Gender"
                  fullWidth
                  required
                  options={["Male", "Female"]}
                  onChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <DatePicker
                  ref={dateOfBirthRef}
                  label="Date of Birth"
                  fullWidth
                  value={formData.date_of_birth}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      date_of_birth: !isNaN(value) ? value : null,
                    })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={designationRef}
                  label="Designation"
                  fullWidth
                  options={["Doctor", "Other"]}
                  onChange={(value) =>
                    setFormData({ ...formData, designation: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={departmentRef}
                  label="Department"
                  fullWidth
                  required
                  options={departments}
                  optionsLabel="name"
                  optionsValue="id"
                  onChange={(value) =>
                    setFormData({ ...formData, department_id: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={jobTitleRef}
                  label="Job Title"
                  fullWidth
                  required
                  options={jobTitles}
                  optionsLabel="name"
                  optionsValue="id"
                  onChange={(value) =>
                    setFormData({ ...formData, job_title_id: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={phoneRef}
                  label="Phone Number"
                  fullWidth
                  onChange={(value) =>
                    setFormData({ ...formData, phone: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={nationalIdRef}
                  label="National ID"
                  fullWidth
                  onChange={(value) =>
                    setFormData({ ...formData, national_id: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={usernameRef}
                  label="Username"
                  fullWidth
                  required
                  onChange={(value) =>
                    setFormData({ ...formData, username: value })
                  }
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <TextField
                  ref={passwordRef}
                  label="Password"
                  type={showPassword ? "text" : "password"}
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
          </Form>
        </CardContent>
        <Divider />
        {loading && <LinearProgress />}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            disabled={loading}
            variant="contained"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default UserRegistration;
