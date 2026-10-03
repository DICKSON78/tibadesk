import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";

import moment from "moment";
import { useFetch, usePost, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getValidationRules,
  validateInteger,
} from "../../../helpers";

const validationRules = getValidationRules();

const CreatePatient = ({ modal, fetchPatients }) => {
  const addToast = useToast();
  const navigate = useNavigate();

  const formRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const genderRef = useRef();
  const dateOfBirthRef = useRef();
  const addressRef = useRef();
  const nationalIdRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const occupationRef = useRef();
  const paymentModeRef = useRef();
  const informationSourceRef = useRef();

  const marketingEnabled =
    window.user.clinic?.preferences?.find((e) => e.key === "MARKETING_MODULE")
      ?.value === "Yes";

  const { data: paymentModes } = useFetch(
    "api/payment-modes",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const { data: informationSources, handleFetch: fetchInformationSources } =
    useFetch(
      "api/marketing/information-sources",
      {
        status: "Active",
        per_page: 500,
      },
      false,
      [],
      (response) => response.data.data.data
    );

  const [formData, setFormData] = useState({
    first_name: undefined,
    middle_name: undefined,
    last_name: undefined,
    gender: undefined,
    date_of_birth: null,
    region_id: undefined,
    district_id: undefined,
    ward_id: undefined,
    address: undefined,
    national_id: undefined,
    phone: undefined,
    email: undefined,
    occupation: undefined,
    payment_mode_id: undefined,
    info_source_id: undefined,
    is_vip: false,
  });

  const { data, loading, error, handlePost } = usePost("api/patients", {
    ...formData,
    date_of_birth: formData.date_of_birth
      ? formatDateForDb(formData.date_of_birth)
      : null,
  });

  useEffect(() => {
    if (marketingEnabled) {
      fetchInformationSources();
    }
  }, []);

  useEffect(() => {
    if (data) {
      const createdId = data?.data?.id;
      if (createdId) {
        addToast({ message: data.message, severity: "success" });
        // Refresh the patients list
        if (fetchPatients) {
          fetchPatients();
        }
        window.setTimeout(() => {
          navigate(`/reception/patients/${createdId}/check-in`);
        }, 1000);
      } else {
        addToast({
          message: data?.data?.error || "Registration failed. Please try again.",
          severity: "error",
        });
      }
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
              <Stack
                direction="row"
                alignItems="flex-end"
                spacing={1}
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
                <TextField
                  label="Age"
                  fullWidth
                  rules={[validationRules.optionalInteger]}
                  onChange={(value) => {
                    const age = validateInteger(value);
                    if (age) {
                      setFormData({
                        ...formData,
                        date_of_birth: moment().subtract(age, "years").toDate(),
                      });
                    }
                  }}
                  containerProps={{ sx: { width: 80 } }}
                />
              </Stack>
            </Grid>
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
            >
              <TextField
                ref={addressRef}
                label="Address"
                fullWidth
                onChange={(value) =>
                  setFormData({ ...formData, address: value })
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
                required
                rules={[validationRules.optionalPhone]}
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
                ref={emailRef}
                label="Email Address"
                fullWidth
                type="email"
                rules={[validationRules.optionalEmail]}
                onChange={(value) => setFormData({ ...formData, email: value })}
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
                ref={occupationRef}
                label="Occupation"
                fullWidth
                onChange={(value) =>
                  setFormData({ ...formData, occupation: value })
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
                ref={paymentModeRef}
                label="Payment Mode"
                fullWidth
                required
                options={paymentModes}
                optionsLabel="name"
                optionsValue="id"
                onChange={(value) =>
                  setFormData({ ...formData, payment_mode_id: value })
                }
              />
            </Grid>
            {marketingEnabled ? (
              <Grid
                item
                md={4}
                sm={6}
                xs={12}
              >
                <Select
                  ref={informationSourceRef}
                  label="Source of Information"
                  fullWidth
                  clearable
                  options={informationSources}
                  optionsLabel="name"
                  optionsValue="id"
                  onChange={(value) =>
                    setFormData({ ...formData, info_source_id: value })
                  }
                />
              </Grid>
            ) : null}
            <Grid
              item
              xs={12}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_vip}
                    onChange={(event) =>
                      setFormData({ ...formData, is_vip: event.target.checked })
                    }
                  />
                }
                label="VIP Patient"
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

export default CreatePatient;