import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, Stack, Typography, Box } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../PatientFilters";
import Descriptions from "../../../components/Descriptions";

import { useFetch, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getAge,
  numberFormat
} from "../../../helpers";

const CompletedPayments = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Cleared",
    payment_status: "completed",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patient-item-bills",
    {
      ...params,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  const { data: summaryData, loading: summaryLoading } = useFetch(
    "api/patient-item-bills-summary",
    {
      ...params,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      total_completed: 0,
      total_amount_paid: 0,
      total_bills: 0,
      total_paid_today: 0,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Completed Payments - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Payment Center" },
        { title: `Completed Payments` },
      ]}
    >
      <Card>
        <PageHeader title={`Completed Payments (Fully Paid Bills)`} />
        <Divider />
        <CardContent>
          {/* Summary Section */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completed Payments Summary
              </Typography>
              <Descriptions
                columns={2}
                items={[
                  {
                    label: "Total Completed Bills",
                    value: summaryData?.total_completed || 0,
                  },
                  {
                    label: "Total Amount Paid",
                    value: numberFormat(summaryData?.total_amount_paid || 0),
                  },
                ]}
                containerProps={{
                  variant: "outlined",
                  sx: {
                    p: 2,
                  },
                }}
              />
            </CardContent>
          </Card>

          <Filters
            params={params}
            setParams={setParams}
            sx={{ mb: 2 }}
          />
          {!loading && (!data || !data.data || data.data.length === 0) ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No completed payments found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bills will appear here when patients have fully paid their debts and the bills have been cleared.
              </Typography>
            </Box>
          ) : (
            <Table
              loading={loading || summaryLoading}
              columns={[
                {
                  field: "index",
                  headerName: "S/N",
                  valueGetter: (item, index) =>
                    params.per_page * (params.page - 1) + index + 1,
                  tableCellProps: { sx: { width: 80 } },
                },
                {
                  field: "full_name",
                  headerName: "Patient Name",
                  valueGetter: (item, index) =>
                    item.first_item.payment_cache.check_in.patient.full_name,
                  tableCellProps: { sx: { width: 200 } },
                },
                {
                  field: "patient_id",
                  headerName: "Patient Number",
                  valueGetter: (item, index) =>
                    item.first_item.payment_cache.check_in.patient_id,
                  tableCellProps: { sx: { width: 120 } },
                },
                {
                  field: "phone",
                  headerName: "Phone Number",
                  valueGetter: (item, index) =>
                    item.first_item.payment_cache.check_in.patient.phone,
                  tableCellProps: { sx: { width: 150 } },
                },
                {
                  field: "total_amount",
                  headerName: "Total Bill",
                  valueGetter: (item) => numberFormat(parseFloat(item.amount) || 0),
                  tableCellProps: { sx: { width: 120 } },
                },
                {
                  field: "discount",
                  headerName: "Discount",
                  valueGetter: (item) => numberFormat(parseFloat(item.discount) || 0),
                  tableCellProps: { sx: { width: 100 } },
                },
                {
                  field: "amount_paid",
                  headerName: "Amount Paid",
                  valueGetter: (item) => numberFormat(parseFloat(item.amount_paid) || 0),
                  tableCellProps: { sx: { width: 120 } },
                },
                {
                  field: "payment_completion",
                  headerName: "Payment Status",
                  renderCell: (item) => {
                    const netAmount = (parseFloat(item.amount) || 0) - (parseFloat(item.discount) || 0);
                    const paidAmount = parseFloat(item.amount_paid) || 0;
                    const isFullyPaid = paidAmount >= netAmount;

                    return (
                      <Chip
                        label={isFullyPaid ? "Fully Paid" : "Partial"}
                        color={isFullyPaid ? "success" : "warning"}
                        size="small"
                      />
                    );
                  },
                  tableCellProps: { sx: { width: 120 } },
                },
                {
                  field: "cleared_by",
                  headerName: "Cleared By",
                  valueGetter: (item, index) => item.clearer?.full_name,
                  tableCellProps: { sx: { width: 150 } },
                },
                {
                  field: "cleared_at",
                  headerName: "Date Cleared",
                  tableCellProps: { sx: { width: 150 } },
                },
                {
                  field: "created_at",
                  headerName: "Date Created",
                  tableCellProps: { sx: { width: 150 } },
                },
                {
                  field: "actions",
                  headerName: "Actions",
                  tableCellProps: { sx: { width: 100 } },
                  renderCell: (item) => (
                    <Stack
                      direction="row"
                      alignItems="center"
                      divider={
                        <Divider
                          orientation="vertical"
                          sx={{ height: 16 }}
                        />
                      }
                      spacing={1}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                          navigate(
                            `/payment-center/patient-bills/cleared/${item.first_item.payment_cache.check_in.patient_id}/${item.id}`
                          )
                        }
                      >
                        View
                      </Button>
                    </Stack>
                  ),
                },
              ]}
              items={data.data}
              itemCount={data.total}
              page={params.page}
              pageSize={params.per_page}
              onPageChange={(page) => setParams({ ...params, page })}
              onPageSizeChange={(value) =>
                setParams({ ...params, per_page: value, page: 1 })
              }
              footerItems={[
                [
                  { value: "TOTAL COMPLETED PAYMENTS", tableCellProps: { colSpan: 7, sx: { fontWeight: 'bold' } } },
                  { value: numberFormat(summaryData?.total_amount_paid || 0), tableCellProps: { sx: { fontWeight: 'bold', color: 'success.main' } } },
                  { value: "", tableCellProps: { colSpan: 3 } }
                ],
              ]}
            />
          )}
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default CompletedPayments;