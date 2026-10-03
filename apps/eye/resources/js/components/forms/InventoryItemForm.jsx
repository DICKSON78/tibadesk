import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  SaveRounded as SaveIcon,
  CancelRounded as CancelIcon,
  AddRounded as AddIcon,
  EditRounded as EditIcon,
} from '@mui/icons-material';

import { useFetch, useToast } from '../../hooks';
import { formatError } from '../../helpers';

const InventoryItemForm = ({ 
  item = null, 
  onSave, 
  onCancel, 
  title = "Add New Item",
  isEdit = false 
}) => {
  const addToast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    item_type: '',
    unit_of_measure: '',
    min_stock: 0,
    max_stock: 0,
    current_stock: 0,
    supplier: '',
    expiry_date: '',
    description: '',
    buying_price: 0,
    selling_price: 0,
    ...item
  });

  const [errors, setErrors] = useState({});

  // Fetch item types and units of measure
  const { data: itemTypes } = useFetch(
    'api/item-types',
    { status: 'Active' },
    true,
    []
  );

  const { data: unitsOfMeasure } = useFetch(
    'api/unit-of-measures',
    { status: 'Active' },
    true,
    []
  );

  const { data: suppliers } = useFetch(
    'api/suppliers',
    { status: 'Active' },
    true,
    []
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Item code is required';
    }

    if (!formData.item_type) {
      newErrors.item_type = 'Item type is required';
    }

    if (!formData.unit_of_measure) {
      newErrors.unit_of_measure = 'Unit of measure is required';
    }

    if (formData.min_stock < 0) {
      newErrors.min_stock = 'Minimum stock cannot be negative';
    }

    if (formData.max_stock <= 0) {
      newErrors.max_stock = 'Maximum stock must be greater than 0';
    }

    if (formData.min_stock >= formData.max_stock) {
      newErrors.min_stock = 'Minimum stock must be less than maximum stock';
    }

    if (formData.current_stock < 0) {
      newErrors.current_stock = 'Current stock cannot be negative';
    }

    if (formData.buying_price < 0) {
      newErrors.buying_price = 'Buying price cannot be negative';
    }

    if (formData.selling_price < 0) {
      newErrors.selling_price = 'Selling price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast({ message: 'Please fix the errors in the form', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      addToast({ message: `Item ${isEdit ? 'updated' : 'added'} successfully`, severity: 'success' });
    } catch (error) {
      addToast({ message: formatError(error), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : (isEdit ? <SaveIcon /> : <AddIcon />)}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Item' : 'Add Item')}
            </Button>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                error={!!errors.code}
                helperText={errors.code}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.item_type} required>
                <InputLabel>Item Type</InputLabel>
                <Select
                  value={formData.item_type}
                  label="Item Type"
                  onChange={(e) => handleInputChange('item_type', e.target.value)}
                >
                  {itemTypes.map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.item_type && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.item_type}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.unit_of_measure} required>
                <InputLabel>Unit of Measure</InputLabel>
                <Select
                  value={formData.unit_of_measure}
                  label="Unit of Measure"
                  onChange={(e) => handleInputChange('unit_of_measure', e.target.value)}
                >
                  {unitsOfMeasure.map((unit) => (
                    <MenuItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.unit_of_measure && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.unit_of_measure}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Stock Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                Stock Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={formData.current_stock}
                onChange={(e) => handleInputChange('current_stock', parseInt(e.target.value) || 0)}
                error={!!errors.current_stock}
                helperText={errors.current_stock}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Stock"
                type="number"
                value={formData.min_stock}
                onChange={(e) => handleInputChange('min_stock', parseInt(e.target.value) || 0)}
                error={!!errors.min_stock}
                helperText={errors.min_stock}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Maximum Stock"
                type="number"
                value={formData.max_stock}
                onChange={(e) => handleInputChange('max_stock', parseInt(e.target.value) || 0)}
                error={!!errors.max_stock}
                helperText={errors.max_stock}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                Additional Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplier}
                  label="Supplier"
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buying Price"
                type="number"
                value={formData.buying_price || 0}
                onChange={(e) => handleInputChange('buying_price', parseFloat(e.target.value) || 0)}
                error={!!errors.buying_price}
                helperText={errors.buying_price}
                InputProps={{ 
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: '$'
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Selling Price"
                type="number"
                value={formData.selling_price || 0}
                onChange={(e) => handleInputChange('selling_price', parseFloat(e.target.value) || 0)}
                error={!!errors.selling_price}
                helperText={errors.selling_price}
                InputProps={{ 
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: '$'
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter item description..."
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InventoryItemForm;
