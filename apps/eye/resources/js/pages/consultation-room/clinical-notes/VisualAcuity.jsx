import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import TextField from "../../../components/TextField";
import usePatch from "../../../hooks/usePatch";

const VisualAcuity = ({ consultation: { id, status, visual_acuity } }, ref) => {
  const unaidedReVaRef = useRef();
  const unaidedRePhRef = useRef();
  const unaidedIpdRef = useRef();
  const unaidedLeVaRef = useRef();
  const unaidedLePhRef = useRef();
  const aidedReVaRef = useRef();
  const aidedReVaDescriptionRef = useRef();
  const aidedLeVaRef = useRef();
  const aidedLeVaDescriptionRef = useRef();

  const [formData, setFormData] = useState(visual_acuity);

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (!visual_acuity || (visual_acuity && value !== visual_acuity[field])) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, {
        what: "Visual Acuity",
        [field]: value,
      });
    }
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      return true;
    },
    getFormData: () => formData,
  }));

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell colSpan={2}>Unaided</TableCell>
          <TableCell colSpan={2}>Aided</TableCell>
        </TableRow>
        <TableRow>
          <TableCell />
          <TableCell>RE</TableCell>
          <TableCell>LE</TableCell>
          <TableCell>RE</TableCell>
          <TableCell>LE</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell component="th">VA</TableCell>
          <TableCell>
            <TextField
              ref={unaidedReVaRef}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_re_va : null}
              onChange={(value) => {
                setFormData({ ...formData, unaided_re_va: value });
                autoSave("unaided_re_va", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={unaidedLeVaRef}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_le_va : null}
              onChange={(value) => {
                setFormData({ ...formData, unaided_le_va: value });
                autoSave("unaided_le_va", value);
              }}
            />
          </TableCell>
          <TableCell>
            <Stack
              direction="row"
              spacing={1}
            >
              <TextField
                ref={aidedReVaRef}
                fullWidth
                defaultValue={visual_acuity ? visual_acuity.aided_re_va : null}
                onChange={(value) => {
                  setFormData({ ...formData, aided_re_va: value });
                  autoSave("aided_re_va", value);
                }}
                containerProps={{
                  width: 72,
                }}
              />
              <TextField
                ref={aidedReVaDescriptionRef}
                placeholder="Enter description"
                fullWidth
                defaultValue={
                  visual_acuity ? visual_acuity.aided_re_va_description : null
                }
                onChange={(value) => {
                  setFormData({ ...formData, aided_re_va_description: value });
                  autoSave("aided_re_va_description", value);
                }}
              />
            </Stack>
          </TableCell>
          <TableCell>
            <Stack
              direction="row"
              spacing={1}
            >
              <TextField
                ref={aidedLeVaRef}
                fullWidth
                defaultValue={visual_acuity ? visual_acuity.aided_le_va : null}
                onChange={(value) => {
                  setFormData({ ...formData, aided_le_va: value });
                  autoSave("aided_le_va", value);
                }}
                containerProps={{
                  width: 72,
                }}
              />
              <TextField
                ref={aidedLeVaDescriptionRef}
                placeholder="Enter description"
                fullWidth
                defaultValue={
                  visual_acuity ? visual_acuity.aided_le_va_description : null
                }
                onChange={(value) => {
                  setFormData({ ...formData, aided_le_va_description: value });
                  autoSave("aided_le_va_description", value);
                }}
              />
            </Stack>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">PH</TableCell>
          <TableCell>
            <TextField
              ref={unaidedRePhRef}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_re_ph : null}
              onChange={(value) => {
                setFormData({ ...formData, unaided_re_ph: value });
                autoSave("unaided_re_ph", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={unaidedLePhRef}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_le_ph : null}
              onChange={(value) => {
                setFormData({ ...formData, unaided_le_ph: value });
                autoSave("unaided_le_ph", value);
              }}
            />
          </TableCell>
          <TableCell />
          <TableCell />
        </TableRow>
        <TableRow>
          <TableCell component="th">IPD</TableCell>
          <TableCell colSpan={2}>
            <TextField
              ref={unaidedIpdRef}
              fullWidth
              defaultValue={visual_acuity ? visual_acuity.unaided_ipd : null}
              onChange={(value) => {
                setFormData({ ...formData, unaided_ipd: value });
                autoSave("unaided_ipd", value);
              }}
            />
          </TableCell>
          <TableCell />
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(VisualAcuity);
