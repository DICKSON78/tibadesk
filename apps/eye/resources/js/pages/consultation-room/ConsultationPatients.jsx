import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
} from "@mui/material";
import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import Filters from "./PatientFilters";

import { useFetch, useToast } from "../../hooks";
import {
  capitalize,
  formatDateForDb,
  formatError,
  getAge,
} from "../../helpers";
import { useNotificationContext } from "../../contexts/NotificationContext";

const ConsultationPatients = () => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const { notifications, refreshNotifications, loading: notificationsLoading } = useNotificationContext();

  const { status } = useParams();

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
    const isPending = String(status || '').toLowerCase() === 'pending';
    const defaultPeriod = isPending ? 'daily' : undefined;
    const dateRange = isPending ? getDateRangeForPeriod('daily') : {};
    return {
      page: 1,
      per_page: 25,
      patient_direction: undefined,
      status: undefined,
      patient_id: undefined,
      patient_name: undefined,
      patient_gender: undefined,
      patient_phone: undefined,
      item_payment_mode_id: undefined,
      item_id: undefined,
      view_period: defaultPeriod,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    };
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/consultations",
    {
      ...params,
      status: capitalize(status),
      start_date: params.start_date ? formatDateForDb(params.start_date) : undefined,
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
    document.title = `${getTitle()} - ${window.APP_NAME}`;
  }, [status]);

  // Keep notifications in sync when arriving and after data refresh
  useEffect(() => {
    refreshNotifications?.();
  }, []);

  useEffect(() => {
    if (!loading) {
      // small debounce to let list settle before refreshing badges
      const t = setTimeout(() => refreshNotifications?.(), 300);
      return () => clearTimeout(t);
    }
  }, [loading, refreshNotifications]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const getTitle = () => {
    if (status === "pending") {
      return "Patients Sent to Doctor";
    }
    if (status === "consulted") {
      return "Consulted Patients";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Consultation Room" },
        { title: getTitle() },
      ]}
    >
      <Card>
        <PageHeader
          title={getTitle()}
          subtitle={
            status === 'pending'
              ? `${(data && typeof data.total === 'number') ? data.total : (Array.isArray(data) ? data.length : 0)} pending`
              : undefined
          }
          trailing={
            <React.Fragment>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!params.consultant_id}
                    onChange={(event) =>
                      setParams({
                        ...params,
                        consultant_id: event.target.checked
                          ? window.user?.id
                          : undefined,
                      })
                    }
                  />
                }
                label="My Patients Only"
              />
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          <Filters
            params={params}
            setParams={setParams}
            showViewPeriod={status === 'pending'}
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
                field: "created_by",
                headerName: "Sent By",
                valueGetter: (item, index) => item.creator?.full_name,
                show: status === "pending",
              },
              {
                field: "consultant",
                headerName: "Consultant",
                valueGetter: (item, index) =>
                  item.payment_cache_item.consultant?.full_name,
              },
              {
                field: "created_at",
                headerName:
                  status === "pending" ? "Date Sent" : "Date Consulted",
                valueGetter: (item) =>
                  item.payment_cache_item.served_at || item.created_at,
              },
              {
                field: "item_name",
                headerName: "Consultation Item",
                valueGetter: (item, index) => item.payment_cache_item.item.name,
              },
              {
                field: "actions",
                headerName: "Actions",
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
                          `/consultation-room/consultation-patients/${status}/${item.payment_cache_item.payment_cache.check_in.patient_id}/${item.id}/clinical-notes`
                        )
                      }
                    >
                      {status === "pending" ? "Manage" : "View"}
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
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default ConsultationPatients;
