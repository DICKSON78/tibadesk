import React, { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import Filters from "../expenses/Filters";
import {
  formatDateForDb,
  getDateRangeTitle,
  numberFormat,
} from "../../../helpers";

const Expenses = ({ module, createdBy }) => {
  const [params, setParams] = useState({
    status: undefined,
    category_id: undefined,
    start_date: undefined,
    end_date: undefined,
    created_by: undefined,
  });

  useEffect(() => {
    document.title = `Expenses Report - ${window.APP_NAME}`;
  }, []);

  const getStatus = (item) => {
    if (item.paid_amount < item.total_amount) {
      return "Pending";
    }

    if (item.paid_amount >= item.total_amount) {
      return "Cleared";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Cleared":
        return "success";
    }

    return "neutral";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Financial Management" },
        { title: "Reports" },
        { title: "Expenses Report" },
      ]}
    >
      <Report
        title="Expenses Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/expenses"
        params={{
          ...params,
          created_by: createdBy,
          start_date: params.start_date
            ? formatDateForDb(params.start_date)
            : undefined,
          end_date: params.end_date
            ? formatDateForDb(params.end_date)
            : undefined,
        }}
        prependInner={
          <Filters
            params={params}
            setParams={setParams}
            sx={{ mb: 2 }}
          />
        }
        columns={[
          {
            field: "expense_date",
            headerName: "Expense Date",
          },
          {
            field: "category_id",
            headerName: "Category",
            valueGetter: (item, index) => item.category.name,
          },
          {
            field: "total_amount",
            headerName: "Total Amount",
            valueGetter: (item, index) => numberFormat(item.total_amount),
          },
          {
            field: "paid_amount",
            headerName: "Paid Amount",
            valueGetter: (item, index) => numberFormat(item.paid_amount),
          },
          {
            field: "remaining_amount",
            headerName: "Remaining Amount",
            valueGetter: (item, index) =>
              numberFormat(item.total_amount - item.paid_amount),
          },
          {
            field: "description",
            headerName: "Description",
          },
          {
            field: "created_by",
            headerName: "Created By",
            valueGetter: (item, index) => item.creator?.full_name,
          },
          {
            field: "created_at",
            headerName: "Date Created",
          },
          {
            field: "status",
            headerName: "Status",
            renderCell: (item) => (
              <Chip
                size="small"
                color={getStatusColor(getStatus(item))}
                label={getStatus(item)}
              />
            ),
            valueGetter: (item, index) => getStatus(item),
          },
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 3, index: 1 },
          { reducer: (acc, item, index) => acc + (parseFloat(item.total_amount) || 0), index: 2 },
          { reducer: (acc, item, index) => acc + (parseFloat(item.paid_amount) || 0), index: 3 },
          {
            reducer: (acc, item, index) =>
              acc + ((parseFloat(item.total_amount) || 0) - (parseFloat(item.paid_amount) || 0)),
            index: 4,
          },
        ]}
      />
    </Page>
  );
};

export default Expenses;
