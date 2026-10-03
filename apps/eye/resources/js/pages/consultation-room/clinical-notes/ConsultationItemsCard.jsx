import React from "react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
} from "@mui/material";
import Table from "../../../components/Table";

const ConsultationItemsCard = ({
  title,
  consultationType,
  loading,
  items,
  consultation,
  onClickAdd,
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

    if (consultationType === "Pharmacy" || consultationType === "Glass") {
      if (status === "Served") {
        return "Dispensed";
      }
    }

    return status;
  };

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
              field: "dosage",
              headerName: "Dosage",
              show: consultationType === "Pharmacy",
            },
            {
              field: "comments",
              headerName: "Comments",
              show: consultationType !== "Pharmacy",
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
          items={items.filter(
            (e) => e.consultation_type.name === consultationType
          )}
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
                    color="secondary"
                    size="small"
                    onClick={() => onClickAdd(title, consultationType)}
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
