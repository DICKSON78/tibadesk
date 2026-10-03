import React, { useCallback, useEffect, useState } from "react";
import {
  Document,
  Font,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { Button } from "../../../components/ui/index.jsx";
import { DownloadRounded as DownloadIcon } from "../../../components/ui/icons.jsx";

// Use system fonts as fallback to avoid font loading issues
const fontRegular = "Helvetica";
const fontItalic = "Helvetica-Oblique";
const fontBold = "Helvetica-Bold";

import Header from "../../../components/pdf/Header";
import Footer from "../../../components/pdf/Footer";
import Descriptions from "../../../components/pdf/Descriptions";
import Table, { styles as tableStyles } from "../../../components/pdf/Table";
import { PDFReportPage as SurgeryRecordReportPage } from "./SurgeryRecordReportPDF";

import { getAge } from "../../../helpers";
import useFetch from "../../../hooks/useFetch";

// Use core PDF fonts directly (Helvetica family) to avoid production loading issues

const Subheader = ({ title, style }) => {
  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: 9,
          paddingVertical: 4,
          paddingHorizontal: 12,
          color: "#fff",
          backgroundColor: "#039be5",
          borderRadius: 5,
          ...style,
        },
      ]}
    >
      {title}
    </Text>
  );
};

const DiagnosisCard = ({ title, diagnosisType, items }) => {
  return (
    <Table
      caption={title}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
          flex: 0.25,
        },
        {
          field: "disease_name",
          headerName: "Disease Name",
          valueGetter: (item, index) => item.disease?.name,
        },
        {
          field: "disease_code",
          headerName: "Disease Code",
          valueGetter: (item, index) => item.disease?.code,
        },
      ]}
      items={items.filter((e) => e.diagnosis_type === diagnosisType)}
    />
  );
};

const ConsultationItemsCard = ({ title, consultationType, items }) => {
  const getStatusLabel = (status) => {
    if (status === "Pending") {
      return "Not Paid";
    }

    if (consultationType === "Pharmacy") {
      if (status === "Served") {
        return "Dispensed";
      }
    }

    return status;
  };

  return (
    <Table
      caption={title}
      columns={[
        {
          field: "index",
          headerName: "S/N",
          valueGetter: (item, index) => index + 1,
          flex: 0.25,
        },
        {
          field: "item_name",
          headerName: "Item Name",
          valueGetter: (item, index) => item.item.name,
        },
        {
          field: "quantity",
          headerName: "Qty",
          valueGetter: (item) => item.quantity,
        },
        {
          field: "dosage",
          headerName: "Dosage",
          show: consultationType === "Pharmacy",
        },
        {
          field: "comments",
          headerName: "Comments",
          show: consultationType !== "Pharmacy",
        },
        {
          field: "status",
          headerName: "Status",
          valueGetter: (item, index) => getStatusLabel(item.status),
        },
      ]}
      items={items.filter((e) => e.consultation_type.name === consultationType)}
    />
  );
};

