import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Stack,
} from "@mui/material";
import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import Form from "../../components/Form";
import TextField from "../../components/TextField";

import { usePatch, useToast } from "../../hooks";
import { formatError } from "../../helpers";

const ClinicDetails = () => {
  const addToast = useToast();

  const modalRef = useRef();
  const formRef = useRef();
  const nameRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const addressRef = useRef();

  const [formData, setFormData] = useState({
    name: window.user.clinic.name,
    phone: window.user.clinic.phone,
    email: window.user.clinic.email,
    address: window.user.clinic.address,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/clinics/${window.user.clinic_id}`,
    formData
  );

  useEffect(() => {
    document.title = `Clinic Details - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
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
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Settings" },
        { title: "Clinic Details" },
      ]}
    >
      <Card>
        <PageHeader title="Clinic Details" />
        <Divider />
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
                  ref={nameRef}
                  label="Clinic Name"
                  fullWidth
                  required
                  defaultValue={formData.name}
                  onChange={(value) =>
                    setFormData({ ...formData, name: value })
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
                  defaultValue={formData.phone}
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
                  ref={emailRef}
                  label="Email"
                  fullWidth
                  defaultValue={formData.email}
                  onChange={(value) =>
                    setFormData({ ...formData, email: value })
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
                  ref={addressRef}
                  label="Address"
                  fullWidth
                  defaultValue={formData.address}
                  onChange={(value) =>
                    setFormData({ ...formData, address: value })
                  }
                />
              </Grid>
            </Grid>
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

export default ClinicDetails;
