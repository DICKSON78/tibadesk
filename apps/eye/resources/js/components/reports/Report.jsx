import React, { useEffect, useState } from "react";

import { Card, CardContent, Divider } from "@mui/material";
import { Header as PageHeader } from "../Page";
import Table from "../Table";
import PDFReport from "./PDFReport";
import SpreadsheetReport from "./SpreadsheetReport";

import { formatError, numberFormat } from "../../helpers";
import { useFetch, useToast } from "../../hooks";

const Report = ({
  title,
  subtitle,
  uri,
  params,
  columns,
  pdfOrientation,
  onFetch,
  headerTrailingContent,
  prependInner,
  nestedObject,
  nestedColumns,
  summationFooterColumns,
}) => {
  columns = Array.isArray(columns) ? columns.filter((e) => typeof e.show === "undefined" || e.show) : [];

  const addToast = useToast();
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const { data, loading, error, handleFetch } = useFetch(
    uri,
    {
      per_page: perPage,
      page,
      ...params,
    },
    true,
    { total: 0, data: [] },
    (response) => response.data.data
  );

  useEffect(() => {
    if (typeof onFetch === "function") {
      onFetch(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const getFooterItems = () => {
    let footerColumns = [];
    if (Array.isArray(summationFooterColumns)) {
      footerColumns = summationFooterColumns.map((col) => {
        if (typeof col.reducer === "function") {
          const total = Array.isArray(data.data) ? data.data.reduce(col.reducer, 0) : 0;
          // Ensure the total is a valid number before formatting
          const numericTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
          col.value = numberFormat(numericTotal);
        }

        if (typeof col.span === "number") {
          col.tableCellProps = { colSpan: col.span };
        }

        return col;
      });
    }

    return footerColumns;
  };

  return (
    <Card>
      <PageHeader
        title={title}
        trailing={
          <React.Fragment>
            {headerTrailingContent}
            <PDFReport
              title={title}
              subtitle={subtitle}
              columns={Array.isArray(columns) ? columns.filter(
                (col) => typeof col.webOnly === "undefined" || !col.webOnly
              ) : []}
              items={Array.isArray(data.data) ? data.data : []}
              orientation={pdfOrientation}
              nestedObject={nestedObject}
              nestedColumns={nestedColumns}
              summationFooterColumns={summationFooterColumns}
            />
            <SpreadsheetReport
              title={title}
              columns={Array.isArray(columns) ? columns.filter(
                (col) => typeof col.webOnly === "undefined" || !col.webOnly
              ) : []}
              items={Array.isArray(data.data) ? data.data : []}
              format="xlsx"
            />
          </React.Fragment>
        }
      />
      <Divider />
      <CardContent>
        {prependInner}
        <Table
          loading={loading}
          columns={[
            {
              field: "index",
              headerName: "S/N",
              tableCellProps: { sx: { width: 50 } },
              valueGetter: (item, index) => perPage * (page - 1) + index + 1,
            },
            ...(columns || []),
          ]}
          items={Array.isArray(data.data) ? data.data : []}
          itemCount={data.total}
          page={page}
          pageSize={perPage}
          onPageChange={(page) => setPage(page)}
          onPageSizeChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          renderExpanded={
            nestedObject
              ? (item, index) => (
                  <Table
                    columns={[
                      {
                        field: "index",
                        headerName: "S/N",
                        tableCellProps: { sx: { width: 50 } },
                        valueGetter: (item, index) => index + 1,
                      },
                      ...(nestedColumns || []),
                    ]}
                    items={
                      Array.isArray(data.data) && data.data[index] ? data.data[index][nestedObject] : []
                    }
                    hidePaginationFooter
                  />
                )
              : null
          }
          repeatHead={!!nestedObject}
          footerItems={summationFooterColumns ? [getFooterItems()] : null}
        />
      </CardContent>
    </Card>
  );
};

export default Report;
