import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import MoreIcon from "@mui/icons-material/MoreVertRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import { useFetch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const statusColors = {
  pending: "warning",
  confirmed: "success",
  cancelled: "error",
};

const Appointments = () => {
  const addToast = useToast();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: undefined,
    search: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/reception/appointments",
    params,
    true,
    { data: [], total: 0 },
    (response) => response.data.data
  );

  const [item, setItem] = useState();
  const [anchorEl, setAnchorEl] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.title = `Appointments - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.target);
    setIsMenuOpen(true);
    setItem(item);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setAnchorEl(null);
  };

  const changeStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/reception/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");
      addToast({ message: json.message || "Status updated", severity: "success" });
      handleFetch();
    } catch (err) {
      addToast({ message: formatError(err), severity: "error" });
    }
  };

  const deleteAppointment = async (id) => {
    if (!confirm("Delete this appointment request?")) return;
    try {
      const res = await fetch(`/api/reception/appointments/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to delete");
      addToast({ message: json.message || "Deleted", severity: "success" });
      handleFetch();
    } catch (err) {
      addToast({ message: formatError(err), severity: "error" });
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Booked Appointments" },
      ]}
    >
      <Card>
        <PageHeader
          title="Booked Appointments"
          subtitle={`${data?.total ?? 0} total — requests from the public booking form`}
        />
        <Divider />
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                native
                label="Status"
                value={params.status ?? ""}
                onChange={(e) =>
                  setParams({ ...params, status: e.target.value || undefined, page: 1 })
                }
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormControl>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleFetch()}
            >
              Refresh
            </Button>
          </Stack>
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "#",
                width: 50,
                valueGetter: (item, index) =>
                  params.per_page * (params.page - 1) + index + 1,
              },
              {
                field: "full_name",
                headerName: "Full Name",
                flex: 1,
              },
              {
                field: "phone",
                headerName: "Phone",
                width: 140,
              },
              {
                field: "email",
                headerName: "Email",
                width: 200,
              },
              {
                field: "preferred_date",
                headerName: "Date",
                width: 120,
              },
              {
                field: "preferred_time",
                headerName: "Time",
                width: 90,
              },
              {
                field: "service",
                headerName: "Service",
                flex: 1,
              },
              {
                field: "status",
                headerName: "Status",
                width: 120,
                renderCell: (item) => (
                  <Chip
                    label={item.status}
                    color={statusColors[item.status] || "default"}
                    size="small"
                  />
                ),
              },
              {
                field: "created_at",
                headerName: "Submitted",
                width: 160,
              },
              {
                field: "actions",
                headerName: "Actions",
                width: 100,
                renderCell: (item) => (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="Change status">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, item)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteAppointment(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ),
              },
            ]}
            items={Array.isArray(data?.data) ? data.data : []}
            itemCount={data?.total ?? 0}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
            onPageSizeChange={(value) =>
              setParams({ ...params, per_page: value, page: 1 })
            }
          />
        </CardContent>
      </Card>
      {item ? (
        <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}>
          {["pending", "confirmed", "cancelled"]
            .filter((s) => s !== item.status)
            .map((s) => (
              <MenuItem
                key={s}
                onClick={() => {
                  handleMenuClose();
                  changeStatus(item.id, s);
                }}
              >
                Mark as {s}
              </MenuItem>
            ))}
        </Menu>
      ) : null}
    </Page>
  );
};

export default Appointments;
