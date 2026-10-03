import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
} from "@mui/material";
import {
  SaveRounded as SaveIcon,
  ArrowBackRounded as BackIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import DatePicker from "../../components/DatePicker";

import { useFetch, usePatch, useToast } from "../../hooks";
import { formatError } from "../../helpers";

const EditMedicine = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const addToast = useToast();

  const { data: showData, loading: loadingShow, error: showError } = useFetch(
    `api/medicines/${id}`,
    {},
    true,
    null,
    (response) => response.data.data
  );

  const { data: uoms, loading: uomsLoading } = useFetch(
    "api/units-of-measure",
    { per_page: 1000 },
    true,
    { data: [], total: 0 },
    (response) => response.data.data
  );

  const { data: updateData, loading: saving, error: updateError, handlePatch } = usePatch();

  const [form, setForm] = useState({
    name: "",
    code: "",
    unit_of_measure_id: "",
    balance: "",
    unit_buying_price: "",
    minimum_stock: "",
    has_expiry: "No",
    expiry_date: null,
  });

  useEffect(() => {
    document.title = `Edit Medicine - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (showError) {
      addToast({ message: formatError(showError), severity: "error" });
    }
  }, [showError]);

  useEffect(() => {
    if (updateError) {
      addToast({ message: formatError(updateError), severity: "error" });
    }
  }, [updateError]);

  useEffect(() => {
    if (showData) {
      const m = showData;
      setForm({
        name: m.name || "",
        code: m.code || "",
        unit_of_measure_id: m.unit_of_measure_id || "",
        balance: m.balance ?? "",
        unit_buying_price: m.unit_buying_price ?? "",
        minimum_stock: m.minimum_stock ?? "",
        has_expiry: m.has_expiry || "No",
        expiry_date: m.expiry_date ? new Date(m.expiry_date) : null,
      });
    }
  }, [showData]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const submit = () => {
    if (!form.name) {
      addToast({ message: "Medicine name is required", severity: "warning" });
      return;
    }
    if (!form.unit_of_measure_id) {
      addToast({ message: "Unit of measure is required", severity: "warning" });
      return;
    }
    handlePatch(`api/medicines/${id}`, form);
  };

  useEffect(() => {
    if (updateData && updateData.success) {
      addToast({ message: "Medicine updated successfully", severity: "success" });
      navigate("/medicine-center/medicines");
    }
  }, [updateData]);

  return (
    <Page
      title="Edit Medicine"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicines", to: "/medicine-center/medicines" },
        { title: "Edit" },
      ]}
    >
      <Card>
        <PageHeader
          title="Edit Medicine"
          action={
            <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate(-1)}>
              Back
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {loadingShow ? (
            <div>Loading medicine data...</div>
          ) : showError ? (
            <div>Error loading medicine: {formatError(showError)}</div>
          ) : (
            <React.Fragment>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Medicine Name *"
                    value={form.name || ""}
                    onChange={(v) => handleChange("name", v || "")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Code"
                    value={form.code || ""}
                    onChange={(v) => handleChange("code", v || "")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    label="Unit of Measure *"
                    value={form.unit_of_measure_id || ""}
                    onChange={(v) => handleChange("unit_of_measure_id", v)}
                    options={uoms?.data || []}
                    optionsLabel="name"
                    optionsValue="id"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type="number"
                    label="Quantity (Stock)"
                    value={form.balance ?? ""}
                    onChange={(v) => handleChange("balance", v ? parseFloat(v) : "")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type="number"
                    label="Unit Buying Price (TZS)"
                    value={form.unit_buying_price ?? ""}
                    onChange={(v) => handleChange("unit_buying_price", v ? parseFloat(v) : "")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type="number"
                    label="Minimum Stock"
                    value={form.minimum_stock ?? ""}
                    onChange={(v) => handleChange("minimum_stock", v ? parseFloat(v) : "")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    label="Has Expiry"
                    value={form.has_expiry || "No"}
                    onChange={(v) => handleChange("has_expiry", v)}
                    options={["Yes", "No"]}
                    fullWidth
                  />
                </Grid>
                {form.has_expiry === "Yes" && (
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Expiry Date"
                      value={form.expiry_date}
                      onChange={(v) => handleChange("expiry_date", v)}
                      fullWidth
                    />
                  </Grid>
                )}
              </Grid>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving || loadingShow}
                  onClick={submit}
                >
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </Stack>
            </React.Fragment>
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default EditMedicine;