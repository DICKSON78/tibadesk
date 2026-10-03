import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  LinearProgress,
} from "@mui/material";
import Form from "../../../../components/Form";
import TextField from "../../../../components/TextField";
import Select from "../../../../components/Select";
import FormLabelControl from "../../../../components/FormLabelControl";

import { useFetch, usePatch, useToast } from "../../../../hooks";
import { formatError } from "../../../../helpers";

const EditItem = ({ item, modal, fetchItems }) => {
  const addToast = useToast();

  const formRef = useRef();
  const nameRef = useRef();
  const codeRef = useRef();
  const itemTypeRef = useRef();
  const consultationTypeRef = useRef();
  const unitOfMeasureRef = useRef();
  const lensTypeRef = useRef();

  const { data: itemTypes } = useFetch(
    "api/item-types",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: consultationTypes } = useFetch(
    "api/consultation-types",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: unitsOfMeasure } = useFetch(
    "api/units-of-measure",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const { data: lensTypes } = useFetch(
    "api/lens-types",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [itemType, setItemType] = useState(item.item_type);
  const [consultationType, setConsultationType] = useState(
    item.consultation_type
  );
  const [formData, setFormData] = useState({
    name: item.name,
    code: item.code,
    item_type_id: item.item_type_id,
    consultation_type_id: item.consultation_type_id,
    unit_of_measure_id: item.unit_of_measure_id,
    lens_type_id: item.lens_type_id,
    is_consultation_item: item.is_consultation_item,
    is_stock_item: item.is_stock_item,
    templates: (item.templates || "").split(","),
    status: item.status,
  });

  const { data, loading, error, handlePatch } = usePatch();

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        fetchItems();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch(`api/items/${item.id}`, {
        ...formData,
        templates: formData.templates.join(","),
      });
    }
  };

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent>
        <Form ref={formRef}>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={nameRef}
                label="Item Name"
                fullWidth
                required
                defaultValue={item.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <TextField
                ref={codeRef}
                label="Item Code"
                fullWidth
                defaultValue={item.code}
                onChange={(value) => setFormData({ ...formData, code: value })}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <Select
                ref={itemTypeRef}
                label="Item Type"
                fullWidth
                required
                options={itemTypes}
                optionsLabel="name"
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={itemType}
                onChange={(value) => {
                  setItemType(value);
                  setFormData({ ...formData, item_type_id: value.id });
                }}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <Select
                ref={consultationTypeRef}
                label="Consultation Type"
                fullWidth
                required
                options={consultationTypes}
                optionsLabel="name"
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={consultationType}
                onChange={(value) => {
                  setConsultationType(value);
                  setFormData({ ...formData, consultation_type_id: value?.id });
                }}
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <Select
                ref={unitOfMeasureRef}
                label="Unit of Measure"
                fullWidth
                options={unitsOfMeasure}
                optionsLabel="name"
                optionsValue="id"
                isOptionEqualToValue={(option, value) => option.id === value.id}
                clearable
                value={unitsOfMeasure.find(
                  (e) => e.id === formData.unit_of_measure_id
                )}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    unit_of_measure_id: value || null,
                  })
                }
              />
            </Grid>
            {itemType && itemType.name === "Lens" ? (
              <Grid
                item
                md={6}
                sm={12}
                xs={12}
              >
                <Select
                  ref={lensTypeRef}
                  label="Lens Type"
                  fullWidth
                  options={lensTypes}
                  optionsLabel="name"
                  optionsValue="id"
                  clearable
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  value={
                    lensTypes.find((e) => e.id === formData.lens_type_id) ||
                    null
                  }
                  onChange={(value) =>
                    setFormData({ ...formData, lens_type_id: value || null })
                  }
                />
              </Grid>
            ) : null}
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
              alignSelf="flex-end"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_consultation_item === "Yes"}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        is_consultation_item: event.target.checked
                          ? "Yes"
                          : "No",
                      })
                    }
                  />
                }
                label="Consultation Item"
              />
            </Grid>
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={item.is_stock_item === "Yes"}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        is_stock_item: event.target.checked ? "Yes" : "No",
                      })
                    }
                  />
                }
                label="Stock Item"
              />
            </Grid>
            {consultationType && consultationType.name === "Procedure" ? (
              <Grid
                item
                md={12}
                sm={12}
                xs={12}
              >
                <FormLabelControl
                  label="Item Templates"
                  control={
                    <Box
                      p={2}
                      border={(theme) => `1px solid ${theme.palette.divider}`}
                      borderRadius={(theme) => `${theme.shape.borderRadius}px`}
                      bgcolor={(theme) =>
                        theme.components.MuiOutlinedInput.styleOverrides.root
                          .backgroundColor
                      }
                    >
                      {["Surgery Record Report", "Cataract Surgery Record"].map(
                        (e) => (
                          <FormControlLabel
                            key={e}
                            control={
                              <Checkbox
                                checked={formData.templates.indexOf(e) !== -1}
                                onChange={(event) =>
                                  setFormData({
                                    ...formData,
                                    templates: event.target.checked
                                      ? [...formData.templates, e]
                                      : formData.templates.filter(
                                          (f) => f !== e
                                        ),
                                  })
                                }
                              />
                            }
                            label={e}
                          />
                        )
                      )}
                    </Box>
                  }
                />
              </Grid>
            ) : null}
            <Grid
              item
              md={6}
              sm={12}
              xs={12}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={item.status === "Active"}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        status: event.target.checked ? "Active" : "Inactive",
                      })
                    }
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </Form>
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          sx={{ mr: 1 }}
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditItem;
