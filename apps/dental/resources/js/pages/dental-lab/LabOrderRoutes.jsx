import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, LinearProgress,
  Skeleton, Stack, Tooltip, Typography,
} from "../../components/ui/index.jsx";
import {
  ArrowBack as ArrowBackIcon,
  PrintRounded as PrintIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  AddRounded as AddIcon,
  CloseRounded as CloseIcon,
  ScienceRounded as ScienceIcon,
  CalendarTodayRounded as CalendarIcon,
  MonetizationOnRounded as CostIcon,
  PaletteRounded as ShadeIcon,
  CategoryRounded as CategoryIcon,
} from "../../components/ui/icons.jsx";
import Page, { Header as PageHeader } from "../../components/Page";
import PatientDetails from "../reception/patients/PatientDetails";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import DatePicker from "../../components/DatePicker";
import { usePatch, useToast, useOptions } from "../../hooks";
import { formatDate, isAdmin } from "../../helpers";

const statusColors = {
  Ordered: "warning",
  "In Progress": "info",
  Ready: "success",
  Delivered: "secondary",
};

const STATUS_FLOW = ["Ordered", "In Progress", "Ready", "Delivered"];

const LabOrderRoutes = () => {
  const { patientId, consultationId } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [patient, setPatient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const { handlePatch: patch, loading: saving } = usePatch();
  const { options: dentalOptions } = useOptions();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [orderForm, setOrderForm] = useState({
    consultation_id: consultationId,
    order_type: "",
    description: "",
    material: "",
    shade: "",
    tooth_number: "",
    teeth_involved: [],
    lab_name: "",
    lab_notes: "",
    cost: "",
    technician_charges: "",
    impression_date: "",
    delivery_date: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const ordRes = await fetch(`/api/dental-lab-orders?consultation_id=${consultationId}`);
        setOrders((await ordRes.json()).data?.data || []);
      } catch (e) {
        addToast("Failed to load data", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [consultationId]);

  const handleCreateOrder = async () => {
    try {
      const payload = {
        ...orderForm,
        teeth_involved: orderForm.teeth_involved.length > 0 ? orderForm.teeth_involved : undefined,
      };
      const isEdit = !!editingId;
      const url = isEdit ? `/api/dental-lab-orders/${editingId}` : "/api/dental-lab-orders";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.message || "Operation failed", { variant: "error" });
        return;
      }
      if (json.data) {
        if (isEdit) {
          setOrders(orders.map((o) => (o.id === editingId ? json.data : o)));
        } else {
          setOrders([json.data, ...orders]);
        }
        setShowForm(false);
        setEditingId(null);
        setOrderForm({
          consultation_id: consultationId,
          order_type: "", description: "", material: "", shade: "",
          tooth_number: "", teeth_involved: [], lab_name: "", lab_notes: "",
          cost: "", technician_charges: "", impression_date: "", delivery_date: "",
        });
        addToast(isEdit ? "Lab order updated" : "Lab order created", { variant: "success" });
      }
    } catch (e) {
      addToast("Failed to save order", { variant: "error" });
    }
  };

  const handleEditClick = (order) => {
    setOrderForm({
      consultation_id: order.consultation_id,
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
    setEditingId(order.id);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setOrderForm({
      consultation_id: consultationId,
      order_type: "", description: "", material: "", shade: "",
      tooth_number: "", teeth_involved: [], lab_name: "", lab_notes: "",
      cost: "", technician_charges: "", impression_date: "", delivery_date: "",
    });
  };

  const handleStatus = async (id, status) => {
    try {
      if (status === "Ready") {
        await patch(`/api/dental-lab-orders/${id}/mark-ready`, {});
      } else if (status === "Delivered") {
        await patch(`/api/dental-lab-orders/${id}/mark-delivered`, {});
      } else {
        await patch(`/api/dental-lab-orders/${id}`, { status });
      }
      const res = await fetch(`/api/dental-lab-orders?consultation_id=${consultationId}`);
      setOrders((await res.json()).data?.data || []);
      addToast("Status updated", { variant: "success" });
    } catch {
      addToast("Failed to update", { variant: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lab order?")) return;
    try {
      await fetch(`/api/dental-lab-orders/${id}`, { method: "DELETE" });
      setOrders(orders.filter((o) => o.id !== id));
      addToast("Lab order deleted", { variant: "success" });
    } catch {
      addToast("Failed to delete", { variant: "error" });
    }
  };

  const handlePrintSlip = (order) => {
    const printWindow = window.open("", "_blank");
    const teethLabels = order.teeth_involved
      ? (Array.isArray(order.teeth_involved) ? order.teeth_involved : [order.teeth_involved])
          .map((t) => {
            const found = dentalOptions.toothNumbers?.find((tn) => tn.value === String(t));
            return found ? found.label : `Tooth ${t}`;
          }).join(", ")
      : (order.tooth_number
          ? (dentalOptions.toothNumbers?.find((tn) => tn.value === order.tooth_number)?.label || `Tooth ${order.tooth_number}`)
          : "N/A");

    printWindow.document.write(`
      <html>
      <head><title>Lab Slip - DL-${order.id}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: auto; }
        h1 { font-size: 18px; text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; }
        h2 { font-size: 14px; text-align: center; margin: 4px 0; }
        .info { margin: 12px 0; }
        .info div { margin: 4px 0; }
        .label { font-weight: bold; display: inline-block; width: 100px; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; border-top: 1px dashed #999; padding-top: 8px; }
        @media print { .no-print { display: none; } }
      </style>
      </head>
      <body>
        <h1>DENTAL LAB SLIP</h1>
        <h2>Order #DL-${order.id}</h2>
        <hr/>
        <div class="info">
          <div><span class="label">Patient:</span> ${patient?.full_name || ""}</div>
          <div><span class="label">Order Type:</span> ${order.order_type || ""}</div>
          <div><span class="label">Material:</span> ${order.material || "N/A"}</div>
          <div><span class="label">Shade:</span> ${order.shade || "N/A"}</div>
          <div><span class="label">Tooth/Teeth:</span> ${teethLabels}</div>
          <div><span class="label">Description:</span> ${order.description || "N/A"}</div>
          <div><span class="label">Lab Name:</span> ${order.lab_name || "N/A"}</div>
          <div><span class="label">Impression:</span> ${order.impression_date || "N/A"}</div>
          <div><span class="label">Delivery:</span> ${order.delivery_date || "N/A"}</div>
          ${order.lab_notes ? `<div><span class="label">Lab Notes:</span> ${order.lab_notes}</div>` : ""}
          <div><span class="label">Cost:</span> ${order.cost ? `TZS ${Number(order.cost).toLocaleString()}` : "N/A"}</div>
        </div>
        <hr/>
        <div style="margin-top: 12px;">
          <div>Ordered by: ${order.ordered_by || "______________"}</div>
          <div>Date: ${order.created_at ? formatDate(order.created_at) : new Date().toLocaleDateString()}</div>
        </div>
        <div class="footer">--- This is a computer-generated lab slip ---</div>
        <button class="no-print" onclick="window.print()" style="display:block;margin:20px auto;padding:8px 24px;font-size:14px;">Print</button>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const statCounts = STATUS_FLOW.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  const toothLabelFor = (order) => {
    const tooth = order.teeth_involved?.length
      ? String(order.teeth_involved[0])
      : order.tooth_number;
    if (!tooth) return "-";
    return dentalOptions.toothNumbers?.find((tn) => tn.value === String(tooth))?.value || tooth;
  };

  const WorkflowButton = ({ order }) => {
    const nextMap = {
      Ordered: { label: "Start", variant: "outlined", color: "primary", next: "In Progress" },
      "In Progress": { label: "Mark Ready", variant: "contained", color: "success", next: "Ready" },
      Ready: { label: "Delivered", variant: "outlined", color: "secondary", next: "Delivered" },
    };
    const step = nextMap[order.status];
    if (!step) return null;
    return (
      <Button
        size="small"
        variant={step.variant}
        color={step.color}
        onClick={() => handleStatus(order.id, step.next)}
      >
        {step.label}
      </Button>
    );
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Dental Lab" },
        { title: "Lab Orders" },
        { title: patient?.full_name || `Patient #${patientId}` },
      ]}
    >
      <PatientDetails
        patientId={patientId}
        setLoading={setLoadingPatient}
        onLoadSuccess={(data) => setPatient(data)}
      />

      {loadingPatient ? (
        <Skeleton variant="rounded" height={256} />
      ) : null}

      {patient ? (
        <>
          <Card sx={{ mb: 2 }}>
            <PageHeader
              title="Status Summary"
              caption="Track the progress of this patient's lab orders"
              trailing={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/dental-lab/lab-orders")}
                >
                  Back to Orders
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={1.5}>
                {STATUS_FLOW.map((s) => (
                  <Grid item xs={6} sm={3} key={s}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ py: 1.5, px: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="body2" fontWeight={500}>{s}</Typography>
                        <Chip label={statCounts[s] || 0} color={statusColors[s] || "default"} size="small" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <PageHeader
              title="Lab Orders"
              caption={`${orders.length} order${orders.length === 1 ? "" : "s"} placed for this patient`}
              trailing={
                <Button
                  variant={showForm ? "outlined" : "contained"}
                  size="small"
                  startIcon={showForm ? <CloseIcon /> : editingId ? <EditIcon /> : <AddIcon />}
                  onClick={() => (showForm ? handleCancelForm() : setShowForm(true))}
                >
                  {showForm ? "Cancel" : editingId ? "Editing..." : "New Order"}
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {loading && <LinearProgress />}

              {showForm && (
                <Card variant="outlined" sx={{ bgcolor: "background.default", mb: 2, borderRadius: 2 }}>
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      color="primary.main"
                      fontWeight={700}
                      sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <ScienceIcon />
                      {editingId ? `Edit Lab Order #DL-${editingId}` : "Create Lab Order"}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Select
                          label="Order Type"
                          value={orderForm.order_type}
                          options={dentalOptions.labOrderTypes || []}
                          onChange={(v) => setOrderForm({ ...orderForm, order_type: v })}
                          fullWidth size="small"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Select
                          label="Material"
                          value={orderForm.material}
                          options={dentalOptions.labMaterials || []}
                          onChange={(v) => setOrderForm({ ...orderForm, material: v })}
                          fullWidth size="small"
                        />
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <Select
                          label="Shade"
                          value={orderForm.shade}
                          onChange={(value) => setOrderForm({ ...orderForm, shade: value })}
                          options={dentalOptions.labShadeGuide || []}
                          fullWidth size="small"
                          clearable
                        />
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <Select
                          label="Primary Tooth"
                          value={orderForm.tooth_number}
                          options={dentalOptions.toothNumbers || []}
                          onChange={(v) => setOrderForm({ ...orderForm, tooth_number: v })}
                          fullWidth size="small"
                        />
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <TextField
                          label="Lab Name"
                          value={orderForm.lab_name}
                          onChange={(v) => setOrderForm({ ...orderForm, lab_name: v || "" })}
                          fullWidth size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Description"
                          value={orderForm.description}
                          onChange={(v) => setOrderForm({ ...orderForm, description: v || "" })}
                          multiline rows={2} fullWidth size="small"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <DatePicker
                          label="Impression Date"
                          value={orderForm.impression_date}
                          onChange={(v) => setOrderForm({ ...orderForm, impression_date: v })}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <DatePicker
                          label="Expected Delivery"
                          value={orderForm.delivery_date}
                          onChange={(v) => setOrderForm({ ...orderForm, delivery_date: v })}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Cost (TZS)"
                          value={orderForm.cost}
                          onChange={(v) => setOrderForm({ ...orderForm, cost: v || "" })}
                          type="number" fullWidth size="small"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Technician Charges (TZS)"
                          value={orderForm.technician_charges}
                          onChange={(v) => setOrderForm({ ...orderForm, technician_charges: v || "" })}
                          type="number" fullWidth size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Lab Notes"
                          value={orderForm.lab_notes}
                          onChange={(v) => setOrderForm({ ...orderForm, lab_notes: v || "" })}
                          multiline rows={2} fullWidth size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        {editingId ? (
                          <Button variant="outlined" size="small" onClick={handleCancelForm}>Cancel</Button>
                        ) : null}
                        <Button variant="contained" onClick={handleCreateOrder} disabled={saving}>
                          {editingId ? "Update Order" : "Create Order"}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {orders.length === 0 ? (
                <Typography color="text.secondary">No lab orders yet</Typography>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} variant="outlined" sx={{ mb: 1.5, borderRadius: 2, overflow: "hidden" }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ px: 2.5, py: 1.25, bgcolor: "action.hover", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Typography variant="subtitle1" fontWeight={700}>DL-{order.id}</Typography>
                          <Chip label={order.status} color={statusColors[order.status] || "default"} size="small" />
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Tooltip title="Print lab slip">
                            <Button size="small" startIcon={<PrintIcon />} onClick={() => handlePrintSlip(order)}>Print</Button>
                          </Tooltip>
                          <Tooltip title="Edit order">
                            <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditClick(order)}>Edit</Button>
                          </Tooltip>
                          {(order.status === "Ordered" || order.status === "In Progress") && isAdmin() && (
                            <Tooltip title="Delete order">
                              <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(order.id)}>Delete</Button>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                      <Box sx={{ px: 2.5, py: 1.5 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={2.4}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <CategoryIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary">Type</Typography>
                                <Typography variant="body2" fontWeight={500}>{order.order_type || "-"}</Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sm={2.4}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <ScienceIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary">Material</Typography>
                                <Typography variant="body2" fontWeight={500}>{order.material || "-"}</Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sm={2.4}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <ShadeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary">Shade</Typography>
                                <Typography variant="body2" fontWeight={500}>{order.shade || "-"}</Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={6} sm={2.4}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Tooth</Typography>
                              <Typography variant="body2" fontWeight={500}>{toothLabelFor(order)}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={2.4}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Lab</Typography>
                              <Typography variant="body2" fontWeight={500}>{order.lab_name || "-"}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        {(order.cost || order.technician_charges) && (
                          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}>
                            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                              {order.cost && (
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  <CostIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                                  <Typography variant="body2">
                                    Cost: <strong>TZS {Number(order.cost).toLocaleString()}</strong>
                                  </Typography>
                                </Stack>
                              )}
                              {order.technician_charges && (
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  <CostIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                                  <Typography variant="body2">
                                    Tech: <strong>TZS {Number(order.technician_charges).toLocaleString()}</strong>
                                  </Typography>
                                </Stack>
                              )}
                              {order.impression_date && (
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  <CalendarIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                                  <Typography variant="body2">Impression: {order.impression_date}</Typography>
                                </Stack>
                              )}
                            </Stack>
                          </Box>
                        )}
                        {order.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {order.description}
                          </Typography>
                        )}
                        {order.lab_notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: "italic" }}>
                            Notes: {order.lab_notes}
                          </Typography>
                        )}
                        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                          <WorkflowButton order={order} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </Page>
  );
};

export default LabOrderRoutes;