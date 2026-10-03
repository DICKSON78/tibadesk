import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Table from "../../../components/Table";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Refraction from "./Refraction";
import PatientFilePDF from "../../patient-records/patient-file/PatientFilePDF";

import { useFetch, usePatch, usePost, useToast } from "../../../hooks";
import {
  formatError,
  getValidationError,
  numberFormat,
} from "../../../helpers";

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
  const remarksRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();

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
      consultation_type: "Glass",
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const [remarks, setRemarks] = useState(consultation.remarks);
  const [selectedItems, setSelectedItems] = useState([]);

  const { handlePatch: handleAutoSave } = usePatch();
  const {
    data: dataDispense,
    loading: loadingDispense,
    error: errorDispense,
    handlePost: handleDispense,
  } = usePost();

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (dataDispense) {
      setData(dataDispense);

      window.setTimeout(() => {
        navigate("/optician-center/glass-patients");
      }, 1500);
    }
  }, [dataDispense]);

  useEffect(() => {
    if (errorDispense) {
      setError(errorDispense);
    }
  }, [errorDispense]);

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

  const confirmDispense = () => {
    setData(null);
    setError(null);

    if (!formRef.current.validate()) {
      return setError(
        getValidationError("Please complete all the required fields.")
      );
    }

    if (!selectedItems.length) {
      return setError(getValidationError("Please select at least one item."));
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleDispense("api/patient-payment-cache-items/dispense", {
            payment_cache_id: consultation.payment_cache_item.payment_cache_id,
            items: selectedItems.map((e) => e.id),
          });
        }}
      />
    );

    modalRef.current.open("Confirm Dispense", component, "sm");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Paid":
        return "info";
      case "Billed":
        return "purple";
      case "Served":
        return "success";
    }

    return "neutral";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "Not Paid";
      case "Served":
        return "Dispensed";
    }

    return status;
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
            <Refraction consultation={consultation} />

            <Subheader title="Management" />
            <Table
              loading={loadingItems}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) => index + 1,
                },
                {
                  field: "item_id",
                  headerName: "Item Name",
                  valueGetter: (item, index) => item.item.name,
                },
                {
                  field: "unit_of_measure_id",
                  headerName: "UoM",
                  valueGetter: (item, index) => item.item.unit_of_measure?.name,
                },
                {
                  field: "balance",
                  headerName: "Item Balance",
                  valueGetter: (item, index) =>
                    numberFormat(item.item.balance || 0),
                },
                {
                  field: "payment_mode_id",
                  headerName: "Payment Mode",
                  valueGetter: (item, index) => item.payment_mode.name,
                },
                {
                  field: "quantity",
                  headerName: "Quantity",
                  valueGetter: (item, index) =>
                    numberFormat(item.quantity || 0),
                },
                {
                  field: "comments",
                  headerName: "Comments",
                },
                {
                  field: "status",
                  headerName: "Status",
                  renderCell: (item, index) => (
                    <Chip
                      size="small"
                      color={getStatusColor(item.status)}
                      label={getStatusLabel(item.status)}
                    />
                  ),
                },
              ]}
              items={items}
              hidePaginationFooter
              checkboxSelection={(item, index) =>
                item.status === "Paid" || item.status === "Billed" || item.status === "Pending"
              }
              checked={selectedItems}
              setChecked={setSelectedItems}
            />

            <Subheader title="Remarks" />
            <TextField
              disabled
              ref={remarksRef}
              fullWidth
              placeholder="Type remarks..."
              multiline
              rows={6}
              horizontal
              defaultValue={remarks}
              onChange={(value) => autoSave("remarks", value)}
              sx={{
                width: '100%',
                '& .MuiInputBase-root': {
                  width: '100%',
                },
                '& .MuiInputBase-input': {
                  width: '100%',
                }
              }}
            />
          </CardContent>
        </Form>
        <Divider />
        {loadingDispense && <LinearProgress />}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            disabled={loadingDispense}
            variant="contained"
            onClick={confirmDispense}
          >
            Dispense
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default ClinicalNotes;
