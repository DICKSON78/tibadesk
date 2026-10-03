import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import Form from "../../../../components/Form";
import TextField from "../../../../components/TextField";
import Select from "../../../../components/Select";
import Table from "../../../../components/Table";

import { useDelete, useFetch, usePost, useToast } from "../../../../hooks";
import {
  formatError,
  getValidationRules,
  numberFormat,
} from "../../../../helpers";

const validationRules = getValidationRules();

const ManageItemPrices = ({ item, modal }) => {
  const addToast = useToast();

  const formRef = useRef();
  const paymentModeRef = useRef();
  const unitPriceRef = useRef();

  const [data, setData] = useState();
  const [error, setError] = useState();

  const { data: paymentModes } = useFetch(
    "api/payment-modes",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );
  const {
    data: itemPrices,
    loading: loadingFetchItemPrices,
    error: errorFetchItemPrices,
    handleFetch: fetchItemPrices,
  } = useFetch(
    "api/item-prices",
    {
      item_id: item.id,
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [formData, setFormData] = useState({
    item_id: item.id,
    payment_mode_id: undefined,
    unit_price: undefined,
  });

  const {
    data: dataPost,
    loading: loadingPost,
    error: errorPost,
    handlePost,
  } = usePost("api/item-prices", formData);
  const {
    data: dataDelete,
    loading: loadingDelete,
    error: errorDelete,
    handleDelete,
  } = useDelete();

  useEffect(() => {
    if (dataPost) {
      setData(dataPost);
      fetchItemPrices();
    }
  }, [dataPost]);

  useEffect(() => {
    if (dataDelete) {
      setData(dataDelete);
      fetchItemPrices();
    }
  }, [dataDelete]);

  useEffect(() => {
    if (errorFetchItemPrices) {
      setError(errorFetchItemPrices);
    }
  }, [errorFetchItemPrices]);

  useEffect(() => {
    if (errorPost) {
      setError(errorPost);
    }
  }, [errorPost]);

  useEffect(() => {
    if (errorDelete) {
      setError(errorDelete);
    }
  }, [errorDelete]);

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

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      setData(null);
      setError(null);
      handlePost();
    }
  };

  const handleSubmitDelete = (item) => {
    setData(null);
    setError(null);
    handleDelete(`api/item-prices/${item.id}`);
  };

  return (
    <React.Fragment>
      {loadingFetchItemPrices || loadingPost || loadingDelete ? (
        <LinearProgress />
      ) : null}
      <CardContent>
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            md={5}
            sm={12}
            xs={12}
          >
            <Card variant="outlined">
              <CardHeader title="Add Item Price" />
              <Divider />
              <CardContent>
                <Form ref={formRef}>
                  <Select
                    ref={paymentModeRef}
                    label="Payment Mode"
                    fullWidth
                    required
                    options={paymentModes}
                    optionsLabel="name"
                    optionsValue="id"
                    onChange={(value) =>
                      setFormData({ ...formData, payment_mode_id: value })
                    }
                    containerProps={{ sx: { mb: 2 } }}
                  />
                  <TextField
                    ref={unitPriceRef}
                    label="Unit Price"
                    fullWidth
                    required
                    rules={[validationRules.number]}
                    onChange={(value) =>
                      setFormData({ ...formData, unit_price: value })
                    }
                  />
                </Form>
              </CardContent>
              <Divider />
              <Box p={2}>
                <Button
                  disabled={loadingPost}
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Box>
            </Card>
          </Grid>
          <Grid
            item
            md={7}
            sm={12}
            xs={12}
          >
            <Card variant="outlined">
              <CardHeader title="Item Prices" />
              <Divider />
              <CardContent>
                <Table
                  loading={loadingFetchItemPrices}
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, index) => index + 1,
                    },
                    {
                      field: "payment_mode_id",
                      headerName: "Payment Mode",
                      valueGetter: (item, index) => item.payment_mode?.name,
                    },
                    {
                      field: "unit_price",
                      headerName: "Unit Price",
                      valueGetter: (item, index) =>
                        numberFormat(item.unit_price || 0),
                    },
                    {
                      field: "actions",
                      headerName: "Actions",
                      renderCell: (item) => (
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              disabled={loadingDelete}
                              onClick={() => handleSubmitDelete(item)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ),
                    },
                  ]}
                  items={itemPrices}
                  hidePaginationFooter
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          onClick={() => modal.close()}
        >
          Close
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default ManageItemPrices;
