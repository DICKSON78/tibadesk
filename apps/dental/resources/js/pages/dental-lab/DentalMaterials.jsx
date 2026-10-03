import React, { useEffect, useState } from "react";
import {
  Button, Box, IconButton, Stack, Tooltip, Divider, Chip,
} from "../../components/ui/index.jsx";
import {
  AddRounded as AddIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
} from "../../components/ui/icons.jsx";

import Page from "../../components/Page";
import Report from "../../components/reports/Report";
import { SearchTextField } from "../../components/Table";

import { numberFormat, throttle, formatError, isAdmin } from "../../helpers";
import Modal from "../../components/Modal";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useDelete, useToast } from "../../hooks";

const DentalMaterials = () => {
  const addToast = useToast();
  const modalRef = React.useRef();
  const { handleDelete, loading: deleting, error: deleteError } = useDelete();
  const [params, setParams] = useState({
    item_type: "Dental Material",
    status: "Active",
    search: undefined,
  });

  useEffect(() => {
    document.title = `Dental Materials - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (deleteError) {
      addToast({ message: formatError(deleteError), severity: "error" });
    }
  }, [deleteError]);

  const confirmDelete = (item) => {
    const component = (
      <ConfirmationDialog
        message={`Delete material "${item.name}"?`}
        onCancel={() => modalRef.current.close()}
        onOk={async () => {
          await handleDelete(`api/items/${item.id}`);
          modalRef.current.close();
          addToast({ message: "Material deleted successfully", severity: "success" });
          window.location.reload();
        }}
      />
    );
    modalRef.current.open("Confirm Delete", component);
  };

  return (
    <Page
      title="Dental Materials"
      breadcrumbs={[
        { title: "Home" },
        { title: "Dental Lab" },
        { title: "Materials" },
      ]}
    >
      <Report
        title="Dental Materials Inventory"
        uri="api/items"
        params={params}
        headerTrailingContent={
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <SearchTextField
              placeholder="Search Material"
              onChange={(value) =>
                throttle(() => setParams({ ...params, search: value }), 1000)
              }
              sx={{ width: 200 }}
            />
          </Box>
        }
        columns={[
          {
            field: "name",
            headerName: "Material Name",
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
            headerName: "Stock",
            valueGetter: (item) => numberFormat(item.balance || 0),
            tableCellProps: { sx: { width: 100 } },
            renderCell: (item) => {
              const balance = item.balance || 0;
              return (
                <Chip
                  label={numberFormat(balance)}
                  size="small"
                  color={balance <= 0 ? "error" : balance <= 5 ? "warning" : "success"}
                />
              );
            },
          },
          {
            field: "unit_buying_price",
            headerName: "Unit Price (TZS)",
            valueGetter: (item) => numberFormat(item.unit_buying_price || 0),
            tableCellProps: { sx: { width: 150 } },
          },
          {
            field: "consultation_type",
            headerName: "Category",
            valueGetter: (item) => item.consultation_type?.name || 'General',
            tableCellProps: { sx: { width: 120 } },
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
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {isAdmin() && (
                  <Tooltip title={deleting ? "Deleting..." : "Delete"}>
                    <IconButton size="small" disabled={deleting} onClick={() => confirmDelete(item)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            ),
          },
        ]}
      />
      <Modal ref={modalRef} />
    </Page>
  );
};

export default DentalMaterials;
