import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Button, Card, CardContent, Chip, Divider, Stack, IconButton, Tooltip } from "../../components/ui/index.jsx";
import Page, { Header as PageHeader } from "../../components/Page";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import TextField from "../../components/TextField";

import { useFetch, useToast } from "../../hooks";
import { formatDateForDb, formatDate, formatError } from "../../helpers";
import { RefreshRounded as RefreshIcon } from "../../components/ui/icons.jsx";

const statusColors = {
  Ordered: "warning",
  "In Progress": "info",
  Ready: "success",
  Delivered: "secondary",
};

const LabOrders = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "",
    lab_name: "",
    start_date: "",
    end_date: "",
  });

  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 25,
    status: "",
    lab_name: "",
    start_date: "",
    end_date: "",
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/dental-lab-orders",
    {
      ...queryParams,
      start_date: queryParams.start_date ? formatDateForDb(params.start_date) : undefined,
      end_date: queryParams.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    { data: [], total: 0, page: 1 },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Lab Orders - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const columns = [
    {
      field: "index",
      headerName: "S/N",
      valueGetter: (item, index) => params.per_page * (params.page - 1) + index + 1,
    },
    {
      field: "id",
      headerName: "Order #",
      renderCell: (item) => `DL-${item.id}`,
    },
    {
      field: "patient",
      headerName: "Patient",
      valueGetter: (item) => item.payment_cache_item?.payment_cache?.check_in?.patient?.full_name
        || item.consultation?.id || "N/A",
    },
    { field: "order_type", headerName: "Order Type" },
    { field: "material", headerName: "Material" },
    { field: "shade", headerName: "Shade" },
    {
      field: "lab_name",
      headerName: "Lab",
      valueGetter: (item) => item.lab_name || "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (item) => (
        <Chip label={item.status} color={statusColors[item.status] || "default"} size="small" />
      ),
    },
    {
      field: "cost",
      headerName: "Cost (TZS)",
      valueGetter: (item) => item.cost ? Number(item.cost).toLocaleString() : "-",
    },
    {
      field: "technician_charges",
      headerName: "Tech Charges (TZS)",
      valueGetter: (item) => item.technician_charges ? Number(item.technician_charges).toLocaleString() : "-",
    },
    {
      field: "impression_date",
      headerName: "Impression",
      valueGetter: (item) => item.impression_date ? formatDate(item.impression_date) : "-",
    },
    {
      field: "delivery_date",
      headerName: "Delivery",
      valueGetter: (item) => item.delivery_date ? formatDate(item.delivery_date) : "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (item) => (
        <Stack direction="row" alignItems="center" divider={<Divider orientation="vertical" sx={{ height: 16 }} />} spacing={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              const patientId = item.payment_cache_item?.payment_cache?.check_in?.patient_id
                || item.consultation?.payment_cache_item?.payment_cache?.check_in?.patient_id;
              const consultationId = item.consultation_id;
              if (patientId && consultationId) {
                navigate(`/dental-lab/lab-orders/${patientId}/${consultationId}`);
              }
            }}
          >
            Manage
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Dental Lab" },
        { title: "Lab Orders" },
      ]}
    >
      <Card>
        <PageHeader
          title="Lab Orders"
          subtitle={`${(data && typeof data.total === 'number') ? data.total : 0} orders`}
          trailing={
            <Tooltip title="Refresh List">
              <IconButton onClick={() => { setQueryParams({ ...params }); handleFetch(); }} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <Select
              label="Status"
              value={params.status}
              category="labOrderStatusFilter"
              onChange={(v) => setParams({ ...params, status: v })}
              size="small"
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="Lab Name"
              value={params.lab_name}
              onChange={(v) => setParams({ ...params, lab_name: v || "" })}
              size="small"
              sx={{ minWidth: 150 }}
            />
            <DatePicker
              label="Start Date"
              value={params.start_date}
              onChange={(v) => setParams({ ...params, start_date: v })}
              size="small"
            />
            <DatePicker
              label="End Date"
              value={params.end_date}
              onChange={(v) => setParams({ ...params, end_date: v })}
              size="small"
            />
            <Button variant="outlined" size="small" onClick={() => { setQueryParams({ ...params }); handleFetch(); }}>
              Search
            </Button>
          </Box>
          <Table
            loading={loading}
            columns={columns}
            items={data?.data || []}
            itemCount={data?.total || 0}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => { setParams({ ...params, page }); setQueryParams((prev) => ({ ...prev, page })); handleFetch(); }}
            onPageSizeChange={(value) => { const next = { ...params, per_page: value, page: 1 }; setParams(next); setQueryParams((prev) => ({ ...prev, per_page: value, page: 1 })); handleFetch(); }}
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default LabOrders;
