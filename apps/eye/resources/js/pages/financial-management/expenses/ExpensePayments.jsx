import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import Table from "../../../components/Table";
import Page from "../../../components/Page";

import { useFetch, useToast } from "../../../hooks";
import { formatError, numberFormat } from "../../../helpers";

const ExpensePayments = () => {
  const addToast = useToast();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/expense-payments",
    params,
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data
  );

  useEffect(() => {
    document.title = `Expense Payments - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const getTotalAmount = () => {
    return Array.isArray(data.data) ? data.data.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0) : 0;
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Financial Management" },
        { title: "Expense Payments" },
      ]}
    >
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Expense Payments
          </Typography>
          
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
                field: "expense",
                headerName: "Expense",
                valueGetter: (item) => item.expense?.description || "-",
              },
              {
                field: "amount",
                headerName: "Amount",
                valueGetter: (item) => numberFormat(item.amount || 0),
              },
              {
                field: "description",
                headerName: "Description",
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
                { value: "TOTAL", tableCellProps: { colSpan: 4 } },
                { value: numberFormat(getTotalAmount()) },
              ],
            ]}
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default ExpensePayments;
