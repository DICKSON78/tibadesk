import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  SaveRounded as SaveIcon,
  ArrowBackRounded as BackIcon,
  MedicationRounded as MedicineIcon,
} from "@mui/icons-material";

import Page, { Header as PageHeader } from "../../components/Page";
import { useFetch, useToast } from "../../hooks";
import { formatError } from "../../helpers";

const CreateMedicineTaking = () => {
  const navigate = useNavigate();
  const addToast = useToast();

  const [formData, setFormData] = useState({
    patient_id: '',
    medicine_id: '',
    dosage: '',
    scheduled_date: '',
    scheduled_time: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  // Fetch patients
  const { data: patients, loading: patientsLoading } = useFetch(
    "api/patients",
    { per_page: 1000 },
    true,
    { data: [] }
  );

  // Fetch medicines
  const { data: medicines, loading: medicinesLoading } = useFetch(
    "api/medicines",
    { per_page: 1000 },
    true,
    { data: [] }
  );

  useEffect(() => {
    document.title = `Create Medicine Taking - ${window.APP_NAME}`;
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/medicine-taking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        addToast({ message: 'Medicine taking record created successfully', severity: 'success' });
        navigate('/medicine-center/medicine-taking');
      } else {
        addToast({ message: formatError(result), severity: 'error' });
      }
    } catch (error) {
      addToast({ message: 'Error creating medicine taking record', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.patient_id && 
           formData.medicine_id && 
           formData.dosage && 
           formData.scheduled_date && 
           formData.scheduled_time;
  };

  return (
    <Page
      title="Create Medicine Taking"
      breadcrumbs={[
        { title: "Home" },
        { title: "Medicine Center" },
        { title: "Medicine Taking", to: "/medicine-center/medicine-taking" },
        { title: "Create" },
      ]}
    >
      <Card>
        <PageHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MedicineIcon sx={{ fontSize: 28.8, color: 'primary.main' }} />
              <Typography variant="h5">Create Medicine Taking Record</Typography>
            </Box>
          }
          action={
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate('/medicine-center/medicine-taking')}
            >
              Back to List
            </Button>
          }
        />

        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Patient</InputLabel>
                  <Select
                    value={formData.patient_id}
                    onChange={(e) => handleInputChange('patient_id', e.target.value)}
                    disabled={patientsLoading}
                  >
                    {patientsLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                        Loading patients...
                      </MenuItem>
                    ) : (
                      patients.data?.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.phone})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Medicine</InputLabel>
                  <Select
                    value={formData.medicine_id}
                    onChange={(e) => handleInputChange('medicine_id', e.target.value)}
                    disabled={medicinesLoading}
                  >
                    {medicinesLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                        Loading medicines...
                      </MenuItem>
                    ) : (
                      medicines.data?.map((medicine) => (
                        <MenuItem key={medicine.id} value={medicine.id}>
                          {medicine.name} ({medicine.brand_name || medicine.generic_name})
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Dosage"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  required
                  placeholder="e.g., 1 tablet, 2 capsules"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scheduled Date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Scheduled Time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Additional instructions or notes..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/medicine-center/medicine-taking')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading || !isFormValid()}
                  >
                    {loading ? 'Creating...' : 'Create Record'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Page>
  );
};

export default CreateMedicineTaking;
