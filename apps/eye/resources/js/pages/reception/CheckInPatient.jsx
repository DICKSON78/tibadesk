import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteIcon from "@mui/icons-material/CloseRounded";

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import PatientDetails from "./patients/PatientDetails";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import SelectUser from "../../components/SelectUser";
import Table, { SearchTextField } from "../../components/Table";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import { useFetch, usePost, useToast } from "../../hooks";
import {
  formatError,
  getValidationError,
  getValidationRules,
  numberFormat,
  throttle,
  validateInteger,
} from "../../helpers";

const validationRules = getValidationRules();

const CheckInPatient = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { patientId } = useParams();

  // Handle case where patientId is null or invalid
  useEffect(() => {
    if (!patientId || patientId === 'null' || patientId === 'undefined') {
      addToast({ 
        message: "Invalid patient ID. Please select a patient from the patients list.", 
        severity: "error" 
      });
      navigate("/reception/patients");
    }
  }, [patientId, navigate, addToast]);

  const modalRef = useRef();
  const paymentModeRef = useRef();
  const itemRef = useRef();
  const quantityRef = useRef();
  const consultantRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();
  const [existingCheckIns, setExistingCheckIns] = useState([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(false);

  const { data: paymentModes, handleFetch: fetchPaymentModes } = useFetch(
    "api/payment-modes",
    {
      status: "Active",
      per_page: 500,
    },
    false,
    [],
    (response) => response.data.data.data
  );
  const { data: itemTypes, handleFetch: fetchItemTypes } = useFetch(
    "api/item-types",
    {
      status: "Active",
      per_page: 500,
    },
    false,
    [],
    (response) => response.data.data.data.map((e) => e.name)
  );

  const [paymentMode, setPaymentMode] = useState();
  const [consultant, setConsultant] = useState();
  const [itemName, setItemName] = useState();
  const [itemType, setItemType] = useState();
  const [lensTypeId, setLensTypeId] = useState();
  const [selectedItem, setSelectedItem] = useState();
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isPartnerItem, setIsPartnerItem] = useState(false);
  const [collaboratorId, setCollaboratorId] = useState();
  const canTogglePartner = window.user?.role === "Admin" || window.user?.privileges?.reception === true;

  const { data: collaborators, handleFetch: fetchCollaborators } = useFetch(
    "api/collaborators",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const { data: lensTypes, handleFetch: fetchLensTypes } = useFetch(
    "api/lens-types",
    {
      status: "Active",
      per_page: 500,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const {
    data: items,
    setData: setItems,
    handleFetch: fetchItems,
  } = useFetch(
    "api/items",
    {
      status: "Active",
      per_page: 5000,
      payment_mode_id: paymentMode ? paymentMode.id : undefined,
      q: itemName,
      item_type: itemType,
      lens_type_id: lensTypeId,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const { data, loading, error, handlePost, setError } = usePost(
    "api/patient-check-ins",
    {
      patient_id: patientId,
      payment_mode_id: paymentMode ? paymentMode.id : undefined,
      items: selectedItems,
    }
  );

  const { data: checkInData, handleFetch: fetchCheckIns } = useFetch(
    "api/patient-payment-cache",
    {
      patient_id: patientId,
      per_page: 100,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  useEffect(() => {
    document.title = `Check-In Patient - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (patient && patientId && patientId !== 'null' && patientId !== 'undefined') {
      fetchPaymentModes();
      fetchItemTypes();
      setPaymentMode(patient.payment_mode);
      fetchCheckIns();
    }
  }, [patient, patientId]);

  useEffect(() => {
    if (checkInData) {
      setExistingCheckIns(checkInData);
    }
  }, [checkInData]);

  useEffect(() => {
    if (paymentMode) {
      setSelectedItem(null);
      setQuantity(1);
      setItems([]);
      fetchItems();
    }
  }, [paymentMode]);

  useEffect(() => {
    if (paymentMode) {
      fetchItems();
    }
  }, [itemName, itemType, lensTypeId]);

  useEffect(() => {
    if (itemType !== "Lens") {
      setLensTypeId(null);
    }

    if (itemType === "Lens") {
      fetchLensTypes();
    }
  }, [itemType]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        navigate("/reception/patients");
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleAddItem = () => {
    if (consultantRef.current.validate() && quantityRef.current.validate()) {
      const collaborator = collaborators.find((c) => c.id === collaboratorId);
      setSelectedItems([
        ...selectedItems,
        {
          payment_mode_id: paymentMode.id,
          payment_mode_name: paymentMode.name,
          item_id: selectedItem.id,
          item_name: selectedItem.name,
          consultation_type_id: selectedItem.consultation_type_id,
          unit_price: selectedItem.prices[0].unit_price,
          quantity,
          comments,
          consultant_id: consultant ? consultant.id : null,
          consultant_name: consultant ? consultant.full_name : null,
          is_partner_item: isPartnerItem,
          collaborator_id: isPartnerItem ? collaboratorId : null,
          collaborator_name: isPartnerItem && collaborator ? collaborator.name : null,
        },
      ]);

      setSelectedItem(null);
      setQuantity(1);
      setComments(undefined);
      setIsPartnerItem(false);
      setCollaboratorId(null);
    }
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((e, i) => i !== index));
  };

  const confirmSubmit = (title) => {
    setError(null);

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

    modalRef.current.open(title, component, "sm");
  };

  const getTotalAmount = () => {
    return selectedItems.reduce(
      (acc, e) => acc + (e.unit_price || 0) * (e.quantity || 0),
      0
    );
  };

  // Don't render if patientId is invalid
  if (!patientId || patientId === 'null' || patientId === 'undefined') {
    return (
      <Page
        breadcrumbs={[
          { title: "Home" },
          { title: "Reception" },
          { title: "Patients/Customers" },
          { title: "Check-In" },
          { title: "Invalid Patient" },
        ]}
      >
        <div>Redirecting to patients list...</div>
      </Page>
    );
  }

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patients/Customers" },
        { title: "Check-In" },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}

      {patient ? (
        <>
          {existingCheckIns.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <PageHeader title="Existing Check-In Data" />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This patient has already been checked in. Below are the existing check-in records:
                </Typography>
                {existingCheckIns.map((checkIn, index) => (
                  <Card key={checkIn.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Check-In #{checkIn.id} - {new Date(checkIn.created_at).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Payment Mode: {checkIn.check_in?.payment_mode?.name || 'N/A'}
                      </Typography>
                      {checkIn.items && checkIn.items.length > 0 && (
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
                              valueGetter: (item) => item.item?.name || 'Unknown',
                            },
                            {
                              field: "consultation_type",
                              headerName: "Type",
                              valueGetter: (item) => item.consultation_type?.name || 'N/A',
                            },
                            {
                              field: "unit_price",
                              headerName: "Unit Price",
                              valueGetter: (item) => numberFormat(item.unit_price || 0),
                            },
                            {
                              field: "quantity",
                              headerName: "Quantity",
                              valueGetter: (item) => numberFormat(item.quantity || 0),
                            },
                            {
                              field: "total_price",
                              headerName: "Subtotal",
                              valueGetter: (item) =>
                                numberFormat((item.unit_price || 0) * (item.quantity || 0)),
                            },
                            {
                              field: "status",
                              headerName: "Status",
                              valueGetter: (item) => item.status || 'N/A',
                            },
                          ]}
                          items={checkIn.items}
                          hidePaginationFooter
                          footerItems={[
                            [
                              { value: "TOTAL", tableCellProps: { colSpan: 5 } },
                              { 
                                value: numberFormat(
                                  checkIn.items.reduce(
                                    (acc, item) => acc + (item.unit_price || 0) * (item.quantity || 0),
                                    0
                                  )
                                )
                              },
                            ],
                          ]}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <PageHeader title="Check-In Patient" />
            <Divider />
            <CardContent>
            <Grid
              container
              spacing={2}
              mb={2}
            >
              <Grid
                item
                md={3.5}
                sm={12}
                xs={12}
              >
                <Select
                  ref={paymentModeRef}
                  label="Payment Mode"
                  fullWidth
                  required
                  options={paymentModes}
                  optionsLabel="name"
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  value={paymentMode}
                  onChange={(value) => setPaymentMode(value)}
                />
              </Grid>
              <Grid
                item
                md={3}
                sm={12}
                xs={12}
              >
                <SelectUser
                  ref={consultantRef}
                  label="Consultant"
                  clearable
                  params={{ designation: "Doctor" }}
                  onChange={(value) => setConsultant(value)}
                />
              </Grid>
            </Grid>

            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                md={3.5}
                sm={12}
                xs={12}
              >
                <Card variant="outlined">
                  <CardHeader
                    title="Select Item"
                    action={
                      <SearchTextField
                        onChange={(value) =>
                          throttle(() => setItemName(value), 1000)
                        }
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
                      options={itemTypes}
                      onChange={(value) => setItemType(value)}
                    />
                    {itemType === "Lens" ? (
                      <Select
                        placeholder="Lens Type"
                        fullWidth
                        clearable
                        options={lensTypes}
                        optionsLabel="name"
                        optionsValue="id"
                        onChange={(value) => setLensTypeId(value)}
                        containerProps={{ mt: 2 }}
                      />
                    ) : null}
                  </CardContent>
                  <Divider />
                  <CardContent sx={{ height: "42vh", overflowY: "auto" }}>
                    {items.map((e) => (
                      <FormControlLabel
                        key={e.id}
                        control={
                            <Radio
                              size="small"
                              checked={selectedItem === e}
                              onChange={(event) => {
                                setSelectedItem(e);
                                const isOutOfStockFrame = e.item_type?.name === "Frame" && e.balance <= 0;
                                setIsPartnerItem(isOutOfStockFrame);
                                setCollaboratorId(null);
                              }}
                            />
                          }
                          label={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body2">{e.name}</Typography>
                              {e.item_type?.name === "Frame" && e.balance <= 0 ? (
                                <Chip
                                  label="Out of Stock"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              ) : null}
                            </Stack>
                          }
                        sx={{ display: "flex" }}
                      />
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                item
                md={8.5}
                sm={12}
                xs={12}
              >
                <Card
                  variant="outlined"
                  sx={{ mb: 1 }}
                >
                  <CardHeader title="Added Items" />
                  <Divider />
                  <CardContent>
                    {selectedItem ? (
                      <Grid
                        container
                        spacing={1}
                        alignItems="flex-end"
                        mb={2}
                      >
                        <Grid
                          item
                          md={3}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            ref={itemRef}
                            disabled={true}
                            label="Selected Item"
                            fullWidth
                            required
                            value={selectedItem.name || ""}
                          />
                        </Grid>
                        <Grid
                          item
                          md={1.5}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            disabled={true}
                            label="Unit Price"
                            fullWidth
                            value={
                              selectedItem.prices.length
                                ? numberFormat(
                                    selectedItem.prices[0].unit_price || 0
                                  )
                                : ""
                            }
                          />
                        </Grid>
                        <Grid
                          item
                          md={1.5}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            ref={quantityRef}
                            label="Quantity"
                            fullWidth
                            required
                            defaultValue={quantity}
                            rules={[
                              validationRules.number,
                              (value) =>
                                value > 0 ||
                                "Quantity has to be greater than 0.",
                            ]}
                            onChange={(value) => {
                              value = validateInteger(value);
                              setQuantity(value);
                            }}
                          />
                        </Grid>
                        <Grid
                          item
                          md={3}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            label="Comments"
                            fullWidth
                            onChange={(value) => setComments(value)}
                          />
                        </Grid>
                        <Grid
                          item
                          md={1.5}
                          sm={4}
                          xs={12}
                        >
                          <TextField
                            disabled={true}
                            label="Total Price"
                            fullWidth
                            value={
                              numberFormat(
                                (selectedItem.prices[0].unit_price || 0) *
                                  (quantity || 0)
                              ) || ""
                            }
                          />
                        </Grid>
                        {/* Partner checkbox - hidden from reports, functional in form */}
                        {canTogglePartner ? (
                        <Grid
                          item
                          md={1}
                          sm={2}
                          xs={12}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isPartnerItem}
                                onChange={(e) => setIsPartnerItem(e.target.checked)}
                              />
                            }
                            label="Partner"
                            sx={{ ml: 0 }}
                          />
                        </Grid>
                        ) : null}
                        {isPartnerItem ? (
                          <Grid
                            item
                            md={3}
                            sm={6}
                            xs={12}
                          >
                            <Select
                              label="Collaborator"
                              fullWidth
                              required
                              options={collaborators}
                              optionsLabel="name"
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              value={collaborators.find((c) => c.id === collaboratorId) || null}
                              onChange={(value) => setCollaboratorId(value ? value.id : null)}
                            />
                          </Grid>
                        ) : null}
                        <Grid
                          item
                          md={1}
                          sm={2}
                          xs={12}
                        >
                          <Button
                            disabled={loading}
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="medium"
                            onClick={handleAddItem}
                          >
                            Add
                          </Button>
                        </Grid>
                      </Grid>
                    ) : null}

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
                          field: "payment_mode_name",
                          headerName: "Payment Mode",
                        },
                        {
                          field: "unit_price",
                          headerName: "Unit Price",
                          valueGetter: (item, index) =>
                            numberFormat(item.unit_price || 0),
                        },
                        {
                          field: "quantity",
                          headerName: "Quantity",
                          valueGetter: (item, index) =>
                            numberFormat(item.quantity || 0),
                        },
                        {
                          field: "total_price",
                          headerName: "Subtotal",
                          valueGetter: (item, index) =>
                            numberFormat(
                              (item.unit_price || 0) * (item.quantity || 0)
                            ),
                        },
                        {
                          field: "comments",
                          headerName: "Comments",
                        },
                        {
                          field: "actions",
                          headerName: "Actions",
                          renderCell: (item, index) => (
                            <Tooltip title="Remove">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ),
                        },
                      ]}
                      items={selectedItems}
                      hidePaginationFooter
                      footerItems={[
                        [
                          { value: "TOTAL", tableCellProps: { colSpan: 5 } },
                          { value: numberFormat(getTotalAmount() || 0) },
                        ],
                      ]}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
              onClick={() =>
                confirmSubmit(
                  paymentMode && paymentMode.transaction_type === "Credit"
                    ? "Confirm Send for Approval"
                    : "Confirm Send to Cashier"
                )
              }
            >
              {paymentMode && paymentMode.transaction_type === "Credit"
                ? "Send for Approval"
                : "Send to Cashier"}
            </Button>
          </Stack>
        </Card>
        </>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default CheckInPatient;