const PDFReportDocument = ({ consultation, patient }) => {
  return (
    <Document
      title="Patient File"
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
          title="Patient File"
          subtitle={patient.full_name}
        />

        <Descriptions
          columns={3}
          items={[
            { label: "Patient Name", value: patient.full_name },
            { label: "Patient Number", value: patient.id },
            { label: "Age", value: getAge(patient.date_of_birth) },
            { label: "Gender", value: patient.gender },
            { label: "Phone Number", value: patient.phone },
            { label: "Address", value: patient.address },
            {
              label: "Payment Mode",
              value: consultation.payment_cache_item.payment_mode.name,
            },
            {
              label: "Consultation Item",
              value: consultation.payment_cache_item.item.name,
            },
            {
              label: "Consultant",
              value: consultation.payment_cache_item.consultant?.full_name,
            },
            {
              label: "Consultation Date",
              value:
                consultation.payment_cache_item.served_at ||
                consultation.created_at,
            },
            { label: "To Return", value: consultation.patient_to_return },
            { label: "Return Date", value: consultation.to_return_date },
          ]}
          containerStyle={{
            marginBottom: 8,
          }}
        />

        {/* Clinical Notes Summary */}
        <Subheader title="Clinical Notes" style={{ marginBottom: 6 }} />
        <Descriptions
          columns={2}
          items={[
            { label: "Chief Complaint", value: consultation.chief_complaint },
            { label: "History of Present Illness", value: consultation.history_present_illness },
            { label: "Family History", value: consultation.family_history },
            { label: "General Health", value: consultation.general_health },
            { label: "Family Dental History", value: consultation.family_dental_history },
            { label: "Family General History", value: consultation.family_general_history },
            { label: "Remarks", value: consultation.remarks },
          ]}
          containerStyle={{ marginBottom: 8 }}
        />

        {/* Diagnoses */}
        <Subheader title="Diagnoses" style={{ marginBottom: 6 }} />
        <Descriptions columns={1} items={[]} containerStyle={{ marginBottom: 4 }} />
        {/* Provisional */}
        <DiagnosisCard title="Provisional" diagnosisType="Provisional" items={consultation.diagnoses || []} />
        {/* Final */}
        <DiagnosisCard title="Final" diagnosisType="Final" items={consultation.diagnoses || []} />

        {consultation.patient_direction === "Direct to Doctor" ? (
          <React.Fragment>
            <Subheader
              title="History Taking"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  CC
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  HI
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  FH
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.chief_complaint}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.history_present_illness}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.family_history}
                </Text>
              </View>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  GH
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  FDH
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  FGH
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.general_health}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.family_dental_history}
                </Text>
                <Text style={[styles.text, tableStyles.tableCell]}>
                  {consultation.family_general_history}
                </Text>
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {consultation.pain_assessment ? (
          <React.Fragment>
            <Subheader
              title="Pain Assessment"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Assessment
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Finding
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Pain Level</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.pain_assessment.pain_level}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Pain Location</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.pain_assessment.pain_location}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Pain Type</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.pain_assessment.pain_type}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Pain Duration</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.pain_assessment.pain_duration}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Pain Triggers</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.pain_assessment.pain_triggers}</Text>
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {consultation.dental_facial_assessment ? (
          <React.Fragment>
            <Subheader
              title="Facial & TMJ Assessment"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Assessment
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Finding
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Facial Symmetry</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_facial_assessment.facial_symmetry}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Right TMJ</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_facial_assessment.right_tmj_tenderness}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Left TMJ</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_facial_assessment.left_tmj_tenderness}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Submandibular Nodes</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_facial_assessment.submandibular_lymph_nodes}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Lip Competence</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_facial_assessment.lip_competence}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Palate Shape</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_facial_assessment.palate_shape}</Text>
              </View>
            </View>
          </React.Fragment>
        ) : null}

        {consultation.dental_functional_assessment ? (
          <React.Fragment>
            <Subheader
              title="Functional Assessment"
              style={{ marginBottom: 8 }}
            />

            <View style={[tableStyles.table, { marginBottom: 8 }]}>
              <View style={[tableStyles.tableRow, tableStyles.lightGrey]}>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Assessment
                </Text>
                <Text
                  style={[
                    styles.text,
                    tableStyles.tableCell,
                    { fontWeight: "bold" },
                  ]}
                >
                  Finding
                </Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Mouth Opening</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_functional_assessment.maximum_mouth_opening}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Bite Classification</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_functional_assessment.bite_classification}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Overjet</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_functional_assessment.overjet}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Overbite</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_functional_assessment.overbite}</Text>
              </View>
              <View style={tableStyles.tableRow}>
                <Text style={[styles.text, tableStyles.tableCell]}>Centric Relation</Text>
                <Text style={[styles.text, tableStyles.tableCell]}>{consultation.dental_functional_assessment.centric_relation}</Text>
              </View>
            </View>
          </React.Fragment>
        ) : null}

        <Subheader
          title={
            consultation.patient_direction === "Direct to Doctor"
              ? "Diagnosis & Management"
              : "Management"
          }
          style={{ marginBottom: 8 }}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {consultation.patient_direction === "Direct to Doctor" ? (
            <View style={{ width: "50%", paddingRight: 4, marginBottom: 8 }}>
              <DiagnosisCard
                title="Diagnosis"
                diagnosisType="Final"
                items={consultation.diagnoses}
              />
            </View>
          ) : null}
          <View
            style={{
              width: "50%",
              paddingLeft:
                consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
              paddingRight:
                consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
              marginBottom: 8,
            }}
          >
            <ConsultationItemsCard
              title="Medicine"
              consultationType="Pharmacy"
              items={consultation.items}
            />
          </View>
          <View
            style={{
              width: "50%",
              paddingLeft:
                consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
              paddingRight:
                consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
              marginBottom: 8,
            }}
          >
            <ConsultationItemsCard
              title="Procedure"
              consultationType="Procedure"
              items={consultation.items}
            />
          </View>
          <View
            style={{
              width: "50%",
              paddingLeft:
                consultation.patient_direction === "Direct to Doctor" ? 0 : 4,
              paddingRight:
                consultation.patient_direction === "Direct to Doctor" ? 4 : 0,
              marginBottom: 8,
            }}
          >
            <ConsultationItemsCard
              title="Others"
              consultationType="Others"
              items={consultation.items}
            />
          </View>
        </View>

        {consultation.status === "Consulted" ? (
          <React.Fragment>
            <Subheader
              title="Remarks"
              style={{ marginBottom: 8 }}
            />

            <Descriptions
              columns={1}
              items={[
                {
                  label: "Patient to Return",
                  value:
                    consultation.patient_direction === "Direct to Doctor"
                      ? consultation.patient_to_return
                      : null,
                },
                { label: "Return Date", value: consultation.to_return_date },
                { label: "Remarks", value: consultation.remarks },
              ]}
              containerStyle={{
                marginBottom: 8,
              }}
              valueStyle={{
                width: "80%",
              }}
            />
          </React.Fragment>
        ) : null}

        <Footer
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>

      {consultation.patient_direction === "Direct to Doctor" ? (
        <React.Fragment>
          {consultation.templates?.surgery_record_report ? (
            <SurgeryRecordReportPage
              surgeryRecordReport={consultation.templates.surgery_record_report}
              patient={patient}
            />
          ) : null}
        </React.Fragment>
      ) : null}
    </Document>
  );
};

