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
import Page, { Header as PageHeader } from "../../../components/Page";
import Table from "../../../components/Table";
import Modal from "../../../components/Modal";
import Filters from "./Filters";
import CreateExpense from "./CreateExpense";
import EditExpense from "./EditExpense";
import ExpensePaymentsModal from "./ExpensePaymentsModal";

import { useFetch, useToast } from "../../../hooks";
import { formatDateForDb, formatError, numberFormat } from "../../../helpers";

const Expenses = ({ module, createdBy }) => {
  const addToast = useToast();
  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    status: "Pending",
    category_id: undefined,
    created_by: createdBy,
    start_date: undefined,
    end_date: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch(
    "api/expenses",
    {
      ...params,
      created_by: createdBy,
      start_date: params.start_date
        ? formatDateForDb(params.start_date)
        : undefined,
      end_date: params.end_date ? formatDateForDb(params.end_date) : undefined,
    },
    true,
    {
      data: [],
      total: 0,
      page: 1,
    },
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Expenses - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const openCreateExpenseModal = () => {
    let component = (
      <CreateExpense
        modal={modalRef.current}
        fetchExpenses={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Expense", component);
  };

  const openEditExpenseModal = (item) => {
    let component = (
      <EditExpense
        item={item}
        modal={modalRef.current}
        fetchExpenses={handleFetch}
      />
    );

    modalRef.current.open("Edit Expense", component);
  };

  const openExpensePaymentsModal = (item) => {
    let component = (
      <ExpensePaymentsModal
        expense={item}
        modal={modalRef.current}
        fetchExpenses={handleFetch}
      />
    );

    modalRef.current.open("Expense Payments", component, "lg");
  };

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
        { title: "Expenses" },
      ]}
    >
      <Card>
        <PageHeader
          title="Expenses"
          trailing={
            <React.Fragment>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateExpenseModal}
              >
                New Expense
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
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (item) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Tooltip title="Edit">
                      <span>
                        <IconButton
                          disabled={item.paid_amount >= item.total_amount}
                          size="small"
                          onClick={() => openEditExpenseModal(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => openExpensePaymentsModal(item)}
                    >
                      Payments
                    </Button>
                  </Stack>
                ),
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
                { value: "TOTAL", tableCellProps: { colSpan: 3 } },
                {
                  value: numberFormat(
                    Array.isArray(data.data) ? data.data.reduce((acc, item) => acc + (parseFloat(item.total_amount) || 0), 0) : 0
                  ),
                },
                {
                  value: numberFormat(
                    Array.isArray(data.data) ? data.data.reduce((acc, item) => acc + (parseFloat(item.paid_amount) || 0), 0) : 0
                  ),
                },
                {
                  value: numberFormat(
                    Array.isArray(data.data) ? data.data.reduce(
                      (acc, item) =>
                        acc + ((parseFloat(item.total_amount) || 0) - (parseFloat(item.paid_amount) || 0)),
                      0
                    ) : 0
                  ),
                },
              ],
            ]}
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Expenses;
