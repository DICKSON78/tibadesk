import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, Divider, CircularProgress, Box } from "@mui/material";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";

import { useFetch, useToast } from "../../../hooks";
// import { useDynamicNotifications } from "../../../hooks/useDynamicNotifications"; // Disabled to prevent fetch errors
import { useFilterContext } from "../../../contexts/FilterContext";
import { formatDateForDb, formatError, getAge } from "../../../helpers";
// navigationFix is applied globally in App; avoid page-level overrides that can interfere with routing

const PatientsToReturn = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const { updateFilter } = useFilterContext();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Consulted",
    patient_id: undefined,
    patient_name: undefined,
    patient_gender: undefined,
    patient_phone: undefined,
    patient_to_return: "Yes",
    to_return_date: new Date(), // Set today's date as default
    view_period: "daily", // Add view period
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    {
      ...params,
      to_return_date: params.to_return_date
        ? formatDateForDb(params.to_return_date)
        : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  // Debug logging for API calls
  useEffect(() => {
    if (params.to_return_date) {
      const formattedDate = formatDateForDb(params.to_return_date);
      console.log('PatientsToReturn - API call params:', {
        original_date: params.to_return_date,
        formatted_date: formattedDate,
        view_period: params.view_period,
        patient_to_return: params.patient_to_return
      });
    }
  }, [params.to_return_date, params.view_period, params.patient_to_return]);

  // Dynamic notifications based on view period
  // When a specific date is selected, use daily view for that specific date
  // When no specific date, use the selected view period
  const notificationViewPeriod = params.to_return_date ? 'daily' : params.view_period;
  const notificationDate = params.to_return_date ? (params.to_return_date instanceof Date ? params.to_return_date : new Date(params.to_return_date)) : null;
  
  // Static notifications to prevent fetch errors
  const notifications = {
    patients_sent_to_cashier: 0,
    credit_patients_approval: 0,
    patients_sent_to_doctor: 0,
    patients_sent_to_optician: 0,
    glass_patients: 0,
    dispensing_requests: 0,
    procedure_requests: 0,
    other_dispensing_requests: 0,
    patients_to_return: 0,
  };
  const notificationsLoading = false;

  // Avoid aggressive global filter updates here to prevent potential routing hiccups
  // If needed, re-enable with debounce in FilterContext instead of per-page effect

  // Debug logging
  useEffect(() => {
    console.log('PatientsToReturn - Current params:', params);
    console.log('PatientsToReturn - Notifications:', notifications);
  }, [params, notifications]);

  useEffect(() => {
    const periodLabels = {
      daily: "Today",
      weekly: "This Week", 
      monthly: "This Month"
    };
    document.title = `Patients to Return ${periodLabels[params.view_period]} - ${window.APP_NAME}`;
  }, [params.view_period]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  // Removed custom popstate listeners to avoid interfering with React Router transitions

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Patients to Return" },
      ]}
    >
      <Card>
        <PageHeader 
          title={`Patients to Return ${
            params.to_return_date 
              ? `on ${params.to_return_date instanceof Date ? params.to_return_date.toLocaleDateString() : params.to_return_date}`
              : params.view_period === 'daily' 
                ? 'Today' 
                : params.view_period === 'weekly' 
                  ? 'This Week' 
                  : 'This Month'
          }`}
          subtitle={
            <Box display="flex" alignItems="center" gap={1}>
              {loading && <CircularProgress size={16} />}
              {(() => {
                if (loading) return 'Loading...';
                const total = typeof data?.total === 'number' ? data.total : (Array.isArray(data?.data) ? data.data.length : 0);
                return `${total} patients scheduled to return`;
              })()} 
              (View: {params.view_period}, Date: {params.to_return_date ? (params.to_return_date instanceof Date ? params.to_return_date.toLocaleDateString() : params.to_return_date) : 'None'})
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Filters
            params={params}
            setParams={setParams}
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
              },
              {
                field: "full_name",
                headerName: "Patient Name",
                valueGetter: (item, index) =>
                  item.payment_cache_item.payment_cache.check_in.patient
                    .full_name,
              },
              {
                field: "patient_id",
                headerName: "Patient Number",
                valueGetter: (item, index) =>
                  item.payment_cache_item.payment_cache.check_in.patient_id,
              },
              {
                field: "date_of_birth",
                headerName: "Age",
                valueGetter: (item, index) =>
                  getAge(
                    item.payment_cache_item.payment_cache.check_in.patient
                      .date_of_birth
                  ),
              },
              {
                field: "gender",
                headerName: "Gender",
                valueGetter: (item, index) =>
                  item.payment_cache_item.payment_cache.check_in.patient.gender,
              },
              {
                field: "phone",
                headerName: "Phone Number",
                valueGetter: (item, index) =>
                  item.payment_cache_item.payment_cache.check_in.patient.phone,
              },
              {
                field: "consultant",
                headerName: "Consultant",
                valueGetter: (item, index) =>
                  item.payment_cache_item.consultant?.full_name,
              },
              {
                field: "to_return_date",
                headerName: "Return Date",
              },
              // Actions column removed per request
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

export default PatientsToReturn;
