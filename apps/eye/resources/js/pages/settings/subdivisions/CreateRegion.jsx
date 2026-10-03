import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Grid,
  LinearProgress,
} from "@mui/material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";

import { usePost, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const CreateRegion = ({ modal, onSuccess }) => {
  const addToast = useToast();

  const formRef = useRef();
  const nameRef = useRef();

  const [formData, setFormData] = useState({
    name: undefined,
  });

  const { data, loading, error, handlePost } = usePost("api/regions", formData);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      window.setTimeout(() => {
        modal.close();
        onSuccess(data.data);
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
      handlePost();
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
                label="Name"
                fullWidth
                required
                onChange={(value) => setFormData({ ...formData, name: value })}
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

export default CreateRegion;
