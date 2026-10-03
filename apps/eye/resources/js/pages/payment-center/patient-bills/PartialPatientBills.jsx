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

const PartialPatientBills = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Pending",
    payment_status: "partial",
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
      total_debt: 0,
      total_paid_today: 0,
      total_partial: 0,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Partial Patient Bills - ${window.APP_NAME}`;
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
        { title: `Partial Patient Bills` },
      ]}
    >
      <Card>
        <PageHeader title={`Partial Patient Bills (Installments)`} />
        <Divider />
        <CardContent>
          {/* Daily Payment Summary */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Payment Summary
              </Typography>
              <Descriptions
                columns={3}
                items={[
                  {
                    label: "Total Paid Today",
                    value: numberFormat(summaryData?.total_paid_today || 0),
                  },
                  {
                    label: "Total Outstanding Debt",
                    value: numberFormat(summaryData?.total_debt || 0),
                  },
                  {
                    label: "Active Partial Payments",
                    value: summaryData?.total_partial || 0,
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
                valueGetter: (item) => numberFormat(item.amount || 0),
                tableCellProps: { sx: { width: 120 } },
              },
              {
                field: "amount_paid",
                headerName: "Amount Paid",
                valueGetter: (item) => numberFormat(item.amount_paid || 0),
                tableCellProps: { sx: { width: 120 } },
              },
              {
                field: "debt",
                headerName: "Debt Amount",
                valueGetter: (item) =>
                  numberFormat((item.amount || 0) - (item.discount || 0) - (item.amount_paid || 0)),
                tableCellProps: { sx: { width: 120 } },
              },
              {
                field: "payment_progress",
                headerName: "Payment Progress",
                renderCell: (item) => {
                  const totalAmount = item.amount || 0;
                  const paidAmount = item.amount_paid || 0;
                  const percentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
                  
                  return (
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" gutterBottom>
                        {percentage.toFixed(1)}%
                      </Typography>
                      <Box
                        sx={{
                          height: 8,
                          backgroundColor: 'grey.300',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: percentage >= 100 ? 'success.main' : 'primary.main',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                },
                tableCellProps: { sx: { width: 180 } },
              },
              {
                field: "created_by",
                headerName: "Created By",
                valueGetter: (item, index) => item.creator?.full_name,
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
                          `/payment-center/patient-bills/pending/${item.first_item.payment_cache.check_in.patient_id}/${item.id}`
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
                { value: "TOTAL DEBT (ALL PATIENTS)", tableCellProps: { colSpan: 6, sx: { fontWeight: 'bold' } } },
                { value: numberFormat(summaryData?.total_debt || 0), tableCellProps: { sx: { fontWeight: 'bold', color: 'error.main' } } },
                { value: "", tableCellProps: { colSpan: 3 } }
              ],
            ]}
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PartialPatientBills;
