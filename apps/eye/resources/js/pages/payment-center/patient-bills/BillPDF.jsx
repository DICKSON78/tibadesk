import React, { useCallback, useState } from "react";
import { Button } from "@mui/material";
import { Document, Font, Page, pdf, StyleSheet } from "@react-pdf/renderer";

// Use public path for fonts to avoid build issues
const fontRegular = "/fonts/Custom-Regular.ttf";
const fontItalic = "/fonts/Custom-Italic.ttf";
const fontBold = "/fonts/Custom-Bold.ttf";

import Header from "../../../components/pdf/Header";
import Footer from "../../../components/pdf/Footer";
import Descriptions from "../../../components/pdf/Descriptions";
import Table from "../../../components/pdf/Table";
import { numberFormat } from "../../../helpers";

Font.register({
  family: "Custom",
  fonts: [
    { src: fontRegular },
    { src: fontItalic, fontStyle: "italic" },
    { src: fontBold, fontWeight: 700 },
  ],
});

const PDFReportDocument = ({ bill, items, patient }) => {
  const getTotalAmount = () => {
    return items.reduce(
      (acc, e) => acc + (e.unit_price || 0) * (e.quantity || 0),
      0
    );
  };

  return (
    <Document
      title="Patient Bill"
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
        orientation="portrait"
      >
        <Header
          title="Patient Bill"
          subtitle={`${patient.full_name} - ${patient.id}`}
        />

        <Descriptions
          columns={3}
          items={[
            { label: "Bill Number", value: bill.id },
            { label: "Bill Amount", value: numberFormat(bill.amount) },
            { label: "Discount", value: numberFormat(bill.discount) },
            {
              label: "Amount Paid",
              value: numberFormat(bill.amount_paid || 0),
            },
            {
              label: "Amount Remaining",
              value: numberFormat(
                bill.amount - bill.discount - (bill.amount_paid || 0)
              ),
            },
            { label: "Created By", value: bill.creator?.full_name },
            { label: "Date Created", value: bill.created_at },
            { label: "Bill Status", value: bill.status },
            { label: "Cleared By", value: bill.clearer?.full_name },
            { label: "Date Cleared", value: bill.cleared_at },
          ]}
          containerStyle={{
            marginBottom: 16,
          }}
        />

        <Table
          containerStyle={{ marginBottom: 16 }}
          columns={[
            {
              field: "index",
              headerName: "S/N",
              valueGetter: (item, index) => index + 1,
            },
            {
              field: "item_id",
              headerName: "Item Name",
              valueGetter: (item, index) => item.item.name,
            },
            {
              field: "payment_mode_id",
              headerName: "Payment Mode",
              valueGetter: (item, index) => item.payment_mode.name,
            },
            {
              field: "unit_price",
              headerName: "Unit Price",
              valueGetter: (item, index) => numberFormat(item.unit_price || 0),
            },
            {
              field: "quantity",
              headerName: "Quantity",
              valueGetter: (item, index) => numberFormat(item.quantity || 0),
            },
            {
              field: "total_price",
              headerName: "Subtotal",
              valueGetter: (item, index) =>
                numberFormat((item.unit_price || 0) * (item.quantity || 0)),
            },
          ]}
          items={items}
          footerItems={[
            [
              { value: "TOTAL", style: { flex: 0.8445 } },
              {
                value: numberFormat(getTotalAmount() || 0),
                style: { flex: 0.1555 },
              },
            ],
          ]}
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
      onClick={generatePdfDocument}
    >
      {loading ? "Generating PDF..." : "PDF"}
    </Button>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 8,
    fontFamily: "Custom",
  },
});

export default PDFReport;
