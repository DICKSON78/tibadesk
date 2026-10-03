import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "../../../components/ui/index.jsx";

import { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import Select from "../../../components/Select";
import DiagnosisCard from "./DiagnosisCard";
import SelectDiagnoses from "./SelectDiagnoses";
import DentalFacialAssessment from "./DentalFacialAssessment";
import DentalFunctionalAssessment from "./DentalFunctionalAssessment";
import DentalPainAssessment from "./DentalPainAssessment";
import PatientAllergies from "./PatientAllergies";
import PatientMedicalHistory from "./PatientMedicalHistory";
import ConsultationItemsCard from "./ConsultationItemsCard";
import SelectItems from "./SelectItems";
import PatientFilePDF from "../../patient-records/patient-file/PatientFilePDF";

import { useFetch, usePatch, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getValidationError,
} from "../../../helpers";

const Subheader = ({ title, sx }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#00796B",
        color: "white",
        py: 1.5,
        px: 3,
        my: 2,
        borderRadius: 1,
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        ...sx,
      }}
    >
      <Typography
        variant="h6"
        fontWeight="600"
        sx={{ fontSize: '1rem' }}
      >
        {title}
      </Typography>
    </Box>
  );
};

const ClinicalNotes = ({ patient, consultation }) => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const chiefComplaintRef = useRef();
  const historyPresentIllnessRef = useRef();
  const familyHistoryRef = useRef();
  const generalHealthRef = useRef();
  const familyDentalHistoryRef = useRef();
  const familyGeneralHistoryRef = useRef();
  const facialAssessmentRef = useRef();
  const dentalFunctionalAssessmentRef = useRef();
  const painAssessmentRef = useRef();
  const patientToReturnDateRef = useRef();
  const patientToReturnTimeRef = useRef();
  const remarksRef = useRef();



  const [data, setData] = useState();
  const [error, setError] = useState();
  const [formData, setFormData] = useState({
    ...consultation,
    payment_cache_item: undefined,
    creator: undefined,
    to_return_date: consultation.to_return_date
      ? new Date(consultation.to_return_date)
      : null,
    to_return_time: consultation.to_return_time || null,
  });

  const {
    data: diagnoses,
    setData: setDiagnoses,
    loading: loadingDiagnoses,
    handleFetch: fetchDiagnoses,
  } = useFetch(
    "api/consultation-diagnoses",
    {
      per_page: 500,
      consultation_id: consultation.id,
    },
    false,
    [],
    (response) => {
      // Safely extract data with fallback
      const data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      return Array.isArray(data) ? data : [];
    }
  );
  const {
    data: items,
    setData: setItems,
    loading: loadingItems,
    handleFetch: fetchItems,
  } = useFetch(
    "api/patient-payment-cache-items",
    {
      per_page: 500,
      consultation_id: consultation.id,
    },
    false,
    [],
    (response) => {
      // Safely extract data with fallback
      const data = response?.data?.data?.data || response?.data?.data || response?.data || [];
      return Array.isArray(data) ? data : [];
    }
  );


  const { handlePatch: handleAutoSave } = usePatch();
  const {
    data: dataComplete,
    loading: loadingComplete,
    error: errorComplete,
    handlePatch: handleComplete,
  } = usePatch();

  useEffect(() => {
    document.title = `Clinical Notes - ${window.APP_NAME}`;

    fetchDiagnoses();
    fetchItems();
  }, []);

  useEffect(() => {
    if (dataComplete) {
      setData(dataComplete);

      window.setTimeout(() => {
        navigate("/consultation-room/consultation-patients/pending");
      }, 1000);
    }
  }, [dataComplete]);

  useEffect(() => {
    if (errorComplete) {
      setError(errorComplete);
    }
  }, [errorComplete]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const autoSave = (field, value) => {
    if (value !== consultation[field]) {
      handleAutoSave(
        `api/consultations/${consultation.id}/auto-save-clinical-notes`,
        {
          what: "Consultation",
          [field]: value,
        }
      );
    }
  };

  const openSelectDiagnosesModal = (title, type) => {
    let component = (
      <SelectDiagnoses
        modal={modalRef.current}
        consultationId={consultation.id}
        diagnosisType={type}
        selected={diagnoses.filter((e) => e.diagnosis_type === type)}
        fetchDiagnoses={fetchDiagnoses}
      />
    );

    modalRef.current.open(title, component, "md");
  };

  const openSelectItemsModal = (title, type) => {
    let component = (
      <SelectItems
        modal={modalRef.current}
        consultation={consultation}
        consultationType={type}
        selected={items.filter((e) => e.consultation_type.name === type)}
        fetchItems={fetchItems}
      />
    );

    modalRef.current.open(title, component, "lg");
  };

  const confirmComplete = () => {
    setData(null);
    setError(null);

    if (!formRef.current.validate()) {
      return setError(
        getValidationError("Please complete all the required fields.")
      );
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handleComplete(
            `api/consultations/${consultation.id}/complete-clinical-notes`,
            {
              ...formData,
              facial_assessment: facialAssessmentRef.current.getFormData(),
              dental_functional_test: dentalFunctionalAssessmentRef.current.getFormData(),
              pain_assessment: painAssessmentRef.current.getFormData(),
              to_return_date: formData.to_return_date
                ? formatDateForDb(formData.to_return_date)
                : undefined,
            }
          );
        }}
      />
    );

    modalRef.current.open("Confirm Save", component, "sm");
  };

  return (
    <React.Fragment>
      <Card sx={{ 
        width: '100%', 
        maxWidth: '100%',
        mx: { xs: -2, sm: -2, md: -3 }, // Override Page component margins
        px: { xs: 2, sm: 2, md: 3 }     // Add padding back to the card
      }}>
        <PageHeader
          title="Clinical Notes"
          trailing={
            <PatientFilePDF
              consultationId={consultation.id}
              patient={patient}
            />
          }
        />
        <Divider />
        <Form ref={formRef}>
          <CardContent sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
            <Subheader
              title="History Taking"
              sx={{ mt: 0 }}
            />

            {/* Improved History Taking Layout */}
            <Box sx={{ 
              border: '1px solid #B2DFDB', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2 
            }}>
              <Table sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#E0F2F1' }}>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #B2DFDB' }}>
                      CC
                      <Typography
                        component="span"
                        color="error.main"
                        fontWeight="700"
                        sx={{ ml: 0.5 }}
                      >
                        *
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #B2DFDB' }}>HI</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #B2DFDB' }}>FH</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: '1px solid #B2DFDB', p: 1 }}>
                      <TextField
                        ref={chiefComplaintRef}
                        fullWidth
                        multiline
                        rows={3}
                        required
                        variant="outlined"
                        size="small"
                        placeholder="Chief Complaint"
                        defaultValue={formData.chief_complaint}
                        onChange={(value) => {
                          setFormData({ ...formData, chief_complaint: value });
                          autoSave("chief_complaint", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #B2DFDB', p: 1 }}>
                      <TextField
                        ref={historyPresentIllnessRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="History of Present Illness"
                        defaultValue={formData.history_present_illness}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            history_present_illness: value,
                          });
                          autoSave("history_present_illness", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #B2DFDB', p: 1 }}>
                      <TextField
                        ref={familyHistoryRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Family History"
                        defaultValue={formData.family_history}
                        onChange={(value) => {
                          setFormData({ ...formData, family_history: value });
                          autoSave("family_history", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Second Row - GH, FOH, FGH */}
            <Box sx={{ 
              border: '1px solid #B2DFDB', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2 
            }}>
              <Table sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#E0F2F1' }}>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #B2DFDB' }}>GH</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #B2DFDB' }}>FOH</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #B2DFDB' }}>FGH</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: '1px solid #B2DFDB', p: 1 }}>
                      <TextField
                        ref={generalHealthRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="General Health"
                        defaultValue={formData.general_health}
                        onChange={(value) => {
                          setFormData({ ...formData, general_health: value });
                          autoSave("general_health", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #B2DFDB', p: 1 }}>
                      <TextField
                        ref={familyDentalHistoryRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Family Dental History"
                        defaultValue={formData.family_dental_history}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            family_dental_history: value,
                          });
                          autoSave("family_dental_history", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #B2DFDB', p: 1 }}>
                      <TextField
                        ref={familyGeneralHistoryRef}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Family General History"
                        defaultValue={formData.family_general_history}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            family_general_history: value,
                          });
                          autoSave("family_general_history", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Third Row - Oral Hygiene, Tobacco, Alcohol */}
            <Box sx={{ 
              border: '1px solid #B2DFDB', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2 
            }}>
              <Table sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#E0F2F1' }}>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #B2DFDB' }}>Oral Hygiene</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #B2DFDB' }}>Tobacco Use</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', border: '1px solid #B2DFDB' }}>Alcohol Use</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: '1px solid #B2DFDB', p: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Oral Hygiene Status"
                        defaultValue={formData.oral_hygiene_status}
                        onChange={(value) => {
                          setFormData({ ...formData, oral_hygiene_status: value });
                          autoSave("oral_hygiene_status", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #B2DFDB', p: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Tobacco Use"
                        defaultValue={formData.tobacco_use}
                        onChange={(value) => {
                          setFormData({ ...formData, tobacco_use: value });
                          autoSave("tobacco_use", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: '1px solid #B2DFDB', p: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        placeholder="Alcohol Use"
                        defaultValue={formData.alcohol_use}
                        onChange={(value) => {
                          setFormData({ ...formData, alcohol_use: value });
                          autoSave("alcohol_use", value);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Subheader title="Patient Allergies" />
            <Box sx={{ 
              border: '1px solid #B2DFDB', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2,
              p: 2,
            }}>
              <PatientAllergies
                patientId={patient?.id}
                consultationId={consultation.id}
              />
            </Box>

            <Subheader title="Medical History" />
            <Box sx={{ 
              border: '1px solid #B2DFDB', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2,
              p: 2,
            }}>
              <PatientMedicalHistory
                patientId={patient?.id}
                consultationId={consultation.id}
              />
            </Box>

            <Subheader title="Pain Assessment" />
            <DentalPainAssessment
              ref={painAssessmentRef}
              consultation={consultation}
            />

            <Subheader title="Facial & TMJ Assessment" />
            <DentalFacialAssessment
              ref={facialAssessmentRef}
              consultation={consultation}
            />

            <Subheader title="Functional Assessment" />
            <DentalFunctionalAssessment
              ref={dentalFunctionalAssessmentRef}
              consultation={consultation}
            />

            <Subheader title="Diagnosis & Treatment Plan" />
            
            <Box sx={{ width: '100%', mb: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                <Box>
                  <Card variant="outlined" sx={{ width: '100%' }}>
                    <Box sx={{ backgroundColor: '#E0F2F1', p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary">Diagnosis</Typography>
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <DiagnosisCard
                        title=""
                        diagnosisType="Final"
                        loading={loadingDiagnoses}
                        items={diagnoses}
                        consultation={consultation}
                        onClickAdd={(title, diagnosisType) => openSelectDiagnosesModal(title, diagnosisType)}
                      />
                    </CardContent>
                  </Card>
                </Box>
                <Box>
                  <Card variant="outlined" sx={{ width: '100%' }}>
                    <Box sx={{ backgroundColor: '#E0F2F1', p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary">Treatment Plan</Typography>
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <ConsultationItemsCard
                        title=""
                        consultationType={null}
                        loading={loadingItems}
                        items={items}
                        consultation={consultation}
                        onClickAdd={(title, consultationType) => openSelectItemsModal(title, consultationType)}
                        showAllTypes
                      />
                    </CardContent>
                  </Card>
                </Box>
            </Box>

            <Subheader title="Remarks" />
            <Box sx={{ 
              border: '1px solid #B2DFDB', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2 
            }}>
              <Box sx={{ 
                backgroundColor: '#E0F2F1', 
                p: 2, 
                borderBottom: '1px solid #B2DFDB',
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Additional Notes & Remarks
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <TextField
                  ref={remarksRef}
                  fullWidth
                  placeholder="Enter any additional notes, observations, or remarks about the patient's condition..."
                  multiline
                  rows={6}
                  variant="outlined"
                  defaultValue={formData.remarks}
                  onChange={(value) => {
                    setFormData({ ...formData, remarks: value });
                    autoSave("remarks", value);
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        border: '1px solid #B2DFDB',
                      },
                      '&:hover fieldset': {
                        border: '1px solid #00796B',
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid #00796B',
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Patient Return Section */}
            <Box sx={{ 
              border: '1px solid #B2DFDB', 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 2 
            }}>
              <Box sx={{ 
                backgroundColor: '#E0F2F1', 
                p: 2, 
                borderBottom: '1px solid #B2DFDB',
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Follow-up Information
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.patient_to_return === "Yes"}
                          onChange={(event) => {
                            const value = event.target.checked ? "Yes" : "No";
                            setFormData({
                              ...formData,
                              patient_to_return: value,
                              to_return_date:
                                value === "Yes"
                                  ? consultation.to_return_date
                                    ? new Date(consultation.to_return_date)
                                    : null
                                  : null,
                            });
                            autoSave("patient_to_return", value);

                            if (value === "No") {
                              autoSave("to_return_date", null);
                            }
                          }}
                        />
                      }
                      label="Patient to Return"
                    />
                  </Grid>
                  {formData.patient_to_return === "Yes" && (
                    <Grid item xs={12} md={3}>
                      <DatePicker
                        ref={patientToReturnDateRef}
                        fullWidth
                        label="Return Date"
                        horizontal
                        required={formData.patient_to_return === "Yes"}
                        value={formData.to_return_date || null}
                        onChange={(value) => {
                          if (!isNaN(value)) {
                            setFormData({ ...formData, to_return_date: value });
                            autoSave("to_return_date", formatDateForDb(value));
                          }
                        }}
                      />
                    </Grid>
                  )}
                  {formData.patient_to_return === "Yes" && (
                    <Grid item xs={12} md={3}>
                      <TextField
                        ref={patientToReturnTimeRef}
                        label="Return Time"
                        type="time"
                        fullWidth
                        horizontal
                        value={formData.to_return_time || ""}
                        onChange={(value) => {
                          setFormData({ ...formData, to_return_time: value });
                          autoSave("to_return_time", value);
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Box>
            </Box>
          </CardContent>
        </Form>
        {consultation.status === "Pending" ? (
          <React.Fragment>
            <Divider />
            {loadingComplete && <LinearProgress />}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              p={2}
            >
              <Button
                disabled={loadingComplete}
                variant="contained"
                onClick={confirmComplete}
              >
                Save Notes
              </Button>
            </Stack>
          </React.Fragment>
        ) : null}
      </Card>
      <Modal ref={modalRef} />
    </React.Fragment>
  );
};

export default ClinicalNotes;
