import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";

import { useFetch, usePatch, useToast } from "../../../hooks";
import { formatDateForDb, formatError } from "../../../helpers";

const EditUser = ({ item, modal, fetchUsers }) => {
  const addToast = useToast();

  const formRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const employeeNumberRef = useRef();
  const genderRef = useRef();
  const dateOfBirthRef = useRef();
  const designationRef = useRef();
  const departmentRef = useRef();
  const jobTitleRef = useRef();
  const nationalIdRef = useRef();
  const phoneRef = useRef();

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

  const [formData, setFormData] = useState({
    first_name: item.first_name,
    middle_name: item.middle_name,
    last_name: item.last_name,
    employee_number: item.employee_number,
    gender: item.gender,
    date_of_birth: item.date_of_birth ? new Date(item.date_of_birth) : null,
    designation: item.designation,
    department_id: item.department_id,
    job_title_id: item.job_title_id,
    national_id: item.national_id,
    phone: item.phone,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/users/${item.id}`,
    {
      ...formData,
      date_of_birth: formData.date_of_birth
        ? formatDateForDb(formData.date_of_birth)
        : null,
    }
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
              md={4}
              sm={6}
              xs={12}
            >
              <TextField
                ref={firstNameRef}
                label="First Name"
                fullWidth
                required
                defaultValue={formData.first_name}
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
                defaultValue={formData.middle_name}
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
                defaultValue={formData.last_name}
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
                defaultValue={formData.employee_number}
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
                value={formData.gender}
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
                  setFormData({ ...formData, date_of_birth: value })
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
                value={formData.designation}
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
                value={
                  departments.find((e) => e.id === formData.department_id) ||
                  null
                }
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
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={jobTitles.find((e) => e.id === formData.job_title_id)}
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
                defaultValue={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
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
                defaultValue={formData.national_id}
                onChange={(value) =>
                  setFormData({ ...formData, national_id: value })
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

export default EditUser;
