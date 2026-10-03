import React, { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "../../components/Table";

import { useFetch, useToast } from "../../hooks";
import { formatError, numberFormat } from "../../helpers";

const PatientPaymentHistory = ({ patient }) => {
  const addToast = useToast();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    patient_id: patient.id,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/reports/payment-center/cash-collection",
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
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  return (
    <Card sx={{ 
      borderTopLeftRadius: 0,
      width: "100%",
      bgcolor: "background.paper",
      boxShadow: 1,
    }}>
      <CardContent sx={{ p: 3 }}>
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
              field: "items",
              headerName: "Items",
            },
            {
              field: "amount",
              headerName: "Amount",
              valueGetter: (item, index) => numberFormat(item.amount),
            },
            {
              field: "discount",
              headerName: "Discount",
              valueGetter: (item, index) => numberFormat(item.discount),
            },
            {
              field: "subtotal",
              headerName: "Subtotal",
              valueGetter: (item, index) =>
                numberFormat(item.amount - item.discount),
            },
            {
              field: "channel",
              headerName: "Payment Channel",
              valueGetter: (item, index) => item.channel?.name,
            },
            {
              field: "created_by",
              headerName: "Created By",
              valueGetter: (item) => item.creator?.full_name,
            },
            {
              field: "created_at",
              headerName: "Date Created",
            },
            {
              field: "transaction_type",
              headerName: "Transaction Type",
            },
          ]}
          items={Array.isArray(data.data) ? data.data : []}
          itemCount={data.total}
          page={params.page}
          pageSize={params.per_page}
          onPageChange={(page) => setParams({ ...params, page })}
          onPageSizeChange={(value) =>
            setParams({ ...params, per_page: value, page: 1 })
          }
          footerItems={[
            [
              { value: "TOTAL", tableCellProps: { colSpan: 2 } },
              {
                value: numberFormat(
                  Array.isArray(data.data) ? data.data.reduce((acc, item, index) => acc + (parseFloat(item.amount) || 0), 0) : 0
                ),
              },
              {
                value: numberFormat(
                  Array.isArray(data.data) ? data.data.reduce((acc, item, index) => acc + (parseFloat(item.discount) || 0), 0) : 0
                ),
              },
              {
                value: numberFormat(
                  Array.isArray(data.data) ? data.data.reduce(
                    (acc, item, index) => acc + ((parseFloat(item.amount) || 0) - (parseFloat(item.discount) || 0)),
                    0
                  ) : 0
                ),
              },
            ],
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default PatientPaymentHistory;
