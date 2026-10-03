import React, { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/DownloadRounded";
import { Document, Font, Page, pdf } from "@react-pdf/renderer";

// Use public path for fonts to avoid build issues
const fontRegular = "/fonts/Custom-Regular.ttf";
const fontItalic = "/fonts/Custom-Italic.ttf";
const fontBold = "/fonts/Custom-Bold.ttf";

import Header from "../pdf/Header";
import Footer from "../pdf/Footer";
import Table from "../pdf/Table";
import { numberFormat } from "../../helpers";

Font.register({
  family: "Custom",
  fonts: [
    { src: fontRegular },
    { src: fontItalic, fontStyle: "italic" },
    { src: fontBold, fontWeight: 700 },
  ],
});

const PDFReportDocument = ({
  title,
  subtitle,
  orientation,
  columns,
  items,
  nestedObject,
  nestedColumns,
  summationFooterColumns,
}) => {
  const getFooterItems = () => {
    // generate corresponding empty columns
    let footerColumns = [
      { value: null, style: { flex: 0.5 } }, // index cell
      ...columns.map((col) => {
        return { value: null, style: col.style };
      }),
    ];

    // replace values with the given value at provided index
    summationFooterColumns.forEach((col, index) => {
      if (typeof col.reducer === "function") {
        footerColumns[col.index || index].value = numberFormat(
          items.reduce(col.reducer, 0)
        );
      } else {
        footerColumns[col.index || index].value = col.value;
      }
    });

    return footerColumns;
  };

  return (
    <Document
      title={title}
      creator={window.APP_NAME}
      producer={window.APP_NAME}
    >
      <Page
        size="A4"
        style={{
          width: "100%",
          backgroundColor: "white",
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 35,
        }}
        orientation={orientation || "portrait"}
      >
        <Header
          title={title}
          subtitle={subtitle}
        />

        <Table
          containerStyle={{ marginBottom: 16 }}
          columns={[
            {
              field: "index",
              headerName: "S/N",
              flex: 0.5,
              valueGetter: (item, index) => index + 1,
            },
            ...(columns || []),
          ]}
          items={items}
          renderExpanded={
            nestedObject
              ? (item, index) => (
                  <Table
                    columns={[
                      {
                        field: "index",
                        headerName: "S/N",
                        valueGetter: (item, index) => index + 1,
                      },
                      ...(nestedColumns || []),
                    ]}
                    items={items[index] ? items[index][nestedObject] : []}
                  />
                )
              : null
          }
          repeatHead={!!nestedObject}
          footerItems={summationFooterColumns ? [getFooterItems()] : null}
        />

        <Footer
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

const PDFReport = ({ title, columns, items, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const generatePdfDocument = useCallback(async () => {
    setLoading(true);
    const blob = await pdf(
      <PDFReportDocument
        title={title}
        columns={columns}
        items={items}
        {...rest}
      />
    ).toBlob();
    setLoading(false);
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, [title, columns, items]);

  return (
    <Button
      disabled={loading}
      variant="contained"
      color="secondary"
      startIcon={<DownloadIcon />}
      onClick={generatePdfDocument}
    >
      {loading ? "Generating PDF..." : "PDF"}
    </Button>
  );
};

export default PDFReport;
