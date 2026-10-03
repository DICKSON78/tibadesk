import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, LinearProgress, Chip } from "../../../components/ui/index.jsx";
import { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import { useFetch } from "../../../hooks";
import { formatDate } from "../../../helpers";

const statusLabels = { Pending: "warning", Consulted: "success" };

const DentalExaminationsList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ status: "Consulted", start_date: "", end_date: "" });

  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
  ).toString();

  const { data, loading, pagination } = useFetch(`/api/consultations?per_page=25&with_diagnoses=Yes&${query}`, {
    loadOnMount: true,
    loadOnReload: true,
  });

  const columns = [
    { field: "id", label: "ID" },
    {
      field: "patient", label: "Patient",
      render: (row) => row.payment_cache_item?.payment_cache?.check_in?.patient?.full_name || "N/A",
    },
    {
      field: "gender", label: "Gender",
      render: (row) => row.payment_cache_item?.payment_cache?.check_in?.patient?.gender || "-",
    },
    {
      field: "created_at", label: "Date",
      render: (row) => row.created_at ? formatDate(row.created_at) : "-",
    },
    {
      field: "status", label: "Status",
      render: (row) => (
        <Chip label={row.status} color={statusLabels[row.status] || "default"} size="small" />
      ),
    },
    {
      field: "diagnoses", label: "Diagnoses",
      render: (row) => row.diagnoses?.map((d) => d.disease?.name).join(", ") || "-",
    },
  ];

  const handleRowClick = (row) => {
    const patientId = row.payment_cache_item?.payment_cache?.check_in?.patient_id;
    if (patientId) {
      navigate(`/consultation-room/consultation-patients/consulted/${patientId}/${row.id}/clinical-notes`);
    }
  };

  return (
    <Box>
      <PageHeader title="Dental Examinations" />
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Select
          label="Status"
          value={filters.status}
          category="dentalExamStatus"
          onChange={(v) => setFilters({ ...filters, status: v || "" })}
          size="small" sx={{ minWidth: 150 }}
        />
        <DatePicker label="Start Date" value={filters.start_date} onChange={(v) => setFilters({ ...filters, start_date: v })} size="small" />
        <DatePicker label="End Date" value={filters.end_date} onChange={(v) => setFilters({ ...filters, end_date: v })} size="small" />
      </Box>
      {loading ? <LinearProgress /> : <Table columns={columns} data={data?.data || []} pagination={pagination} onRowClick={handleRowClick} />}
    </Box>
  );
};

export default DentalExaminationsList;