const PDFReport = ({ consultationId, consultation: consultationProp, patient, ...rest }) => {
  const [loading, setLoading] = useState(false);

  const {
    data: consultation,
    loading: loadingConsultation,
    handleFetch,
  } = useFetch(
    consultationProp || !consultationId ? null : `api/consultations/${consultationId}`,
    {
      with_diagnoses: "Yes",
      with_items: "Yes",
      with_item_templates: "Yes",
    },
    false,
    null,
    (response) => response.data.data
  );

  const currentConsultation = consultationProp || consultation;

  useEffect(() => {
    if (consultation) {
      generatePdfDocument();
    }
  }, [consultation]);

  const generatePdfDocument = useCallback(async () => {
    if (currentConsultation && patient) {
      setLoading(true);
      try {
        console.log('Starting PDF generation...', { consultation: currentConsultation, patient });
        
        // Validate required data
        if (!currentConsultation.id || !patient.id) {
          throw new Error('Missing consultation or patient ID');
        }
        
        // Create the PDF document with error handling
        const pdfDocument = (
          <PDFReportDocument
            consultation={currentConsultation}
            patient={patient}
          />
        );
        
        console.log('PDF document created, generating blob...');
        
        const blob = await pdf(pdfDocument).toBlob();
        
        if (!blob || blob.size === 0) {
          throw new Error('Generated PDF is empty or invalid');
        }
        
        console.log('PDF blob created successfully', { size: blob.size, type: blob.type });
        
        // Create a download link instead of opening in new tab
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `clinical-notes-${patient?.full_name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up after a short delay
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          window.URL.revokeObjectURL(url);
        }, 100);
        
        console.log('PDF download initiated successfully');
      } catch (error) {
        console.error('PDF generation failed:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          consultation: currentConsultation,
          patient: patient,
          errorType: error.constructor.name
        });
        
        // More user-friendly error messages
        let errorMessage = 'Failed to generate PDF. ';
        if (error.message.includes('font')) {
          errorMessage += 'Font loading issue. Please refresh the page and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network issue. Please check your connection and try again.';
        } else {
          errorMessage += `Error: ${error.message}. Please try again.`;
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      console.error('Missing required data for PDF generation:', { consultation: currentConsultation, patient });
      alert('Missing consultation or patient data. Please refresh the page and try again.');
    }
  }, [currentConsultation, patient]);

  return (
    <Button
      disabled={loading}
      variant="contained"
      color="secondary"
      startIcon={<DownloadIcon />}
      onClick={
        consultationProp
          ? generatePdfDocument
          : handleFetch
      }
      {...rest}
    >
      {loadingConsultation || loading ? "Generating PDF..." : "PDF"}
    </Button>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 8,
    // Use Helvetica which is built into PDF viewers
    fontFamily: "Helvetica",
  },
});

export default PDFReport;
