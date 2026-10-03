import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import Table, { SearchTextField } from "../../../components/Table";

import { useDelete, useFetch, usePost, useToast } from "../../../hooks";
import { formatError, throttle } from "../../../helpers";

const SelectDiagnoses = ({
  consultationId,
  selected: initial,
  diagnosisType,
  fetchDiagnoses,
  modal,
}) => {
  const addToast = useToast();

  const [data, setData] = useState();
  const [error, setError] = useState();

  const [diseaseName, setDiseaseName] = useState();

  const { data: diseases, loading: loadingDiseases } = useFetch(
    "api/diseases",
    {
      status: "Active",
      per_page: 50000,
      q: diseaseName,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const [selected, setSelected] = useState(initial);

  const {
    data: dataPost,
    loading: loadingPost,
    error: errorPost,
    handlePost,
  } = usePost();
  const {
    data: dataDelete,
    loading: loadingDelete,
    error: errorDelete,
    handleDelete,
  } = useDelete();

  useEffect(() => {
    if (dataPost) {
      setData(dataPost);
      setSelected([...selected, dataPost.data]);
      fetchDiagnoses();
    }
  }, [dataPost]);

  useEffect(() => {
    if (dataDelete) {
      setData(dataDelete);
      setSelected(selected.filter((e) => e.id !== dataDelete.data.id));
      fetchDiagnoses();
    }
  }, [dataDelete]);

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

  const handlePostDiagnosis = (item) => {
    setData(null);
    setError(null);
    handlePost("api/consultation-diagnoses", {
      consultation_id: consultationId,
      diagnosis_type: diagnosisType,
      disease_id: item.id,
    });
  };

  const handleDeleteDiagnosis = (item) => {
    setData(null);
    setError(null);
    handleDelete(`api/consultation-diagnoses/${item.id}`);
  };

  return (
    <React.Fragment>
      {loadingPost || loadingDelete ? <LinearProgress /> : null}
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
              <CardHeader
                title="Select Disease"
                action={
                  <SearchTextField
                    onChange={(value) =>
                      throttle(() => setDiseaseName(value), 1000)
                    }
                  />
                }
                className="no-action-margin"
              />
              <Divider />
              {loadingDiseases && <LinearProgress />}
              <CardContent sx={{ height: "40vh", overflowY: "auto" }}>
                {diseases.map((e) => (
                  <FormControlLabel
                    key={e.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={!!selected.find((f) => f.disease_id === e.id)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            handlePostDiagnosis(e);
                          } else {
                            const item = selected.find(
                              (f) => f.disease_id === e.id
                            );
                            if (item) {
                              handleDeleteDiagnosis(item);
                            }
                          }
                        }}
                      />
                    }
                    label={<Typography variant="body2">{e.name}</Typography>}
                    sx={{ display: "flex" }}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            md={7}
            sm={12}
            xs={12}
          >
            <Card variant="outlined">
              <CardHeader title="Selected Diseases" />
              <Divider />
              <CardContent>
                <Table
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, index) => index + 1,
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
                    {
                      field: "actions",
                      headerName: "Actions",
                      renderCell: (item) => (
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              disabled={loadingDelete}
                              onClick={() => handleDeleteDiagnosis(item)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ),
                    },
                  ]}
                  items={selected}
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

export default SelectDiagnoses;
