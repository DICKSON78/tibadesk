import React from "react";
import { Document, Font, Page, Text, View } from "@react-pdf/renderer";

const fontRegular = "Helvetica";
const fontItalic = "Helvetica-Oblique";
const fontBold = "Helvetica-Bold";

import Header from "../../../components/pdf/Header";
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

const PDFReportDocument = ({ receipt, items, patient }) => {
  const getTotalAmount = () => {
    return items.reduce(
      (acc, e) => acc + (e.unit_price || 0) * (e.quantity || 0),
      0
    );
  };

  const clinic = window.user?.clinic || {};
  const total = getTotalAmount();
  const grandTotal = total - (receipt.discount || 0);
  const receiptNo = `RCP-${String(receipt.id).padStart(6, "0")}`;
  const tin = clinic?.tin || "N/A";
  const vrn = clinic?.vrn || "N/A";
  const efdSerial = clinic?.efd_serial || "N/A";
  const receiptFooter = clinic?.receipt_footer || "";

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
          title="TAX RECEIPT"
          dense
        />

        <View style={{ marginBottom: 6, fontSize: 7, textAlign: "center" }}>
          <Text>TIN: {tin}</Text>
          {vrn !== "N/A" && <Text>VRN: {vrn}</Text>}
          <Text>EFD Serial: {efdSerial}</Text>
          <Text>Receipt No: {receiptNo}</Text>
        </View>

        <Descriptions
          columns={2}
          vertical
          items={[
            { label: "Customer Name", value: patient.full_name },
            { label: "Receipt Number", value: receiptNo },
            { label: "Receipt Amount", value: numberFormat(total) },
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
              headerName: "Qty",
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
              { value: numberFormat(total), style: { flex: 0.214 } },
            ],
          ]}
        />

        <Descriptions
          columns={2}
          items={[
            {
              label: "GRAND TOTAL",
              value: numberFormat(grandTotal),
            },
          ]}
          valueStyle={{ fontWeight: "bold" }}
        />

        <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: "#999", paddingTop: 6 }}>
          <Text style={{ fontSize: 6, textAlign: "center", color: "#555" }}>
            TIN: {tin} | EFD: {efdSerial}
          </Text>
          <Text style={{ fontSize: 6, textAlign: "center", color: "#555" }}>
            This is a TRA-compliant receipt
          </Text>
          {receiptFooter && (
            <Text style={{ fontSize: 6, textAlign: "center", color: "#555", marginTop: 2 }}>
              {receiptFooter}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default PDFReportDocument;
