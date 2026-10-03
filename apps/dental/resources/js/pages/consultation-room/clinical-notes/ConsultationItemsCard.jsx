import React from "react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
} from "../../../components/ui/index.jsx";
import Table from "../../../components/Table";

const ConsultationItemsCard = ({
  title,
  consultationType,
  loading,
  items,
  consultation,
  onClickAdd,
  showAllTypes,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Paid":
        return "info";
      case "Billed":
        return "purple";
      case "Served":
        return "success";
    }
    return "neutral";
  };

  const getStatusLabel = (status) => {
    if (status === "Pending") {
      return "Not Paid";
    }
    if (status === "Served") {
      return "Dispensed";
    }
    return status;
  };

  const filteredItems = showAllTypes
    ? items
    : items.filter((e) => e.consultation_type.name === consultationType);

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardHeader title={title} />
      <Divider />
      <CardContent>
        <Table
          loading={loading}
          columns={[
            {
              field: "index",
              headerName: "S/N",
              valueGetter: (item, index) => index + 1,
            },
            {
              field: "item_name",
              headerName: "Item Name",
              valueGetter: (item, index) => item.item.name,
            },
            {
              field: "item_type",
              headerName: "Type",
              show: showAllTypes,
              valueGetter: (item, index) => item.consultation_type?.name || "-",
            },
            {
              field: "dosage",
              headerName: "Dosage",
              show: showAllTypes || consultationType === "Pharmacy",
            },
            {
              field: "comments",
              headerName: "Comments",
              show: !showAllTypes && consultationType !== "Pharmacy",
            },
            {
              field: "status",
              headerName: "Status",
              renderCell: (item, index) => (
                <Chip
                  size="small"
                  color={getStatusColor(item.status)}
                  label={getStatusLabel(item.status)}
                />
              ),
            },
          ]}
          items={filteredItems}
          hideNoItemsOverlayIcon
          hidePaginationFooter
          footerItems={[
            [
              {
                value: "",
                tableCellProps: { colSpan: 3 },
              },
              {
                value: (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => onClickAdd && onClickAdd(title, consultationType)}
                  >
                    Add
                  </Button>
                ),
              },
            ],
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default ConsultationItemsCard;
