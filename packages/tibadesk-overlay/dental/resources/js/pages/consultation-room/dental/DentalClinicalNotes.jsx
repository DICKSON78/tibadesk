import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Grid, LinearProgress, Paper, Stack, Typography,
} from "../../../components/ui/index.jsx";
import { Header as PageHeader } from "../../../components/Page";
import Modal from "../../../components/Modal";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import ConsultationItemsCard from "../clinical-notes/ConsultationItemsCard";
import SelectItems from "../clinical-notes/SelectItems";
import DiagnosisCard from "../clinical-notes/DiagnosisCard";
import SelectDiagnoses from "../clinical-notes/SelectDiagnoses";
import PatientFilePDF from "../../patient-records/patient-file/PatientFilePDF";
import DentalOralExamination from "./DentalOralExamination";

import PrescriptionForm from "./PrescriptionForm";
import DentalRadiographs from "./DentalRadiographs";
import { useFetch, usePatch, useToast, useOptions } from "../../../hooks";
import { formatDateForDb, formatDate, formatError, getValidationError, isAdmin } from "../../../helpers";
import { getToken } from '../../../lib/session';

const Subheader = ({ title, sx }) => (
  <Box sx={{
    backgroundColor: "#00796B", color: "white", py: 1.5, px: 3, my: 2,
    borderRadius: 1, textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", ...sx,
  }}>
    <Typography variant="h6" fontWeight="600" sx={{ fontSize: "1rem" }}>{title}</Typography>
  </Box>
);

