import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import Form from "../../components/Form";
import TextField from "../../components/TextField";

import { useFetch, usePost, useToast } from "../../hooks";
import { formatError, getValidationRules } from "../../helpers";

const validationRules = getValidationRules();

const Preferences = () => {
  const addToast = useToast();
  const navigate = useNavigate();

  const modalRef = useRef();
  const formRef = useRef();
  const consultationMessageRef = useRef();
  const reminderMessageRef = useRef();

  const [formData, setFormData] = useState({
    preferences: [
      {
        key: "SEND_MESSAGES",
        value: "No",
      },
      {
        key: "CONSULTATION_MESSAGE",
        value: "",
      },
      {
        key: "PATIENT_TO_RETURN_REMINDER_MESSAGE",
        value: "",
      },
    ],
  });

  const { data: preferences, loading: loadingPreferences } = useFetch(
    "api/preferences",
    null,
    true,
    null,
    (response) => {
      const data = response.data.data;
      setPreference(
        0,
        data.find((e) => e.key === "SEND_MESSAGES")?.value || "No"
      );
      setPreference(
        1,
        data.find((e) => e.key === "CONSULTATION_MESSAGE")?.value || ""
      );
      setPreference(
        2,
        data.find((e) => e.key === "PATIENT_TO_RETURN_REMINDER_MESSAGE")
          ?.value || ""
      );
      return data;
    }
  );
  const { data, loading, error, handlePost } = usePost(
    "api/preferences",
    formData
  );

  useEffect(() => {
    document.title = `System Preferences - ${window.APP_NAME}`;
  }, []);

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
      handlePost();
    }
  };

  const setPreference = (index, value) => {
    let formData1 = formData;
    formData1.preferences[index].value = value;
    setFormData(formData1);
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Settings" },
        { title: "System Preferences" },
      ]}
    >
      <Card>
        <PageHeader title="System Preferences" />
        <Divider />
        <CardContent>
          <Form ref={formRef}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 64 }}>S/N</TableCell>
                  <TableCell>Preference</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingPreferences ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      sx={{ p: 0, borderBottom: "none" }}
                    >
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : null}
                {preferences ? (
                  <React.Fragment>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell> Send Messages </TableCell>
                      <TableCell>
                        <Checkbox
                          defaultChecked={
                            formData.preferences[0].value === "Yes"
                          }
                          onChange={(event) =>
                            setPreference(
                              0,
                              event.target.checked ? "Yes" : "No"
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2</TableCell>
                      <TableCell>Consultation Message</TableCell>
                      <TableCell>
                        <TextField
                          ref={consultationMessageRef}
                          fullWidth
                          multiline
                          minRows={5}
                          maxRows={10}
                          required
                          defaultValue={formData.preferences[1].value}
                          onChange={(value) => setPreference(1, value)}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>3</TableCell>
                      <TableCell>Patient to Return Reminder Message</TableCell>
                      <TableCell>
                        <TextField
                          ref={reminderMessageRef}
                          fullWidth
                          multiline
                          minRows={5}
                          maxRows={10}
                          required
                          defaultValue={formData.preferences[2].value}
                          onChange={(value) => setPreference(2, value)}
                        />
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ) : null}
              </TableBody>
            </Table>
          </Form>
        </CardContent>
        <Divider />
        {loading && <LinearProgress />}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            disabled={loading}
            variant="contained"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Preferences;
