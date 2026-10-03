import React from "react";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import Header from "../../components/pdf/Header";
import Footer from "../../components/pdf/Footer";
import PdfTable from "../../components/pdf/Table";

const fontRegular = "/fonts/Custom-Regular.ttf";
const fontItalic = "/fonts/Custom-Italic.ttf";
const fontBold = "/fonts/Custom-Bold.ttf";

Font.register({
  family: "Custom",
  fonts: [
    { src: fontRegular },
    { src: fontItalic, fontStyle: "italic" },
    { src: fontBold, fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 35,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "Custom",
    marginBottom: 4,
  },
  reportInfo: {
    fontSize: 7,
    fontFamily: "Custom",
    color: "#666",
    textAlign: "right",
    marginTop: 8,
  },
  signatureSection: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "30%",
  },
  signatureLabel: {
    fontSize: 7,
    fontFamily: "Custom",
    marginBottom: 4,
    color: "#666",
  },
  signatureLine: {
    borderBottom: "1pt solid #000",
    marginTop: 28,
    marginBottom: 4,
  },
});

export const MoHOPDPDF = ({ data }) => {
  const ageGroups = ["0-4", "5-14", "15-24", "25-44", "45-64", "65+"];

  return (
    <Document title="Monthly OPD Report" creator={window.APP_NAME} producer={window.APP_NAME}>
      <Page size="A4" style={styles.page} orientation="portrait">
        <Header
          title="UNITED REPUBLIC OF TANZANIA"
          subtitle="MINISTRY OF HEALTH - HMIS 001: OUTPATIENT MORBIDITY REPORT"
        />
        <PdfTable
          caption="Morbidity by Age Group & Gender"
          columns={[
            { field: "age_group", headerName: "Age Group", flex: 1 },
            { field: "male", headerName: "Male", flex: 1, style: { textAlign: "right" } },
            { field: "female", headerName: "Female", flex: 1, style: { textAlign: "right" } },
            { field: "total", headerName: "Total", flex: 1, style: { textAlign: "right" } },
          ]}
          items={ageGroups.map((group) => ({
            age_group: group,
            male: data.morbidity_by_age_gender?.[group]?.male || 0,
            female: data.morbidity_by_age_gender?.[group]?.female || 0,
            total: data.morbidity_by_age_gender?.[group]?.total || 0,
          }))}
        />
        <Text style={styles.reportInfo}>
          Report generated: {data.report_date} | Period: {data.report_period?.start_date} to {data.report_period?.end_date}
        </Text>
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Prepared By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature: .................. Date: ..................</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Reviewed By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature: .................. Date: ..................</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Approved By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature: .................. Date: ..................</Text>
          </View>
        </View>
        <Footer text="Ministry of Health - HMIS 001" />
      </Page>
    </Document>
  );
};

export const MoHPharmaceuticalPDF = ({ data }) => {
  return (
    <Document title="Pharmaceutical Consumption Report" creator={window.APP_NAME} producer={window.APP_NAME}>
      <Page size="A4" style={styles.page} orientation="portrait">
        <Header
          title="UNITED REPUBLIC OF TANZANIA"
          subtitle="MINISTRY OF HEALTH - HMIS 009: PHARMACEUTICAL CONSUMPTION REPORT"
        />
        <PdfTable
          caption="Medicines Dispensed"
          columns={[
            { field: "sn", headerName: "S/N", flex: 0.5, style: { textAlign: "center" } },
            { field: "medicine_name", headerName: "Medicine Name", flex: 2 },
            { field: "quantity_dispensed", headerName: "Qty Dispensed", flex: 1, style: { textAlign: "right" } },
            { field: "total_value", headerName: "Total Value (Tsh)", flex: 1.5, style: { textAlign: "right" } },
          ]}
          items={(data.by_medicine || []).map((item, i) => ({
            sn: i + 1,
            medicine_name: item.medicine_name,
            quantity_dispensed: item.quantity_dispensed,
            total_value: Number(item.total_value).toLocaleString(),
          }))}
        />
        <Text style={styles.sectionTitle}>Summary</Text>
        <PdfTable
          columns={[
            { field: "label", headerName: "Metric", flex: 1 },
            { field: "value", headerName: "Value", flex: 1, style: { textAlign: "right" } },
          ]}
          items={[
            { label: "Items Dispensed", value: data.summary?.total_items_dispensed },
            { label: "Total Quantity", value: data.summary?.total_quantity },
            { label: "Unique Medicines", value: data.summary?.unique_medicines },
            { label: "Total Value", value: `Tsh ${Number(data.summary?.total_value || 0).toLocaleString()}` },
          ]}
        />
        <Text style={styles.reportInfo}>
          Report generated: {data.report_date} | Period: {data.report_period?.start_date} to {data.report_period?.end_date}
        </Text>
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Prepared By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature: .................. Date: ..................</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Reviewed By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature: .................. Date: ..................</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Approved By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature: .................. Date: ..................</Text>
          </View>
        </View>
        <Footer text="Ministry of Health - HMIS 009" />
      </Page>
    </Document>
  );
};

export const MoHRevenuePDF = ({ data }) => {
  return (
    <Document title="Revenue Summary Report" creator={window.APP_NAME} producer={window.APP_NAME}>
      <Page size="A4" style={styles.page} orientation="portrait">
        <Header
          title="UNITED REPUBLIC OF TANZANIA"
          subtitle="MINISTRY OF HEALTH - REVENUE SUMMARY REPORT"
        />
        <PdfTable
          caption="Revenue by Payment Channel"
          columns={[
            { field: "sn", headerName: "S/N", flex: 0.5, style: { textAlign: "center" } },
            { field: "channel", headerName: "Payment Channel", flex: 2 },
            { field: "count", headerName: "Transactions", flex: 1, style: { textAlign: "right" } },
            { field: "amount", headerName: "Amount (Tsh)", flex: 1.5, style: { textAlign: "right" } },
          ]}
          items={(data.by_channel || []).map((item, i) => ({
            sn: i + 1,
            channel: item.channel,
            count: item.count,
            amount: Number(item.amount).toLocaleString(),
          }))}
        />
        <PdfTable
          caption="Daily Revenue Breakdown"
          columns={[
            { field: "date", headerName: "Date", flex: 1 },
            { field: "count", headerName: "Transactions", flex: 1, style: { textAlign: "right" } },
            { field: "amount", headerName: "Amount (Tsh)", flex: 1.5, style: { textAlign: "right" } },
          ]}
          items={(data.by_date || []).map((item) => ({
            date: item.date,
            count: item.count,
            amount: Number(item.amount).toLocaleString(),
          }))}
        />
        <Text style={styles.reportInfo}>
          Report generated: {data.report_date} | Period: {data.report_period?.start_date} to {data.report_period?.end_date}
        </Text>
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Prepared By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature: .................. Date: ..................</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Reviewed By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature: .................. Date: ..................</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Approved By:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature: .................. Date: ..................</Text>
          </View>
        </View>
        <Footer text="Ministry of Health - Revenue Summary" />
      </Page>
    </Document>
  );
};
