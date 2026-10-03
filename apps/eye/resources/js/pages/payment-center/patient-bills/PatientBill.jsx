import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  Alert,
} from "@mui/material";

import Page, { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Table from "../../../components/Table";
import PatientDetails from "../../reception/patients/PatientDetails";
import Descriptions from "../../../components/Descriptions";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import PatientBillPayments from "./PatientBillPayments";
import BillPDF from "./BillPDF";

import { capitalize, formatError, numberFormat } from "../../../helpers";
import { useFetch, usePatch, useToast } from "../../../hooks";

const PatientBill = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const { status, patientId, billId } = useParams();

  const modalRef = useRef();

  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patient, setPatient] = useState();
  const [error, setError] = useState();

  const {
    data: bill,
    loading: loadingBill,
    error: errorFetchBill,
    handleFetch: fetchBill,
  } = useFetch(
    `api/patient-item-bills/${billId}`,
    null,
    true,
    null,
    (response) => response.data.data
  );
  const {
    data,
    loading,
    error: errorClearBill,
    handlePatch,
  } = usePatch(`api/patient-item-bills/${billId}/clear`);

  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems,
  } = useFetch(
    "api/patient-payment-cache-items",
    {
      per_page: 500,
      bill_id: billId,
    },
    false,
    [],
    (response) => response.data.data.data
  );

  useEffect(() => {
    if (!patientId || !billId) {
      return navigate(`/payment-center/patient-bills/${status}`);
    }

    document.title = `Patient Bill - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (patient && bill) {
      fetchItems();
    }
  }, [patient, bill]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      fetchBill();
    }
  }, [data]);

  useEffect(() => {
    if (errorFetchBill) {
      setError(errorFetchBill);
    }
  }, [errorFetchBill]);

  useEffect(() => {
    if (errorClearBill) {
      setError(errorClearBill);
    }
  }, [errorClearBill]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const showBillPaymentsModal = () => {
    let component = (
      <PatientBillPayments
        bill={bill}
        modal={modalRef.current}
        fetchBill={fetchBill}
      />
    );

    modalRef.current.open("Bill Payments", component, "lg");
  };

  const confirmClearBill = () => {
    setError(null);

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePatch();
        }}
      />
    );

    modalRef.current.open("Clear Bill", component, "sm");
  };

  const getTotalAmount = () => {
    return items.reduce(
      (acc, e) => acc + (e.unit_price || 0) * (e.quantity || 0),
      0
    );
  };

  const getAmountRemaining = () => {
    if (!bill) {
      return 0;
    }
    return bill.amount - bill.discount - (bill.amount_paid || 0);
  };

  const getPaymentStatus = () => {
    const remaining = getAmountRemaining();
    if (remaining <= 0) {
      return { status: 'completed', color: 'success', text: 'Completed' };
    } else if (bill.amount_paid > 0) {
      return { status: 'partial', color: 'warning', text: 'Partial Payment' };
    } else {
      return { status: 'pending', color: 'error', text: 'Pending' };
    }
  };

  const getPaymentProgress = () => {
    if (!bill) return 0;
    const totalAmount = bill.amount - bill.discount;
    const paidAmount = bill.amount_paid || 0;
    return totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Bill Room" },
        { title: `${capitalize(status)} Patient Bills` },
        { title: patientId },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(responseData) => setPatient(responseData)}
      />

      {loadingPatient || loadingBill ? (
        <Skeleton
          variant="rounded"
          height={256}
        />
      ) : null}

      {patient && bill ? (
        <Card>
          <PageHeader
            title="Patient Bill"
            trailing={
              <Stack direction="row" spacing={1}>
                <Chip
                  label={getPaymentStatus().text}
                  color={getPaymentStatus().color}
                  variant="outlined"
                />
                <BillPDF
                  bill={bill}
                  items={items}
                  patient={patient}
                />
              </Stack>
            }
          />
          <CardContent>
            <Table
              columns={[
                {
                  field: "label",
                  headerName: "Description",
                  flex: 1,
                  tableCellProps: { sx: { width: 150 } },
                },
                {
                  field: "value",
                  headerName: "Value",
                  flex: 2,
                  tableCellProps: { sx: { width: 200 } },
                  renderCell: (item) => (
                    <Typography
                      variant="body2"
                      sx={{
                        color: item.color || 'text.primary',
                        fontWeight: item.fontWeight || 'normal'
                      }}
                    >
                      {item.value}
                    </Typography>
                  ),
                },
              ]}
              items={[
                { label: "Bill Number", value: bill.id },
                { label: "Total Bill Amount", value: numberFormat(bill.amount) },
                { label: "Discount", value: numberFormat(bill.discount) },
                { label: "Net Amount", value: numberFormat(bill.amount - bill.discount) },
                { 
                  label: "Amount Paid", 
                  value: numberFormat(bill.amount_paid || 0),
                  color: bill.amount_paid > 0 ? 'success.main' : 'text.primary',
                  fontWeight: bill.amount_paid > 0 ? 'bold' : 'normal'
                },
                { 
                  label: "Amount Remaining", 
                  value: numberFormat(getAmountRemaining()),
                  color: getAmountRemaining() > 0 ? 'error.main' : 'success.main',
                  fontWeight: 'bold'
                },
                { label: "Created By", value: bill.creator?.full_name },
                { label: "Date Created", value: bill.created_at },
                { label: "Bill Status", value: bill.status },
                
              ]}
              hidePaginationFooter
              containerProps={{
                variant: "outlined",
                sx: {
                  mb: 2,
                  p: 2,
                },
              }}
            />
          </CardContent>
          <Card variant="outlined">
              <CardHeader title="Bill Items" />
              <Divider />
              <CardContent>
                <Table
                  loading={loadingItems}
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, index) => index + 1,
                      tableCellProps: { sx: { width: 80 } },
                    },
                    {
                      field: "item_id",
                      headerName: "Item ID",
                      valueGetter: (item) => item.item?.id || '',
                      tableCellProps: { sx: { width: 100 } },
                    },
                    {
                      field: "name",
                      headerName: "Item Name",
                      valueGetter: (item) => item.item?.name || '',
                      tableCellProps: { sx: { width: 200 } },
                    },
                    {
                      field: "unit_price",
                      headerName: "Unit Price",
                      valueGetter: (item) => numberFormat(item.item?.unit_price || 0),
                      tableCellProps: { sx: { width: 120 } },
                    },
                    {
                      field: "quantity",
                      headerName: "Quantity",
                      valueGetter: (item) => item.quantity || 0,
                      tableCellProps: { sx: { width: 100 } },
                    },
                    {
                      field: "amount",
                      headerName: "Amount",
                      valueGetter: (item) => numberFormat(item.amount || 0),
                      tableCellProps: { sx: { width: 120 } },
                    },
                  ]}
                  items={items}
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
          <Box mt={2}>
              {/* Enhanced Payment History Section */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardHeader 
                  title="Payment History & Details" 
                  subheader="Complete record of all payments made by the patient"
                />
                <Divider />
                <CardContent>
                  <PatientBillPayments bill={bill} fetchBill={fetchBill} />
                </CardContent>
              </Card>
            </Box>
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
            {bill.status === "Pending" ? (
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="flex-end"
                flexWrap="wrap"
                p={2}
              >
                <Button
                  disabled={loading || getAmountRemaining() > 0}
                  variant="contained"
                  color="primary"
                  onClick={confirmClearBill}
                >
                  Clear Bill
                </Button>
                {getAmountRemaining() <= 0 && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Bill is fully paid but not yet cleared. Click "Clear Bill" to complete the process.
                  </Alert>
                )}
              </Stack>
            ) : (
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="flex-end"
                flexWrap="wrap"
                p={2}
              >
                <Chip
                  label={`Bill ${bill.status.toLowerCase()}`}
                  color={bill.status === 'Cleared' ? 'success' : 'default'}
                  variant="outlined"
                />
              </Stack>
            )}
          </Stack>
        </Card>
      ) : null}
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PatientBill;
