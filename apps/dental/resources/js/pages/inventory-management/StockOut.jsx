import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
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

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
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
import { Delete as DeleteIcon } from "../../components/ui/icons.jsx";

const validationRules = getValidationRules();

const StockOut = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const reasonRef = useRef();
  const [reason, setReason] = useState();
  const [itemName, setItemName] = useState();
  const [itemType, setItemType] = useState();
  const [selectedItem, setSelectedItem] = useState();
  const [quantity, setQuantity] = useState();
  const [selectedItems, setSelectedItems] = useState([]);

  const isMedicine = itemType === "Pharmaceutical" || itemType === "Medicine";

  const { data: reasons } = useFetch(
    "api/stock-out/reasons", {}, false, [],
    (response) => response.data.data || []
  );

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
    "api/stock-out",
    { reason, items: selectedItems }
  );

  useEffect(() => {
    document.title = `Stock Out - ${window.APP_NAME}`;
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

  const handleAddItem = () => {
    if (!selectedItem) {
      addToast({ message: "Please select an item first.", severity: "warning" });
      return;
    }
    if (!quantity || quantity <= 0) {
      addToast({ message: "Please enter a valid quantity.", severity: "warning" });
      return;
    }

    const currentBalance = parseFloat(selectedItem.balance) || 0;
    if (parseFloat(quantity) > currentBalance) {
      addToast({ message: `Insufficient stock. Available: ${currentBalance}`, severity: "error" });
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        item_source: isMedicine ? "medicine" : "item",
        quantity,
        balance_before: currentBalance,
      },
    ]);

    setSelectedItem(null);
    setQuantity(null);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((e, i) => i !== index));
  };

  const confirmSubmit = () => {
    setError(null);

    if (!reason) {
      return setError(getValidationError("Please select reason for stock out."));
    }

    if (!selectedItems.length) {
      return setError(getValidationError("Please add at least one item."));
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform stock out? This will reduce item balances."
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePost();
        }}
      />
    );

    modalRef.current.open("Confirm Stock Out", component, "sm");
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Inventory Management" },
        { title: "Stock Out" },
      ]}
    >
      <Card>
        <PageHeader title="Stock Out" />
        <Divider />
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item md={3.5} sm={12} xs={12}>
              <Select
                ref={reasonRef}
                label="Reason"
                fullWidth
                required
                placeholder="Select reason"
                options={reasons}
                onChange={(value) => setReason(value)}
              />
            </Grid>
            <Grid item md={3} sm={12} xs={12}>
              <TextField
                disabled
                label="Issued By"
                fullWidth
                required
                value={window.user.full_name}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item md={3.5} sm={12} xs={12}>
              <Card variant="outlined">
                <CardHeader
                  title="Select Item"
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
                <CardContent sx={{ height: "42vh", overflowY: "auto" }}>
                  {!itemType ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Select an item type to load items.
                    </Typography>
                  ) : loadingItems ? (
                    <Stack spacing={1}>
                      {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} variant="rectangular" height={40} />
                      ))}
                    </Stack>
                  ) : items.length > 0 ? (
                    items.map((e) => {
                      const balance = parseFloat(e.balance) || 0;
                      return (
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
                            <Typography variant="body2">
                              {e.name}
                              <Typography
                                variant="caption"
                                color={balance > 0 ? "success.main" : "error.main"}
                                sx={{ ml: 1 }}
                              >
                                (Stock: {numberFormat(balance)})
                              </Typography>
                            </Typography>
                          }
                          sx={{ display: "flex", cursor: "pointer" }}
                          onClick={() => setSelectedItem(e)}
                        />
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No items found. Try adjusting your filters.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item md={8.5} sm={12} xs={12}>
              <Card variant="outlined" sx={{ mb: 1 }}>
                <CardHeader title="Items to Issue" />
                <Divider />
                <CardContent>
                  {selectedItem && (
                    <Grid container spacing={1} alignItems="flex-end" mb={2}>
                      <Grid item md={5} sm={4} xs={12}>
                        <TextField
                          disabled
                          label="Selected Item"
                          fullWidth
                          required
                          value={selectedItem.name || ""}
                        />
                      </Grid>
                      <Grid item md={3} sm={4} xs={12}>
                        <TextField
                          disabled
                          label="Available Stock"
                          fullWidth
                          value={numberFormat(parseFloat(selectedItem.balance) || 0)}
                        />
                      </Grid>
                      <Grid item md={2} sm={4} xs={12}>
                        <TextField
                          label="Quantity"
                          fullWidth
                          required
                          defaultValue={quantity}
                          rules={[
                            validationRules.number,
                            (value) => value > 0 || "Quantity has to be greater than 0.",
                            (value) => (parseFloat(value) <= (parseFloat(selectedItem.balance) || 0)) || "Insufficient stock.",
                          ]}
                          onChange={(value) => {
                            value = validateInteger(value);
                            setQuantity(value);
                          }}
                        />
                      </Grid>
                      <Grid item md={1} sm={2} xs={12}>
                        <Button
                          disabled={loading}
                          fullWidth
                          variant="contained"
                          color="error"
                          size="medium"
                          onClick={handleAddItem}
                        >
                          Issue
                        </Button>
                      </Grid>
                    </Grid>
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
                      },
                      {
                        field: "quantity",
                        headerName: "Quantity",
                        valueGetter: (item) => numberFormat(item.quantity || 0),
                      },
                      {
                        field: "balance_before",
                        headerName: "Stock Before",
                        valueGetter: (item) => numberFormat(item.balance_before || 0),
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
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        {loading && <LinearProgress />}
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" flexWrap="wrap" p={2}>
          <Button disabled={loading || !!data} variant="contained" color="error" onClick={confirmSubmit}>
            Complete Stock Out
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default StockOut;