const DentalClinicalNotes = ({ patient, consultation }) => {
  const addToast = useToast();
  const navigate = useNavigate();
  const modalRef = useRef();
  const formRef = useRef();

  const [saveLoading, setSaveLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [dischargeLoading, setDischargeLoading] = useState(false);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    chief_complaint: "", history_present_illness: "", family_history: "",
    general_health: "", remarks: "", patient_to_return: "No", to_return_date: "", to_return_time: "",
    extra_oral_examination: "", tmj_examination: "", lymph_nodes: "",
    oral_hygiene_status: "", tobacco_use: "", alcohol_use: "",
  });
  const [diagnoses, setDiagnoses] = useState([]);
  const [consItems, setConsItems] = useState([]);
  const [oralExamData, setOralExamData] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [radiographs, setRadiographs] = useState([]);
  const [labOrders, setLabOrders] = useState([]);
  const [labFormOpen, setLabFormOpen] = useState(false);
  const [labEditingId, setLabEditingId] = useState(null);
  const [labForm, setLabForm] = useState({
    order_type: "", description: "", material: "", shade: "",
    tooth_number: "", teeth_involved: [], lab_name: "", lab_notes: "",
    cost: "", technician_charges: "", impression_date: "", delivery_date: "",
  });
  const [labSaving, setLabSaving] = useState(false);

  const { handlePatch: autoPatch } = usePatch();
  const { handlePatch: completePatch, loading: completing } = usePatch();
  const { handlePatch: dischargePatch, loading: discharging } = usePatch();
  const { options } = useOptions();

  const fetchDiagnoses = async () => {
    if (!consultation?.id) return;
    try {
      const res = await fetch(`/api/consultation-diagnoses?consultation_id=${consultation.id}&per_page=500`);
      const json = await res.json();
      const data = json?.data?.data?.data || json?.data?.data || json?.data || [];
      setDiagnoses(Array.isArray(data) ? data : []);
    } catch {}
  };

  const fetchConsItems = async () => {
    if (!consultation?.id) return;
    try {
      const res = await fetch(`/api/patient-payment-cache-items?consultation_id=${consultation.id}&per_page=100`);
      const json = await res.json();
      if (json.data?.data) setConsItems(json.data.data);
    } catch {}
  };

  const fetchLabOrders = async () => {
    if (!consultation?.id) return;
    try {
      const res = await fetch(`/api/dental-lab-orders?consultation_id=${consultation.id}&per_page=50`);
      const json = await res.json();
      const data = json?.data?.data?.data || json?.data?.data || [];
      setLabOrders(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleSaveLabOrder = async () => {
    if (!labForm.order_type) {
      addToast({ message: "Order type is required", severity: "error" });
      return;
    }
    setLabSaving(true);
    try {
      const isEdit = !!labEditingId;
      const payload = {
        consultation_id: consultation.id,
        ...labForm,
        teeth_involved: Array.isArray(labForm.teeth_involved) && labForm.teeth_involved.length > 0 ? labForm.teeth_involved : undefined,
        tooth_number: labForm.tooth_number ? parseInt(labForm.tooth_number) || labForm.tooth_number : undefined,
      };
      const url = isEdit ? `/api/dental-lab-orders/${labEditingId}` : "/api/dental-lab-orders";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast({ message: json.message || "Failed to save lab order", severity: "error" });
        return;
      }
      addToast({ message: isEdit ? "Lab order updated" : "Lab order sent to lab", severity: "success" });
      setLabFormOpen(false);
      setLabEditingId(null);
      setLabForm({ order_type: "", description: "", material: "", shade: "", tooth_number: "", teeth_involved: [], lab_name: "", lab_notes: "", cost: "", technician_charges: "", impression_date: "", delivery_date: "" });
      fetchLabOrders();
    } catch (e) {
      addToast({ message: "Failed to save lab order", severity: "error" });
    } finally {
      setLabSaving(false);
    }
  };

  const handleLabStatus = async (order, status) => {
    try {
      if (status === "Ready") {
        await fetch(`/api/dental-lab-orders/${order.id}/mark-ready`, {
          method: "POST",
          headers: { "Authorization": "Bearer " + getToken() },
        });
      } else {
        const res = await fetch(`/api/dental-lab-orders/${order.id}/mark-delivered`, {
          method: "POST",
          headers: { "Authorization": "Bearer " + getToken() },
        });
        if (!res.ok) {
          await fetch(`/api/dental-lab-orders/${order.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
            body: JSON.stringify({ status }),
          });
        }
      }
      addToast({ message: "Lab order status updated", severity: "success" });
      fetchLabOrders();
    } catch {
      addToast({ message: "Failed to update status", severity: "error" });
    }
  };

  const handleDeleteLabOrder = async (id) => {
    if (!window.confirm("Delete this lab order?")) return;
    try {
      await fetch(`/api/dental-lab-orders/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + getToken() },
      });
      setLabOrders(labOrders.filter((o) => o.id !== id));
      addToast({ message: "Lab order deleted", severity: "success" });
    } catch {
      addToast({ message: "Failed to delete", severity: "error" });
    }
  };

  const openSelectDiagnosesModal = (title, type) => {
    const component = (
      <SelectDiagnoses
        modal={modalRef.current}
        consultationId={consultation.id}
        diagnosisType={type}
        selected={(diagnoses || []).filter((e) => e.diagnosis_type === type)}
        fetchDiagnoses={fetchDiagnoses}
      />
    );
    modalRef.current.open(title, component, "md");
  };

  const openSelectItemsModal = (title, type) => {
    const component = (
      <SelectItems
        modal={modalRef.current}
        consultation={consultation}
        consultationType={type}
        selected={(consItems || []).filter((e) => e.consultation_type?.name === type)}
        fetchItems={fetchConsItems}
      />
    );
    modalRef.current.open(title, component, "lg");
  };

  const autoSaveTimer = useRef(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  useEffect(() => {
    if (consultation) {
      const c = consultation;
      setFormData((prev) => ({
        ...prev,
        chief_complaint: c.chief_complaint || "",
        history_present_illness: c.history_present_illness || "",
        family_history: c.family_history || "",
        general_health: c.general_health || "",
        remarks: c.remarks || "",
        patient_to_return: c.patient_to_return || "No",
        to_return_date: c.to_return_date || "",
        extra_oral_examination: c.extra_oral_examination || "",
        tmj_examination: c.tmj_examination || "",
        lymph_nodes: c.lymph_nodes || "",
        oral_hygiene_status: c.oral_hygiene_status || "",
        tobacco_use: c.tobacco_use || "",
        alcohol_use: c.alcohol_use || "",
      }));
      setDiagnoses(c.diagnoses || []);
      setOralExamData(c.dental_oral_examination || null);
    }
  }, [consultation]);

  useEffect(() => {
    if (consultation?.id) {
      fetch(`/api/patient-payment-cache-items?consultation_id=${consultation.id}&per_page=100`)
        .then((r) => r.json())
        .then((d) => {
          if (d.data?.data) setConsItems(d.data.data);
        });
      fetch(`/api/prescriptions?consultation_id=${consultation.id}&per_page=100`)
        .then((r) => r.json())
        .then((d) => {
          if (d.data?.data) setPrescriptions(d.data.data);
        });
      fetch(`/api/dental-radiographs?consultation_id=${consultation.id}&per_page=100`)
        .then((r) => r.json())
        .then((d) => {
          if (d.data?.data) setRadiographs(d.data.data);
        });
      fetchLabOrders();
    }
  }, [consultation?.id]);

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const handleChange = (field) => (e) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      formDataRef.current = next;
      scheduleAutoSave(next);
      return next;
    });
  };

  const scheduleAutoSave = (data) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      autoSave(data);
    }, 2000);
  };

  const autoSave = async (data) => {
    if (!consultation?.id) return;
    setAutoSaveStatus("Saving...");
    try {
      const payload = { what: "Consultation", ...buildAutoSavePayload(data) };
      await autoPatch(`api/consultations/${consultation.id}/auto-save-clinical-notes`, payload);
      setAutoSaveStatus("Draft saved");
      setTimeout(() => setAutoSaveStatus(""), 3000);
    } catch {
      setAutoSaveStatus("Save failed");
    }
  };

  const buildAutoSavePayload = (data) => {
    const d = { ...data };
    if (d.to_return_date === "") d.to_return_date = null;
    if (d.to_return_time === "") d.to_return_time = null;
    return d;
  };

  const flushDraft = () => {
    if (!consultation?.id) return;
    const data = formDataRef.current;
    if (!data) return;
    const payload = { what: "Consultation", ...buildAutoSavePayload(data) };
    fetch(`/api/consultations/${consultation.id}/auto-save-clinical-notes`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushDraft();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      flushDraft();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultation?.id]);

  const handleCompleteClinicalNotes = async () => {
    if (!consultation?.id) return;
    setCompleteLoading(true);
    try {
      const payload = {
        chief_complaint: formData.chief_complaint,
        history_present_illness: formData.history_present_illness,
        family_history: formData.family_history,
        general_health: formData.general_health,
        extra_oral_examination: formData.extra_oral_examination,
        tmj_examination: formData.tmj_examination,
        lymph_nodes: formData.lymph_nodes,
        oral_hygiene_status: formData.oral_hygiene_status,
        tobacco_use: formData.tobacco_use,
        alcohol_use: formData.alcohol_use,
        remarks: formData.remarks,
        patient_to_return: formData.patient_to_return,
        to_return_date: formData.patient_to_return === "Yes" ? formData.to_return_date : null,
      };
      const result = await completePatch(`api/consultations/${consultation.id}/complete-clinical-notes`, {
        ...payload,
      });
      if (!result) {
        addToast("Failed to complete clinical notes. Please try again.", { variant: "error" });
        return;
      }
      addToast("Clinical notes saved successfully", { variant: "success" });
      setCompleteDialogOpen(false);
      navigate("/consultation-room/consultation-patients/pending");
    } catch (e) {
      addToast(formatError(e), { variant: "error" });
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleDischarge = async () => {
    if (!consultation?.id) return;
    setDischargeLoading(true);
    try {
      const result = await dischargePatch(`api/consultations/${consultation.id}/discharge`);
      if (!result) {
        addToast("Failed to discharge patient. Please try again.", { variant: "error" });
        return;
      }
      addToast("Patient discharged. Sent to cashier for final payment.", { variant: "success" });
      setDischargeDialogOpen(false);
      navigate("/consultation-room/consultation-patients/return");
    } catch (e) {
      addToast(formatError(e), { variant: "error" });
    } finally {
      setDischargeLoading(false);
    }
  };

  if (!consultation) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">Loading consultation...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  const isCompleted = consultation.status === "Consulted";

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Dental Clinical Notes" />

      {autoSaveStatus && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "right", mb: 1 }}>
          {autoSaveStatus}
        </Typography>
      )}

      <Subheader title="Patient Information" />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color="text.secondary">Patient Name</Typography>
          <Typography variant="body1" fontWeight={500}>
            {patient?.first_name} {patient?.middle_name} {patient?.last_name}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color="text.secondary">MRN / ID</Typography>
          <Typography variant="body1" fontWeight={500}>{patient?.hospital_id || patient?.id}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color="text.secondary">Gender / Age</Typography>
          <Typography variant="body1" fontWeight={500}>
            {patient?.gender} / {patient?.age || ""}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" color="text.secondary">Phone</Typography>
          <Typography variant="body1" fontWeight={500}>{patient?.phone}</Typography>
        </Grid>
      </Grid>

      <Subheader title="Chief Complaint & History" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Chief Complaint"
            value={formData.chief_complaint}
            onChange={handleChange("chief_complaint")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="History of Present Illness"
            value={formData.history_present_illness}
            onChange={handleChange("history_present_illness")}
            multiline rows={3} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Medical History / General Health"
            value={formData.general_health}
            onChange={handleChange("general_health")}
            multiline rows={3} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Family History"
            value={formData.family_history}
            onChange={handleChange("family_history")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Select
            label="Tobacco Use"
            value={formData.tobacco_use}
            options={options.tobaccoUse || []}
            onChange={handleChange("tobacco_use")}
            fullWidth size="small" disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Select
            label="Alcohol Use"
            value={formData.alcohol_use}
            options={options.alcoholUse || []}
            onChange={handleChange("alcohol_use")}
            fullWidth size="small" disabled={isCompleted}
          />
        </Grid>
      </Grid>

      <Subheader title="Extra-Oral Examination" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Extra-Oral Examination"
            value={formData.extra_oral_examination}
            onChange={handleChange("extra_oral_examination")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="TMJ Examination"
            value={formData.tmj_examination}
            onChange={handleChange("tmj_examination")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Lymph Nodes"
            value={formData.lymph_nodes}
            onChange={handleChange("lymph_nodes")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
      </Grid>

      <Subheader title="Intra-Oral Examination" />
      <DentalOralExamination
        consultationId={consultation.id}
        data={oralExamData}
        onUpdate={() => {
          fetch(`/api/consultations/${consultation.id}`)
            .then((r) => r.json())
            .then((d) => { if (d.data?.dental_oral_examination) setOralExamData(d.data.dental_oral_examination); });
        }}
      />

      <Subheader title="Oral Hygiene Status" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Select
            label="Oral Hygiene Status"
            value={formData.oral_hygiene_status}
            options={options.oralHygieneStatus || []}
            onChange={handleChange("oral_hygiene_status")}
            fullWidth size="small" disabled={isCompleted}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Select
            label="Patient to Return"
            value={formData.patient_to_return}
            options={options.patientToReturn || []}
            onChange={(v) => {
              setFormData((prev) => ({ ...prev, patient_to_return: v }));
              scheduleAutoSave({ ...formData, patient_to_return: v });
            }}
            fullWidth size="small" disabled={isCompleted}
          />
        </Grid>
        {formData.patient_to_return === "Yes" && (
          <Grid item xs={12} sm={3}>
            <TextField
              label="Return Date"
              value={formData.to_return_date}
              onChange={handleChange("to_return_date")}
              type="date" fullWidth size="small" disabled={isCompleted}
            />
          </Grid>
        )}
        {formData.patient_to_return === "Yes" && (
          <Grid item xs={12} sm={3}>
            <TextField
              label="Return Time"
              value={formData.to_return_time}
              onChange={handleChange("to_return_time")}
              type="time" fullWidth size="small" disabled={isCompleted}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ my: 2 }}>
        <Subheader title="Diagnosis & Treatment Plan" />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <DiagnosisCard
              title="Additional Diagnosis"
              consultationId={consultation.id}
              items={diagnoses || []}
              diagnosisType="Additional"
              onClickAdd={(title, type) => openSelectDiagnosesModal(title, type)}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ my: 2 }}>
        <Subheader title="Treatment Items" />
        <ConsultationItemsCard
          title="Treatment Items"
          items={consItems || []}
          consultationId={consultation.id}
          showAllTypes={true}
          onClickAdd={() => openSelectItemsModal("Add Treatment Item", "Dental Lab")}
        />
      </Box>

      <Subheader title="Dental Lab Orders" />
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Lab Orders</Typography>
            <Button size="small" variant="outlined" onClick={() => {
              setLabForm({ order_type: "", description: "", material: "", shade: "", tooth_number: "", teeth_involved: [], lab_name: "", lab_notes: "", cost: "", technician_charges: "", impression_date: "", delivery_date: "" });
              setLabEditingId(null);
              setLabFormOpen(true);
            }}>
              + New Lab Order
            </Button>
          </Box>
          {labOrders && labOrders.length > 0 ? (
            <Stack spacing={1}>
              {labOrders.map((order) => (
                <Paper key={order.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" fontWeight={600}>DL-{order.id} — {order.order_type}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="caption" color="text.secondary">{order.material || ""} {order.shade ? `(${order.shade})` : ""}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="caption" color="text.secondary">
                        {order.tooth_number ? `Tooth ${order.tooth_number}` : (order.teeth_involved ? (Array.isArray(order.teeth_involved) ? `${order.teeth_involved.length} teeth` : order.teeth_involved) : "")}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Chip label={order.status} size="small" color={order.status === "Delivered" ? "success" : order.status === "Ready" ? "secondary" : order.status === "In Progress" ? "info" : "warning"} />
                    </Grid>
                    <Grid item xs={12} sm={3} sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      {order.status === "Ordered" && (
                        <Button size="small" variant="outlined" onClick={() => handleLabStatus(order, "In Progress")}>In Progress</Button>
                      )}
                      {order.status === "In Progress" && (
                        <Button size="small" variant="outlined" onClick={() => handleLabStatus(order, "Ready")}>Mark Ready</Button>
                      )}
                      {order.status === "Ready" && (
                        <Button size="small" variant="outlined" onClick={() => handleLabStatus(order, "Delivered")}>Deliver</Button>
                      )}
                      <Button size="small" variant="text" onClick={() => {
                        setLabForm({
                          order_type: order.order_type || "",
                          description: order.description || "",
                          material: order.material || "",
                          shade: order.shade || "",
                          tooth_number: order.tooth_number || "",
                          teeth_involved: order.teeth_involved || [],
                          lab_name: order.lab_name || "",
                          lab_notes: order.lab_notes || "",
                          cost: order.cost || "",
                          technician_charges: order.technician_charges || "",
                          impression_date: order.impression_date || "",
                          delivery_date: order.delivery_date || "",
                        });
                        setLabEditingId(order.id);
                        setLabFormOpen(true);
                      }}>Edit</Button>
                      {order.status === "Ordered" && isAdmin() && (
                        <Button size="small" variant="text" color="error" onClick={() => handleDeleteLabOrder(order.id)}>Delete</Button>
                      )}
                    </Grid>
                  </Grid>
                  {order.lab_notes ? (
                    <Box sx={{ mt: 1, borderLeft: "3px solid", borderColor: "primary.main", pl: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Lab Notes</Typography>
                      <Typography variant="body2">{order.lab_notes}</Typography>
                    </Box>
                  ) : null}
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              No lab orders yet. Add a dental prosthetic item and create a lab order.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Subheader title="Prescriptions" />
      <PrescriptionForm
        consultationId={consultation.id}
        patientId={patient.id}
        prescriptions={prescriptions}
        onPrescriptionAdded={(rx) => setPrescriptions((prev) => [rx, ...prev])}
      />

      <Subheader title="Radiographs / X-rays" />
      <DentalRadiographs
        consultationId={consultation.id}
        patientId={patient.id}
        radiographs={radiographs}
        onRadiographAdded={(rx) => setRadiographs((prev) => [rx, ...prev])}
      />

      <Subheader title="Remarks" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Remarks"
            value={formData.remarks}
            onChange={handleChange("remarks")}
            multiline rows={2} fullWidth size="small"
            disabled={isCompleted}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        {!isCompleted && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCompleteDialogOpen(true)}
            disabled={completeLoading}
          >
            {completeLoading ? "Saving..." : "Complete Clinical Notes"}
          </Button>
        )}
        {consultation?.returned_from && (
          <Button
            variant="contained"
            color="success"
            onClick={() => setDischargeDialogOpen(true)}
            disabled={dischargeLoading}
          >
            {dischargeLoading ? "Discharging..." : "Discharge Patient"}
          </Button>
        )}
        <PatientFilePDF
          patient={patient}
          consultation={consultation}
          diagnoses={diagnoses}
          items={consItems}
        />
      </Stack>

      <Dialog open={labFormOpen} onClose={() => setLabFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{labEditingId ? `Edit Lab Order #DL-${labEditingId}` : "New Dental Lab Order"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <Select
                label="Order Type"
                value={labForm.order_type}
                options={options.labOrderTypesDialog || []}
                onChange={(v) => setLabForm({ ...labForm, order_type: v })}
                fullWidth size="small" required
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <Select
                label="Tooth #"
                value={labForm.tooth_number}
                options={options.toothNumbers || []}
                onChange={(v) => setLabForm({ ...labForm, tooth_number: v })}
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Material"
                value={labForm.material}
                onChange={(v) => setLabForm({ ...labForm, material: v || "" })}
                placeholder="e.g. PFM, Zirconia, Acrylic"
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Shade"
                value={labForm.shade}
                onChange={(v) => setLabForm({ ...labForm, shade: v || "" })}
                placeholder="e.g. A2"
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Lab Name"
                value={labForm.lab_name}
                onChange={(v) => setLabForm({ ...labForm, lab_name: v || "" })}
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Impression Date"
                type="date"
                value={labForm.impression_date}
                onChange={(v) => setLabForm({ ...labForm, impression_date: v || "" })}
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Delivery Date"
                type="date"
                value={labForm.delivery_date}
                onChange={(v) => setLabForm({ ...labForm, delivery_date: v || "" })}
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={labForm.description}
                onChange={(v) => setLabForm({ ...labForm, description: v || "" })}
                multiline rows={2} fullWidth size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Cost (TZS)"
                value={labForm.cost}
                onChange={(v) => setLabForm({ ...labForm, cost: v || "" })}
                type="number" fullWidth size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Technician Charges (TZS)"
                value={labForm.technician_charges}
                onChange={(v) => setLabForm({ ...labForm, technician_charges: v || "" })}
                type="number" fullWidth size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Lab Notes"
                value={labForm.lab_notes}
                onChange={(v) => setLabForm({ ...labForm, lab_notes: v || "" })}
                multiline rows={2} fullWidth size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLabFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLabOrder} disabled={labSaving}>
            {labSaving ? "Saving..." : labEditingId ? "Update" : "Send to Lab"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Clinical Notes</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to complete these clinical notes? The consultation will be marked as 'Consulted'.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCompleteClinicalNotes} disabled={completeLoading}>
            {completeLoading ? "Saving..." : "Complete"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={dischargeDialogOpen} onClose={() => setDischargeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Discharge Patient</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to discharge this patient? They will be sent to the cashier for final payment.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDischargeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleDischarge} disabled={dischargeLoading}>
            {dischargeLoading ? "Discharging..." : "Discharge"}
          </Button>
        </DialogActions>
      </Dialog>
      <Modal ref={modalRef} />
    </Paper>
  );
};

export default DentalClinicalNotes;
