import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
} from "@mui/icons-material";

import Page from "../../components/Page";
import Report from "../../components/reports/Report";
import { SearchTextField } from "../../components/Table";

import { numberFormat, throttle, formatError } from "../../helpers";
import Modal from "../../components/Modal";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useDelete, useToast } from "../../hooks";

const Medicines = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const modalRef = React.useRef();
  const { handleDelete, loading: deleting, error: deleteError } = useDelete();
  const [params, setParams] = useState({
    status: "Active",
    search: undefined,
  });

  useEffect(() => {
    document.title = `Medicines - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (deleteError) {
      addToast({ message: formatError(deleteError), severity: "error" });
    }
  }, [deleteError]);

  const confirmDelete = (item) => {
    const component = (
      <ConfirmationDialog
        message={`Delete medicine "${item.name}"?`}
        onCancel={() => modalRef.current.close()}
        onOk={async () => {
          await handleDelete(`api/medicines/${item.id}`);
          modalRef.current.close();
          addToast({ message: "Medicine deleted successfully", severity: "success" });
          window.location.reload();
        }}
      />
    );
    modalRef.current.open("Confirm Delete", component);
  };

  return (
    <Page
      title="Medicines"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicines" },
      ]}
    >
      <Report
        title="All Medicines"
        uri="api/medicines"
        params={params}
        headerTrailingContent={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <SearchTextField
              placeholder="Search Medicine"
              onChange={(value) =>
                throttle(() => setParams({ ...params, search: value }), 1000)
              }
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/medicine-center/add-medicine')}
            >
              Add Medicine
            </Button>
          </Box>
        }
        columns={[
          {
            field: "name",
            headerName: "Medicine Name",
            valueGetter: (item) => item.name,
            tableCellProps: { sx: { width: 250 } },
          },
          {
            field: "unit_of_measure_id",
            headerName: "Unit",
            valueGetter: (item) => item.unit_of_measure?.name || 'N/A',
            tableCellProps: { sx: { width: 100 } },
          },
          {
            field: "balance",
            headerName: "Current Stock",
            valueGetter: (item) => numberFormat(item.balance || 0),
            tableCellProps: { sx: { width: 120 } },
          },
          {
            field: "unit_buying_price",
            headerName: "Unit Price (TZS)",
            valueGetter: (item) => numberFormat(item.unit_buying_price || 0),
            tableCellProps: { sx: { width: 150 } },
          },
          {
            field: "expiry_date",
            headerName: "Expiry Date",
            valueGetter: (item) => {
              if (!item.expiry_date) return 'No expiry';
              return new Date(item.expiry_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            },
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
                divider={<Divider orientation="vertical" sx={{ height: 16 }} />}
                spacing={1}
              >
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => navigate(`/medicine-center/medicines/${item.id}/edit`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={deleting ? "Deleting..." : "Delete"}>
                  <span>
                    <IconButton size="small" disabled={deleting} onClick={() => confirmDelete(item)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ),
          },
        ]}
      />
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Medicines;