import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Card, CardContent, Chip, Divider, Stack } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "../PatientFilters";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, getAge, getWeekStartDate } from "../../../helpers";
import { useNotificationContext } from "../../../contexts/NotificationContext";

const PendingCashPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const { notifications, loading: notificationsLoading } = useNotificationContext();

  const getDateRangeForPeriod = (period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (period) {
      case 'daily':
        return { start_date: today, end_date: now };
      case 'weekly':
        return { start_date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), end_date: now };
      case 'monthly':
        return { start_date: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000), end_date: now };
      default:
        return { start_date: today, end_date: now };
    }
  };

  const [params, setParams] = useState(() => {
    const dateRange = getDateRangeForPeriod('daily');
    return {
      page: 1,
      per_page: 25,
      item_status: "Pending",
      item_transaction_type: "Cash",
      patient_id: undefined,
      patient_name: undefined,
      patient_gender: undefined,
      patient_phone: undefined,
      view_period: 'daily',
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      include_optician_glass: true,
    };
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/patient-payment-cache",
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

  useEffect(() => {
    document.title = `Patients Sent to Cashier - ${window.APP_NAME}`;
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
        { title: "Patients Sent to Cashier" },
      ]}
    >
      <Card>
        <PageHeader
          title="Patients Sent to Cashier"
          subtitle={`${(data && typeof data.total === 'number') ? data.total : 0} pending`}
        />
        <Divider />
        <CardContent>
          <Filters
            params={params}
            setParams={setParams}
            showViewPeriod
            sx={{ mb: 2 }}
          />
          <Table
            loading={loading}
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
                valueGetter: (item, index) => item.check_in.patient.full_name,
                tableCellProps: { sx: { width: 200 } },
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) => item.check_in.patient_id,
                tableCellProps: { sx: { width: 120 } },
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  getAge(item.check_in.patient.date_of_birth),
                tableCellProps: { sx: { width: 80 } },
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) => item.check_in.patient.gender,
                tableCellProps: { sx: { width: 80 } },
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) => item.check_in.patient.phone,
                tableCellProps: { sx: { width: 150 } },
              },
              {
                field: "require_glass",
                headerName: "Spectacle Required",
                renderCell: (item) => {
                  const requireGlass = item.consultation?.require_glass;
                  if (requireGlass === 'Yes') {
                    return (
                      <Chip
                        label="Yes"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    );
                  }
                  return requireGlass === 'No' ? (
                    <Chip
                      label="No"
                      color="default"
                      size="small"
                    />
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>Not specified</span>
                  );
                },
                tableCellProps: { sx: { width: 150 } },
              },
              {
                field: "created_by",
                headerName: "Sent By",
                valueGetter: (item, index) => item.creator?.full_name,
                tableCellProps: { sx: { width: 150 } },
              },
              {
                field: "created_at",
                headerName: "Date Sent",
                tableCellProps: { sx: { width: 150 } },
              },
              {
                field: "actions",
                headerName: "Actions",
                tableCellProps: { sx: { width: 100 } },
                renderCell: (item) => (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      const patientId = item.check_in.patient_id;
                      const paymentCacheId = item.id;
                      navigate(`/payment-center/pending-cash-patients/${patientId}/${paymentCacheId}`);
                    }}
                  >
                    Manage
                  </Button>
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
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default PendingCashPatients;
