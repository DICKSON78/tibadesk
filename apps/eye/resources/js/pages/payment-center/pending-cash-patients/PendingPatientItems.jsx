import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
} from "@mui/material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import PatientDetails from "../../reception/patients/PatientDetails";
import Table from "../../../components/Table";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

import PaymentReceiptPDF from "./PaymentReceiptPDF";
import { pdf } from "@react-pdf/renderer";

import { useFetch, usePost, useToast } from "../../../hooks";
import {
  formatError,
  getValidationError,
  getValidationRules,
  numberFormat,
  validateInteger,
} from "../../../helpers";

const validationRules = getValidationRules();

const PendingPatientItems = () => {
  const addToast = useToast();
  const { patientId, paymentCacheId } = useParams();

  const modalRef = useRef();
  const discountRef = useRef();
  const paymentChannelRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();
  const [discount, setDiscount] = useState();
  const [paymentChannel, setPaymentChannel] = useState();
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const { data: paymentChannels, handleFetch: fetchPaymentChannels } = useFetch(
    "api/payment-channels",
    {
      status: "Active",
      per_page: 500,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const [selectedItems, setSelectedItems] = useState([]);

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems,
  } = useFetch(
    "api/patient-payment-cache-items",
    {
		  status: "Pending",
      per_page: 500,
      payment_cache_id: paymentCacheId,
      transaction_type: "Cash",
    },
    false,
    [],
    (response) => response.data.data.data
  );

  const { data, loading, error, handlePost, setError } = usePost(
    "api/patient-payment-cache-items/make-cash-payment",
    {
      payment_cache_id: paymentCacheId,
      items: selectedItems.map((e) => e.id),
      discount,
      payment_channel_id: paymentChannel ? paymentChannel.id : null,
    }
  );

  useEffect(() => {
    document.title = `Pending Patient Items - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (patient) {
      fetchItems();
      fetchPaymentChannels();
    }
  }, [patient]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      fetchItems();

      setSelectedItems([]);
      discountRef.current.setValue(null);
      paymentChannelRef.current.setValue(null);
      
      // Automatically generate and print receipt after payment
      generatePaymentReceipt();
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const confirmSubmit = (title, action) => {
    if (!selectedItems.length) {
      return setError(getValidationError("Please select at least one item."));
    }

    if (
      !discountRef.current.validate() ||
      (action === "make_payment" && !paymentChannelRef.current.validate())
    ) {
      return false;
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          if (action === "create_bill") {
            handlePost("api/patient-payment-cache-items/create-bill", {
              payment_cache_id: paymentCacheId,
              items: selectedItems.map((e) => e.id),
              discount,
            });
          } else {
            handlePost();
          }
        }}
      />
    );

    modalRef.current.open(title, component, "sm");
  };

  const getTotalAmount = () => {
    return items.reduce(
      (acc, e) => acc + (e.unit_price || 0) * (e.quantity || 0),
      0
    );
  };

  const getSelectedAmount = () => {
    return selectedItems.reduce(
      (acc, e) => acc + (e.unit_price || 0) * (e.quantity || 0),
      0
    );
  };

  const generatePaymentReceipt = useCallback(async () => {
    if (data.data.items) {
      setLoadingReceipt(true);
      try {
        const blob = await pdf(
          <PaymentReceiptPDF
            receipt={data.data}
            items={data.data.items}
            patient={patient}
          />
        ).toBlob();
        
        // Create a download link instead of opening in new tab
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payment-receipt-${patient?.full_name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setLoadingReceipt(false);
      } catch (error) {
        console.error('Receipt generation failed:', error);
        addToast({ message: 'Failed to generate receipt. Please try again.', severity: "error" });
        setLoadingReceipt(false);
      }
    }
  }, [data, patient, addToast]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: "Patients Sent to Cashier" },
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
        <Card>
          <PageHeader title="Pending Patient Items" />
          <Divider />
          <CardContent>
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
                  field: "payment_mode_id",
                  headerName: "Payment Mode",
                  valueGetter: (item, index) => item.payment_mode.name,
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
                    numberFormat((item.unit_price || 0) * (item.quantity || 0)),
                },

              ]}
              items={items}
              hidePaginationFooter
              checkboxSelection
              checked={selectedItems}
              setChecked={setSelectedItems}
              footerItems={[
                [
                  { value: "TOTAL", tableCellProps: { colSpan: 6 } },
                  { value: numberFormat(getTotalAmount() || 0) },
                ],
              ]}
            />

            <Grid
              container
              spacing={2}
              mt={1}
            >
              <Grid
                item
                md={4}
                sm={4}
                xs={12}
              >
                <TextField
                  ref={discountRef}
                  label="Discount"
                  fullWidth
                  rules={[
                    validationRules.optionalInteger,
                    (value) =>
                      !value
                        ? true
                        : value <= getSelectedAmount() ||
                          "Discount cannot be greater than total selected amount.",
                  ]}
                  onChange={(value) => {
                    value = validateInteger(value);
                    setDiscount(value);
                  }}
                />
              </Grid>
              <Grid
                item
                md={4}
                sm={4}
                xs={12}
              >
                <TextField
                  disabled
                  label="Selected Grand Total"
                  fullWidth
                  value={numberFormat(getSelectedAmount() - (discount || 0))}
                />
              </Grid>

              <Grid
                item
                md={4}
                sm={4}
                xs={12}
              >
                <Select
                  ref={paymentChannelRef}
                  label="Payment Channel"
                  fullWidth
                  required
                  options={paymentChannels}
                  optionsLabel="name"
                  value={paymentChannel}
                  onChange={(value) => setPaymentChannel(value)}
                />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          {loading || loadingReceipt ? <LinearProgress /> : null}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
            flexWrap="wrap"
            p={2}
          >
            {data && data.data.items ? (
              <Button
                disabled={loadingReceipt}
                variant="contained"
                color="purple"
                onClick={generatePaymentReceipt}
              >
                Print Receipt
              </Button>
            ) : null}
            <Button
              disabled={loading}
              variant="contained"
              color="secondary"
              onClick={() => confirmSubmit("Create Bill", "create_bill")}
            >
              Create Bill
            </Button>
            <Button
              disabled={loading}
              variant="contained"
              onClick={() => confirmSubmit("Make Payment", "make_payment")}
            >
              Make Payment
            </Button>
          </Stack>
        </Card>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PendingPatientItems;
