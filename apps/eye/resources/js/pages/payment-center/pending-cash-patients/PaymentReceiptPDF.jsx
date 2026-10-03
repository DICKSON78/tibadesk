import React from "react";
import { Document, Font, Page } from "@react-pdf/renderer";

// Use system fonts as fallback to avoid font loading issues
const fontRegular = "Helvetica";
const fontItalic = "Helvetica-Oblique";
const fontBold = "Helvetica-Bold";

import Header from "../../../components/pdf/Header";
import Descriptions from "../../../components/pdf/Descriptions";
import Table from "../../../components/pdf/Table";
import { numberFormat } from "../../../helpers";

// Register fonts with system fonts to avoid loading issues
Font.register({
  family: "Custom",
  fonts: [
    { src: fontRegular },
    { src: fontItalic, fontStyle: "italic" },
    { src: fontBold, fontWeight: 700 },
  ],
});

const PDFReportDocument = ({ receipt, items, patient }) => {
  const getTotalAmount = () => {
    return items.reduce(
      (acc, e) => acc + (e.unit_price || 0) * (e.quantity || 0),
      0
    );
  };

  return (
    <Document
      title="Payment Receipt"
      creator={window.APP_NAME}
      producer={window.APP_NAME}
    >
      <Page
        size={[300]}
        style={{
          width: "100%",
          backgroundColor: "white",
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 18,
        }}
        orientation="portrait"
      >
        <Header
          title="Payment Receipt"
          dense
        />

        <Descriptions
          columns={2}
          vertical
          items={[
            { label: "Customer Name", value: patient.full_name },
            { label: "Receipt Number", value: receipt.id },
            { label: "Receipt Amount", value: numberFormat(receipt.amount) },
            { label: "Discount", value: numberFormat(receipt.discount) },
            { label: "Created By", value: receipt.creator?.full_name },
            { label: "Date Created", value: receipt.created_at },
          ]}
          containerStyle={{ marginBottom: 8 }}
        />

        <Table
          containerStyle={{ marginBottom: 12 }}
          columns={[
            {
              field: "index",
              headerName: "S/N",
              valueGetter: (item, index) => index + 1,
              style: { flex: 0.35 },
            },
            {
              field: "item_id",
              headerName: "Item Name",
              valueGetter: (item, index) => item.item.name,
              style: { flex: 2 },
            },
            {
              field: "quantity",
              headerName: "Quantity",
              valueGetter: (item, index) => numberFormat(item.quantity),
            },
            {
              field: "total_price",
              headerName: "Subtotal",
              valueGetter: (item, index) =>
                numberFormat((item.unit_price || 0) * item.quantity),
            },
          ]}
          items={items}
          footerItems={[
            [
              { value: "TOTAL", style: { flex: 0.786 } },
              { value: numberFormat(getTotalAmount()), style: { flex: 0.214 } },
            ],
          ]}
        />

        <Descriptions
          columns={2}
          items={[
            {
              label: "GRAND TOTAL",
              value: numberFormat(getTotalAmount() - receipt.discount),
            },
          ]}
          valueStyle={{ fontWeight: "bold" }}
        />
      </Page>
    </Document>
  );
};

export default PDFReportDocument;
