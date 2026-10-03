import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { Header as PageHeader } from "../../../../components/Page";
import Modal from "../../../../components/Modal";
import Form from "../../../../components/Form";
import TextField from "../../../../components/TextField";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import Refraction from "./Refraction";
import ConsultationItemsCard from "../../../consultation-room/clinical-notes/ConsultationItemsCard";
import SelectItems from "../../../consultation-room/clinical-notes/SelectItems";
import PatientFilePDF from "../../../patient-records/patient-file/PatientFilePDF";

import { useFetch, usePatch, useToast } from "../../../../hooks";
import { formatError, getValidationError } from "../../../../helpers";

const Subheader = ({ title, sx }) => {
  return (
    <Paper
      variant="elevation"
      sx={{
        bgcolor: "info.main",
        my: 2,
        ...sx,
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight="500"
        px={2}
        py={1}
        color="info.contrastText"
      >
        {title}
      </Typography>
    </Paper>
  );
};

const ClinicalNotes = ({ patient, consultation }) => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const refractionRef = useRef();
  const remarksRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();
  const [formData, setFormData] = useState(consultation);

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems,
  } = useFetch(
    "api/patient-payment-cache-items",
    {
      per_page: 500,
      consultation_id: consultation.id,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const { handlePatch: handleAutoSave } = usePatch();
  const {
    data: dataSendToOptician,
    loading: loadingSendToOptician,
    error: errorSendToOptician,
    handlePatch: handleSendToOptician,
  } = usePatch();

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (dataSendToOptician) {
      setData(dataSendToOptician);

      window.setTimeout(() => {
        navigate("/reception/glass-patients");
      }, 1500);
    }
  }, [dataSendToOptician]);

  useEffect(() => {
    if (errorSendToOptician) {
      setError(errorSendToOptician);
    }
  }, [errorSendToOptician]);

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

  const autoSave = (field, value) => {
    if (value !== consultation[field]) {
      handleAutoSave(
        `api/consultations/${consultation.id}/auto-save-clinical-notes`,
        {
          what: "Consultation",
          [field]: value,
        }
      );
    }
  };

  const openSelectItemsModal = (title, type) => {
    let component = (
      <SelectItems
        modal={modalRef.current}
        consultation={consultation}
        consultationType={type}
        selected={items.filter((e) => e.consultation_type.name === type)}
        fetchItems={fetchItems}
      />
    );

    modalRef.current.open(title, component, "lg");
  };

  const confirmSendToOptician = () => {
    setData(null);
    setError(null);

    if (!formRef.current.validate()) {
      return setError(
        getValidationError("Please complete all the required fields.")
      );
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleSendToOptician(`api/consultations/${consultation.id}`, {
            send_to_optician: "Yes",
            ...formData,
            refraction: refractionRef.current.getFormData(),
          });
        }}
      />
    );

    modalRef.current.open("Confirm Send to Optician", component, "sm");
  };

  return (
    <React.Fragment>
      <Card>
        <PageHeader
          title="Clinical Notes"
          trailing={
            <PatientFilePDF
              consultationId={consultation.id}
              patient={patient}
            />
          }
        />
        <Divider />
        <Form ref={formRef}>
          <CardContent>
            <Subheader
              title="Refraction Details"
              sx={{ mt: 0 }}
            />
            <Refraction
              ref={refractionRef}
              consultation={consultation}
            />

            <Subheader title="Management" />
            <Grid
              container
              spacing={2}
              sx={{ width: '100%', maxWidth: '100%' }}
            >
              <Grid
                item
                md={6}
                lg={6}
                xl={6}
                sm={12}
                xs={12}
                sx={{ width: '100%' }}
              >
                <ConsultationItemsCard
                  title="Glass"
                  consultationType="Glass"
                  loading={loadingItems}
                  items={items}
                  consultation={consultation}
                  onClickAdd={(title, consultationType) =>
                    openSelectItemsModal(title, consultationType)
                  }
                />
              </Grid>
              <Grid
                item
                md={6}
                lg={6}
                xl={6}
                sm={12}
                xs={12}
                sx={{ width: '100%' }}
              >
                <ConsultationItemsCard
                  title="Others"
                  consultationType="Others"
                  loading={loadingItems}
                  items={items}
                  consultation={consultation}
                  onClickAdd={(title, consultationType) =>
                    openSelectItemsModal(title, consultationType)
                  }
                />
              </Grid>
            </Grid>

            <Subheader title="Remarks" />
            <TextField
              ref={remarksRef}
              fullWidth
              multiline
              rows={6}
              defaultValue={consultation.remarks}
              onChange={(value) => {
                setFormData({ ...formData, remarks: value });
                autoSave("remarks", value);
              }}
            />
          </CardContent>
        </Form>
        <Divider />
        {loadingSendToOptician && <LinearProgress />}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            disabled={loadingSendToOptician}
            variant="contained"
            onClick={confirmSendToOptician}
          >
            Send to Optician
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default ClinicalNotes;
