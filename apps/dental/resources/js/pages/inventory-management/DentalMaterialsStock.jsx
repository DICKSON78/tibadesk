import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "../../components/ui/index.jsx";

import Page, { Header as PageHeader } from "../../components/Page";
import Table, { SearchTextField } from "../../components/Table";
import Select from "../../components/Select";
import TextField from "../../components/TextField";
import DatePicker from "../../components/DatePicker";
import Modal from "../../components/Modal";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import { useFetch, useToast } from "../../hooks";
import { formatError, numberFormat, throttle } from "../../helpers";
import Descriptions from "../../components/Descriptions";
import { CancelRounded as CancelIcon, Edit as EditIcon, RefreshRounded as RefreshIcon, SaveRounded as SaveIcon } from "../../components/ui/icons.jsx";

const DentalMaterialsStock = () => {
  const addToast = useToast();
  const modalRef = useRef();

  const [searchQuery, setSearchQuery] = useState();
  const [itemTypeFilter, setItemTypeFilter] = useState();
  const [stockStatusFilter, setStockStatusFilter] = useState();
  const [dateFilter, setDateFilter] = useState(new Date());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editBalance, setEditBalance] = useState("");
  const [editNewBalance, setEditNewBalance] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: itemTypes } = useFetch(
    "api/item-types",
    { status: "Active", per_page: 500 },
    true,
    [],
    (response) => response.data.data.data
  );

  const { data, loading, error, handleFetch } = useFetch(
    "api/items",
    {
      status: "Active",
      is_stock_item: "Yes",
      item_type: "Dental Materials",
      item_type_id: itemTypeFilter,
      stock_status: stockStatusFilter,
      q: searchQuery,
      date: dateFilter instanceof Date && !isNaN(dateFilter) ? dateFilter.toISOString().split('T')[0] : null,
      per_page: perPage,
      page: page,
      include_all_stock: "Yes",
    },
    true,
    { data: [], total: 0 },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Dental Materials Stock - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditBalance(item.balance || 0);
    setEditNewBalance(item.new_balance || 0);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditBalance("");
    setEditNewBalance("");
  };

  const handleSaveStock = (item) => {
    const component = (
      <ConfirmationDialog
        message={`Are you sure you want to update stock for "${item.name}"?\n\nCurrent Balance: ${editBalance}\nNew Stock Added: ${editNewBalance}`}
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          performSave(item);
        }}
      />
    );
    modalRef.current.open("Confirm Stock Update", component, "sm");
  };

  const performSave = async (item) => {
    setSaving(true);
    try {
      await window.axios.put(`/api/items/${item.id}`, {
        balance: parseFloat(editBalance) || 0,
        new_balance: parseFloat(editNewBalance) || 0,
      });
      addToast({ message: `Stock updated for ${item.name}`, severity: "success" });
      setEditingItemId(null);
      handleFetch();
    } catch (err) {
      addToast({ message: formatError(err), severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (item) => {
    const stock = parseFloat(item.balance) || 0;
    
    if (stock <= 0) {
      return <Chip label="Out of Stock" size="small" color="error" variant="outlined" />;
    }
    if (stock <= (item.minimum_stock || 5)) {
      return <Chip label="Low Stock" size="small" color="warning" variant="outlined" />;
    }
    return <Chip label="In Stock" size="small" color="success" variant="outlined" />;
  };

  const items = Array.isArray(data.data) ? data.data : [];
  const outOfStock = items.filter(i => (parseFloat(i.balance) || 0) <= 0).length;
  const lowStock = items.filter(i => {
    const total = parseFloat(i.balance) || 0;
    return total > 0 && total <= (i.minimum_stock || 5);
  }).length;

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Stock Management" },
        { title: "Dental Materials Stock" },
      ]}
    >
      <Card>
        <PageHeader title="Dental Materials Stock Management" />
        <Divider />
        {(loading || saving) && <LinearProgress />}
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
            <DatePicker
              label="Date"
              value={dateFilter}
              onChange={(value) => { setDateFilter(value); setPage(1); }}
              sx={{ width: 180 }}
            />
            <Select
              label="Item Type"
              placeholder="Filter by Item Type"
              options={itemTypes}
              optionsLabel="name"
              optionsValue="id"
              value={itemTypeFilter}
              clearable
              onChange={(value) => { setItemTypeFilter(value); setPage(1); }}
              sx={{ minWidth: 180 }}
            />
            <Select
              label="Stock Status"
              placeholder="Filter by Stock Status"
              category="stockLevel"
              value={stockStatusFilter}
              clearable
              onChange={(value) => { setStockStatusFilter(value); setPage(1); }}
              sx={{ minWidth: 180 }}
            />
            <SearchTextField
              label="Search"
              placeholder="Search materials..."
              onChange={(value) =>
                throttle(() => { setSearchQuery(value); setPage(1); }, 1000)
              }
              sx={{ width: 220 }}
            />
            <Tooltip title="Refresh">
              <IconButton onClick={handleFetch} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dental Materials Stock Summary
              </Typography>
              <Descriptions
                columns={3}
                items={[
                  {
                    label: "Total Materials",
                    value: data.total || 0,
                  },
                  {
                    label: "Out of Stock",
                    value: outOfStock,
                    sx: { color: 'error.main', fontWeight: 'bold' }
                  },
                  {
                    label: "Low Stock",
                    value: lowStock,
                    sx: { color: 'warning.main', fontWeight: 'bold' }
                  },
                ]}
                containerProps={{
                  variant: "outlined",
                  sx: { p: 2 },
                }}
              />
            </CardContent>
          </Card>
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) => perPage * (page - 1) + index + 1,
                tableCellProps: { sx: { width: 60 } },
              },
              {
                field: "name",
                headerName: "Material Name",
                valueGetter: (item) => item.name,
                tableCellProps: { sx: { width: 200 } },
              },
              {
                field: "item_type",
                headerName: "Item Type",
                valueGetter: (item) => item.item_type?.name || "N/A",
                tableCellProps: { sx: { width: 150 } },
              },
              {
                field: "balance",
                headerName: "Quantity (IN)",
                tableCellProps: { sx: { width: 120 } },
                renderCell: (item) => {
                  if (editingItemId === item.id) {
                    return (
                      <TextField
                        size="small"
                        type="number"
                        value={editBalance}
                        onChange={(value) => setEditBalance(value)}
                        sx={{ width: 100 }}
                      />
                    );
                  }
                  const balance = parseFloat(item.balance) || 0;
                  const dispensed = parseInt(item.dispensed_count) || 0;
                  return numberFormat((balance + dispensed) < 0 ? 0 : (balance + dispensed));
                },
              },
              {
                field: "dispensed_count",
                headerName: "Dispensed",
                tableCellProps: { sx: { width: 120 } },
                valueGetter: (item) => {
                  const dispensed = parseInt(item.dispensed_count) || 0;
                  return numberFormat(dispensed);
                },
              },
              {
                field: "remain_stock",
                headerName: "Remaining Stock",
                tableCellProps: { sx: { width: 120 } },
                renderCell: (item) => {
                  const balance = parseFloat(item.balance) || 0;
                  return numberFormat(balance < 0 ? 0 : balance);
                },
              },
              {
                field: "status",
                headerName: "Status",
                tableCellProps: { sx: { width: 120 } },
                renderCell: (item) => getStockStatus(item),
              },
              {
                field: "actions",
                headerName: "Actions",
                tableCellProps: { sx: { width: 100 } },
                renderCell: (item) => {
                  if (editingItemId === item.id) {
                    return (
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Save">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSaveStock(item)}
                            disabled={saving}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    );
                  }
                  return (
                    <Tooltip title="Edit Stock">
                      <IconButton
                        size="small"
                        onClick={() => handleStartEdit(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  );
                },
              },
            ]}
            items={items}
            itemCount={data.total}
            page={page}
            pageSize={perPage}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(value) => { setPerPage(value); setPage(1); }}
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default DentalMaterialsStock;
