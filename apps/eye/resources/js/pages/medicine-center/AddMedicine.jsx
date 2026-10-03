import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  SaveRounded as SaveIcon,
  ArrowBackRounded as BackIcon,
  MedicationRounded as MedicineIcon,
  DeleteRounded as DeleteIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import TextField from "../../components/TextField";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import Table from "../../components/Table";

import { useFetch, usePost, useToast } from "../../hooks";
import { formatError, numberFormat } from "../../helpers";

// item_type_id: 2 = Pharmaceutical, consultation_type_id: 1 = Pharmacy
const MEDICINE_ITEM_TYPE_ID = 2;
const MEDICINE_CONSULTATION_TYPE_ID = 1;

const AddMedicine = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const medicineNameRef = useRef();
  const unitOfMeasureRef = useRef();
  const quantityRef = useRef();

  const [medicineName, setMedicineName] = useState("");
  const [code, setCode] = useState("");
  const [unitOfMeasureId, setUnitOfMeasureId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitBuyingPrice, setUnitBuyingPrice] = useState("");
  const [expirationDate, setExpirationDate] = useState(null);
  const [minimumStock, setMinimumStock] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);

  const { data: unitsOfMeasureResponse, loading: unitsLoading } = useFetch(
    "api/units-of-measure",
    { status: "Active", per_page: 500 },
    true,
    { data: [], total: 0, page: 1 },
    (response) => response.data
  );

  const unitsOfMeasure = unitsOfMeasureResponse?.data?.data || [];

  const { data, loading, error, handlePost, setError } = usePost(
    "api/stocktakes",
    {
      reason: "Medicine stock added",
      items: selectedMedicines.map(m => ({
        item_id: null, // will be created
        ...m
      }))
    }
  );

  // Tumia api/medicines/bulk-create
  const { data: bulkData, loading: bulkLoading, error: bulkError, handlePost: handleBulkPost } = usePost(
    "api/medicines/bulk-create",
    { medicines: selectedMedicines }
  );

  useEffect(() => {
    document.title = `Add Medicine - ${window.APP_NAME}`;
    return () => setHasShownSuccess(false);
  }, []);

  useEffect(() => {
    if (bulkData && bulkData.success && !hasShownSuccess) {
      setHasShownSuccess(true);
      addToast({ message: "Medicines added successfully", severity: "success" });
      setSelectedMedicines([]);
      navigate('/medicine-center/medicines');
    }
  }, [bulkData, hasShownSuccess]);

  useEffect(() => {
    if (bulkError) {
      addToast({ message: formatError(bulkError), severity: "error" });
    }
  }, [bulkError]);

  const handleAddMedicine = () => {
    if (!medicineName || medicineName.trim() === '') {
      addToast({ message: "Medicine name is required", severity: "warning" });
      return;
    }
    if (!unitOfMeasureId) {
      addToast({ message: "Unit of measure is required", severity: "warning" });
      return;
    }
    if (!quantity || quantity <= 0) {
      addToast({ message: "Quantity must be greater than 0", severity: "warning" });
      return;
    }

    const medicine = {
      name: medicineName.trim(),
      code: code.trim() || null,
      item_type_id: MEDICINE_ITEM_TYPE_ID,
      consultation_type_id: MEDICINE_CONSULTATION_TYPE_ID,
      unit_of_measure_id: parseInt(unitOfMeasureId),
      is_consultation_item: 'Yes',
      is_stock_item: 'Yes',
      balance: parseFloat(quantity),
      unit_buying_price: unitBuyingPrice ? parseFloat(unitBuyingPrice) : null,
      expiry_date: expirationDate ? expirationDate.toISOString().split('T')[0] : null,
      minimum_stock: minimumStock ? parseFloat(minimumStock) : 0,
      has_expiry: expirationDate ? 'Yes' : 'No',
      status: 'Active',
    };

    setSelectedMedicines([...selectedMedicines, medicine]);

    // Clear form
    setMedicineName("");
    setCode("");
    setUnitOfMeasureId("");
    setQuantity("");
    setUnitBuyingPrice("");
    setExpirationDate(null);
    setMinimumStock("");
  };

  const handleRemoveMedicine = (index) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedMedicines.length === 0) {
      addToast({ message: "Please add at least one medicine", severity: "warning" });
      return;
    }
    setHasShownSuccess(false);
    handleBulkPost();
  };

  return (
    <Page
      title="Add Medicine"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicines", to: "/medicine-center/medicines" },
        { title: "Add Medicine" },
      ]}
    >
      <Card>
        <PageHeader
          title={
            <Stack direction="row" alignItems="center" spacing={2}>
              <MedicineIcon sx={{ fontSize: 28.8, color: 'primary.main' }} />
              <Typography variant="h5">Add New Medicine</Typography>
            </Stack>
          }
          action={
            <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('/medicine-center/medicines')}>
              Back to Medicines
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                inputRef={medicineNameRef}
                label="Medicine Name *"
                value={medicineName || ""}
                onChange={(value) => setMedicineName(value || "")}
                placeholder="e.g., Paracetamol 500mg"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Medicine Code"
                value={code || ""}
                onChange={(value) => setCode(value || "")}
                placeholder="e.g., PAR500"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                inputRef={unitOfMeasureRef}
                label="Unit of Measure *"
                options={Array.isArray(unitsOfMeasure) ? unitsOfMeasure : []}
                optionsLabel="name"
                optionsValue="id"
                value={unitOfMeasureId || ""}
                onChange={(value) => setUnitOfMeasureId(value || "")}
                loading={unitsLoading}
                placeholder="Select unit of measure"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                inputRef={quantityRef}
                label="Quantity *"
                type="number"
                value={quantity || ""}
                onChange={(value) => setQuantity(value || "")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Unit Buying Price (TZS)"
                type="number"
                value={unitBuyingPrice || ""}
                onChange={(value) => setUnitBuyingPrice(value || "")}
                placeholder="0.00"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Minimum Stock Level"
                type="number"
                value={minimumStock || ""}
                onChange={(value) => setMinimumStock(value || "")}
                placeholder="0"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Expiry Date"
                value={expirationDate}
                onChange={setExpirationDate}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleAddMedicine} fullWidth size="large">
                Add to List
              </Button>
            </Grid>
          </Grid>

          {selectedMedicines.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Medicines to Add ({selectedMedicines.length})
              </Typography>
              <Table
                columns={[
                  {
                    field: "name",
                    headerName: "Medicine Name",
                    valueGetter: (item) => item.name,
                  },
                  {
                    field: "code",
                    headerName: "Code",
                    valueGetter: (item) => item.code || 'N/A',
                  },
                  {
                    field: "balance",
                    headerName: "Quantity",
                    valueGetter: (item) => numberFormat(item.balance),
                  },
                  {
                    field: "unit_buying_price",
                    headerName: "Unit Price (TZS)",
                    valueGetter: (item) => item.unit_buying_price ? numberFormat(item.unit_buying_price) : 'N/A',
                  },
                  {
                    field: "expiry_date",
                    headerName: "Expiry Date",
                    valueGetter: (item) => item.expiry_date || 'No expiry',
                  },
                  {
                    field: "actions",
                    headerName: "Actions",
                    renderCell: (item, index) => (
                      <Tooltip title="Remove">
                        <IconButton color="error" onClick={() => handleRemoveMedicine(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    ),
                  },
                ]}
                items={selectedMedicines}
                hidePaginationFooter
              />
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/medicine-center/medicines')} disabled={bulkLoading}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={bulkLoading}
                  sx={{ flexGrow: 1 }}
                >
                  {bulkLoading ? "Adding Medicines..." : `Add ${selectedMedicines.length} Medicine(s)`}
                </Button>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default AddMedicine;