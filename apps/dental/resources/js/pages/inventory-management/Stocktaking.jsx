import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Radio,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "../../components/ui/index.jsx";
import {
  AddRounded as AddIcon,
  CloseRounded as DeleteIcon,
  SaveRounded as SaveIcon,
  InventoryRounded as InventoryIcon,
} from "../../components/ui/icons.jsx";

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import Table, { SearchTextField } from "../../components/Table";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import { useFetch, usePost, useToast } from "../../hooks";
import {
  formatError,
  getValidationError,
  getValidationRules,
  isAdmin,
  numberFormat,
  throttle,
  validateInteger,
} from "../../helpers";

const validationRules = getValidationRules();

const Stocktaking = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const reasonRef = useRef();
  const quantityRef = useRef();
  const unitBuyingPriceRef = useRef();

  const [reason, setReason] = useState();
  const [itemName, setItemName] = useState();
  const [itemType, setItemType] = useState();
  const [selectedItem, setSelectedItem] = useState();
  const [quantity, setQuantity] = useState();
  const [unitBuyingPrice, setUnitBuyingPrice] = useState(null);
  const [sellingPrice, setSellingPrice] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const isMedicine = itemType === "Pharmaceutical" || itemType === "Medicine";

  const {
    data: regularItems,
    loading: loadingRegularItems,
    handleFetch: fetchRegularItems,
  } = useFetch(
    "api/items",
    {
      status: "Active",
      per_page: 5000,
      is_stock_item: "Yes",
      include_all_stock: "Yes",
      q: itemName,
      item_type: itemType,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const {
    data: medicineItems,
    loading: loadingMedicineItems,
    handleFetch: fetchMedicineItems,
  } = useFetch(
    "api/medicines",
    {
      status: "Active",
      per_page: 5000,
      q: itemName,
    },
    false,
    { data: [], total: 0 },
    (response) => response.data.data.data
  );

  const items = isMedicine ? (Array.isArray(medicineItems) ? medicineItems : []) : (Array.isArray(regularItems) ? regularItems : []);
  const loadingItems = isMedicine ? loadingMedicineItems : loadingRegularItems;

  const { data, loading, error, handlePost, setError } = usePost(
    "api/stocktakes",
    { reason, items: selectedItems }
  );

  useEffect(() => {
    document.title = `Stocktaking - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!itemType) return;
    if (isMedicine) {
      fetchMedicineItems();
    } else {
      fetchRegularItems();
    }
  }, [itemName, itemType]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      setTimeout(() => navigate("/inventory-management/dashboard"), 1500);
    }
  }, [data, navigate]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const totalQuantity = selectedItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  const totalBuyingPrice = selectedItems.reduce((sum, item) => sum + (parseFloat(item.unit_buying_price) || 0) * (parseFloat(item.quantity) || 0), 0);

  const handleAddItem = () => {
    if (!selectedItem) {
      addToast({ message: "Please select an item first.", severity: "warning" });
      return;
    }
    if (!quantity || quantity <= 0) {
      addToast({ message: "Please enter a valid quantity.", severity: "warning" });
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        item_source: isMedicine ? "medicine" : "item",
        quantity,
        unit_buying_price: unitBuyingPrice,
        selling_price: sellingPrice,
        expiration_date: expirationDate,
      },
    ]);

    setSelectedItem(null);
    setQuantity(null);
    setUnitBuyingPrice(null);
    setSellingPrice(null);
    setExpirationDate(null);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((e, i) => i !== index));
  };

  const confirmSubmit = () => {
    setError(null);

    if (!reasonRef.current.validate()) {
      return setError(getValidationError("Please write reason for this stocktaking."));
    }

    if (!selectedItems.length) {
      return setError(getValidationError("Please add at least one item."));
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePost();
        }}
      />
    );

    modalRef.current.open("Confirm Save", component, "sm");
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Inventory Management" },
        { title: "Stocktaking" },
      ]}
    >
      <Card>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InventoryIcon color="primary" />
              <Box>
                <Typography variant="h5">Stocktaking</Typography>
                <Typography variant="body2" color="text.secondary">
                  Record incoming stock items and update inventory balances
                </Typography>
              </Box>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title="Stock Details"
              subheader="Enter the reason for this stock intake and record prepared by information"
              titleTypographyProps={{ variant: "h6" }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item md={4} sm={12} xs={12}>
                  <TextField
                    ref={reasonRef}
                    label="Reason"
                    placeholder="e.g. Supplier restock, Monthly inventory adjustment"
                    fullWidth
                    required
                    onChange={(value) => setReason(value)}
                  />
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                  <TextField
                    disabled
                    label="Prepared By"
                    fullWidth
                    required
                    value={window.user.full_name}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid item md={4} sm={12} xs={12}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardHeader
                  title="Select Item"
                  subheader="Choose item type and search for items"
                  titleTypographyProps={{ variant: "h6" }}
                  action={
                    <SearchTextField
                      onChange={(value) => throttle(() => setItemName(value), 1000)}
                    />
                  }
                  className="no-action-margin"
                />
                <Divider />
                <CardContent sx={{ bgcolor: "background.default" }}>
                  <Select
                    placeholder="Item Type"
                    fullWidth
                    clearable
                    category="itemCategory"
                    onChange={(value) => { setItemType(value); setSelectedItem(null); }}
                  />
                </CardContent>
                <Divider />
                <CardContent sx={{ height: "35vh", overflowY: "auto" }}>
                  {!itemType ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <InventoryIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Select an item type to load items.
                      </Typography>
                    </Box>
                  ) : loadingItems ? (
                    <Stack spacing={1}>
                      {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} variant="rectangular" height={40} />
                      ))}
                    </Stack>
                  ) : items.length > 0 ? (
                    items.map((e) => (
                      <FormControlLabel
                        key={e.id}
                        control={
                          <Radio
                            size="small"
                            checked={selectedItem?.id === e.id}
                            onChange={() => setSelectedItem(e)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">
                              {e.name}
                            </Typography>
                            <Typography variant="caption" color={parseFloat(e.balance) > 0 ? "success.main" : "error.main"}>
                              Stock: {numberFormat(parseFloat(e.balance) || 0)}
                            </Typography>
                          </Box>
                        }
                        sx={{ display: "flex", cursor: "pointer", mx: 0, width: "100%" }}
                        onClick={() => setSelectedItem(e)}
                      />
                    ))
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No items found. Try adjusting your filters.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item md={8} sm={12} xs={12}>
              <Card variant="outlined">
                <CardHeader
                  title="Items to Stock"
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Configure quantity, pricing, and expiration for selected items
                      </Typography>
                      {selectedItems.length > 0 && (
                        <Chip
                          label={`${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''}`}
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  titleTypographyProps={{ variant: "h6" }}
                />
                <Divider />
                <CardContent>
                  {selectedItem && (
                    <Card variant="outlined" sx={{ mb: 2, bgcolor: "primary.50" }}>
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Add: {selectedItem.name}
                        </Typography>
                        <Grid container spacing={1} alignItems="flex-end">
                          <Grid item md={2.4} sm={4} xs={12}>
                            <TextField
                              disabled
                              label="Unit of Measure"
                              fullWidth
                              value={selectedItem.unit_of_measure?.name || ""}
                            />
                          </Grid>
                          <Grid item md={2} sm={4} xs={12}>
                            <TextField
                              ref={quantityRef}
                              label="Quantity"
                              fullWidth
                              required
                              defaultValue={quantity}
                              rules={[
                                validationRules.number,
                                (value) => value > 0 || "Quantity has to be greater than 0.",
                              ]}
                              onChange={(value) => {
                                value = validateInteger(value);
                                setQuantity(value);
                              }}
                            />
                          </Grid>
                          <Grid item md={2.4} sm={4} xs={12}>
                            <TextField
                              ref={unitBuyingPriceRef}
                              label="Unit Buying Price"
                              fullWidth
                              defaultValue={unitBuyingPrice}
                              onChange={(value) => {
                                value = validateInteger(value);
                                setUnitBuyingPrice(value);
                              }}
                            />
                          </Grid>
                          <Grid item md={2} sm={4} xs={12}>
                            <TextField
                              label="Selling Price"
                              fullWidth
                              type="number"
                              placeholder="0.00"
                              defaultValue={sellingPrice}
                              onChange={(value) => {
                                value = validateInteger(value);
                                setSellingPrice(value);
                              }}
                            />
                          </Grid>
                          <Grid item md={2} sm={4} xs={12}>
                            <DatePicker
                              label="Expiration Date"
                              fullWidth
                              value={expirationDate}
                              onChange={(value) => setExpirationDate(value)}
                            />
                          </Grid>
                          <Grid item md={1.2} sm={2} xs={12}>
                            <Button
                              disabled={loading}
                              fullWidth
                              variant="contained"
                              color="primary"
                              size="medium"
                              startIcon={<AddIcon />}
                              onClick={handleAddItem}
                            >
                              Add
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  {!selectedItem && selectedItems.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <InventoryIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Select an item from the left panel to start adding stock.
                      </Typography>
                    </Box>
                  )}

                  <Table
                    columns={[
                      {
                        field: "index",
                        headerName: "S/N",
                        valueGetter: (item, index) => index + 1,
                      },
                      {
                        field: "item_name",
                        headerName: "Item Name",
                        flex: 1,
                      },
                      {
                        field: "quantity",
                        headerName: "Quantity",
                        valueGetter: (item) => numberFormat(item.quantity || 0),
                      },
                      {
                        field: "unit_buying_price",
                        headerName: "Unit Buying Price",
                        valueGetter: (item) => numberFormat(item.unit_buying_price || 0),
                      },
                      {
                        field: "selling_price",
                        headerName: "Selling Price",
                        valueGetter: (item) => numberFormat(item.selling_price || 0),
                      },
                      {
                        field: "expiration_date",
                        headerName: "Expiration Date",
                        valueGetter: (item) =>
                          item.expiration_date
                            ? new Date(item.expiration_date).toLocaleDateString()
                            : "-",
                      },
                      {
                        field: "actions",
                        headerName: "Actions",
                        renderCell: (item, index) => (
                          <Tooltip title="Remove">
                            <span>
                              {isAdmin() && (
                                <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </span>
                          </Tooltip>
                        ),
                        show: !data,
                      },
                    ]}
                    items={selectedItems}
                    hidePaginationFooter
                    footerItems={selectedItems.length > 0 ? [
                      [
                        { value: "TOTAL", tableCellProps: { colSpan: 3, sx: { fontWeight: "bold" } } },
                        { value: numberFormat(totalQuantity), sx: { fontWeight: "bold" } },
                        { value: numberFormat(totalBuyingPrice), sx: { fontWeight: "bold" } },
                        { value: "", tableCellProps: { colSpan: 3 } },
                      ],
                    ] : undefined}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        {loading && <LinearProgress />}
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" flexWrap="wrap" p={2}>
          <Button
            disabled={loading || !!data}
            variant="outlined"
            onClick={() => navigate("/inventory-management/dashboard")}
          >
            Cancel
          </Button>
          <Button
            disabled={loading || !!data}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={confirmSubmit}
          >
            Save Stock Intake
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Stocktaking;
