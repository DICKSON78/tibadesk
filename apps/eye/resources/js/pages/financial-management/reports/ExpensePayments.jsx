import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Page from "../../../components/Page";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import Report from "../../../components/reports/Report";

import { useFetch } from "../../../hooks";
import {
  formatDateForDb,
  getDateRangeTitle,
  numberFormat,
} from "../../../helpers";

const ExpensePayments = ({ module, createdBy }) => {
  const { data: categories } = useFetch(
    "api/expense-categories",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [params, setParams] = useState({
    with_expense: "Yes",
    category_id: undefined,
    start_date: undefined,
    end_date: undefined,
    created_by: createdBy,
    sort_direction: "desc",
  });

  useEffect(() => {
    document.title = `Expense Payments Report - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    setParams({ ...params, created_by: createdBy });
  }, [createdBy]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Financial Management" },
        { title: "Reports" },
        { title: "Expense Payments Report" },
      ]}
    >
      <Report
        title="Expense Payments Report"
        subtitle={getDateRangeTitle(params.start_date, params.end_date)}
        uri="api/expense-payments"
        params={{
          ...params,
          start_date: params.start_date
            ? formatDateForDb(params.start_date)
            : undefined,
          end_date: params.end_date
            ? formatDateForDb(params.end_date)
            : undefined,
        }}
        prependInner={
          <Card
            variant="outlined"
            sx={{
              bgcolor: "background.default",
              mb: 2,
            }}
          >
            <CardContent>
              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  md
                  sm={6}
                  xs={12}
                >
                  <DatePicker
                    fullWidth
                    label="Start Date"
                    value={params.start_date || null}
                    onChange={(value) =>
                      setParams({
                        ...params,
                        start_date: !isNaN(value) ? value : null,
                      })
                    }
                  />
                </Grid>
                <Grid
                  item
                  md
                  sm={6}
                  xs={12}
                >
                  <DatePicker
                    fullWidth
                    label="End Date"
                    value={params.end_date || null}
                    onChange={(value) =>
                      setParams({
                        ...params,
                        end_date: !isNaN(value) ? value : null,
                      })
                    }
                  />
                </Grid>
                <Grid
                  item
                  md
                  sm={6}
                  xs={12}
                >
                  <Select
                    label="Category"
                    fullWidth
                    options={categories}
                    optionsLabel="name"
                    optionsValue="id"
                    clearable
                    onChange={(value) =>
                      setParams({ ...params, category_id: value })
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        }
        columns={[
          {
            field: "expense_date",
            headerName: "Expense Date",
            valueGetter: (item, index) => item.expense.expense_date,
          },
          {
            field: "category_id",
            headerName: "Category",
            valueGetter: (item, index) => item.expense.category.name,
          },
          {
            field: "total_amount",
            headerName: "Total Amount",
            valueGetter: (item, index) =>
              numberFormat(item.expense.total_amount),
          },
          {
            field: "amount",
            headerName: "Payment Amount",
            valueGetter: (item, index) => numberFormat(item.amount),
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
        ]}
        summationFooterColumns={[
          { value: "TOTAL", span: 4, index: 1 },
          { reducer: (acc, item, index) => acc + (parseFloat(item.amount) || 0), index: 4 },
        ]}
      />
    </Page>
  );
};

export default ExpensePayments;
