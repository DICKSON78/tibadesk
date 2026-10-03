import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import SettingsIcon from "@mui/icons-material/SettingsRounded";
import Page, { Header as PageHeader } from "../../../../components/Page";
import Table from "../../../../components/Table";
import Modal from "../../../../components/Modal";
import Filters from "./Filters";
import CreateItem from "./CreateItem";
import EditItem from "./EditItem";
import ManageItemPrices from "./ManageItemPrices";

import { useFetch, useToast } from "../../../../hooks";
import { formatError } from "../../../../helpers";

const Items = () => {
  const addToast = useToast();

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    clinic_id: undefined,
    status: undefined,
    q: undefined,
    item_type_id: undefined,
    consultation_type_id: undefined,
    is_consultation_item: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/items",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Items - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openCreateItemModal = () => {
    let component = (
      <CreateItem
        modal={modalRef.current}
        fetchItems={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Item", component);
  };

  const openEditItemModal = (item) => {
    let component = (
      <EditItem
        item={item}
        modal={modalRef.current}
        fetchItems={handleFetch}
      />
    );

    modalRef.current.open("Edit Item", component);
  };

  const openManageItemPricesModal = (item) => {
    let component = (
      <ManageItemPrices
        item={item}
        modal={modalRef.current}
        fetchItems={handleFetch}
      />
    );

    modalRef.current.open("Manage Item Prices", component, "md", item.name);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
    }

    return "neutral";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Settings" },
        { title: "Item Management" },
        { title: "Items" },
      ]}
    >
      <Card>
        <PageHeader
          title="Items"
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateItemModal}
              >
                New Item
              </Button>
            </React.Fragment>
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
                field: "name",
                headerName: "Item Name",
              },
              {
                field: "code",
                headerName: "Item Code",
              },
              {
                field: "item_type_id",
                headerName: "Item Type",
                valueGetter: (item, index) => item.item_type?.name,
              },
              {
                field: "consultation_type_id",
                headerName: "Consultation Type",
                valueGetter: (item, index) => item.consultation_type?.name,
              },
              {
                field: "unit_of_measure_id",
                headerName: "Unit of Measure",
                valueGetter: (item, index) => item.unit_of_measure?.name,
              },
              {
                field: "lens_type_id",
                headerName: "Lens Type",
                valueGetter: (item, index) => item.lens_type?.name,
              },
              {
                field: "prices",
                headerName: "Prices",
                renderCell: (item) => (
                  <Tooltip title="Manage">
                    <IconButton
                      size="small"
                      onClick={() => openManageItemPricesModal(item)}
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              },
              {
                field: "status",
                headerName: "Status",
                renderCell: (item) => (
                  <Chip
                    size="small"
                    color={getStatusColor(item.status)}
                    label={item.status}
                  />
                ),
              },
              {
                field: "clinic_id",
                headerName: "Clinic",
                valueGetter: (item) => item.clinic?.name,
                show: window.user.role === "Admin",
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
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEditItemModal(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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

export default Items;
