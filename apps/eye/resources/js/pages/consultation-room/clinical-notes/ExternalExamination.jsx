import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import TextField from "../../../components/TextField";
import usePatch from "../../../hooks/usePatch";

const ExternalExamination = (
  { consultation: { id, external_examination, status } },
  ref
) => {
  const reLidRef = useRef();
  const reScleraRef = useRef();
  const reCorneaRef = useRef();
  const reConjuctivaRef = useRef();
  const reIrisRef = useRef();
  const rePupilRef = useRef();
  const reLensRef = useRef();
  const reIopRef = useRef();
  const leLidRef = useRef();
  const leScleraRef = useRef();
  const leCorneaRef = useRef();
  const leConjuctivaRef = useRef();
  const leIrisRef = useRef();
  const lePupilRef = useRef();
  const leLensRef = useRef();
  const leIopRef = useRef();

  const [formData, setFormData] = useState(external_examination);

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (
      !external_examination ||
      (external_examination && value !== external_examination[field])
    ) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, {
        what: "External Examination",
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
    <Table sx={{ width: '100%' }}>
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>RE</TableCell>
          <TableCell>LE</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell component="th">LID</TableCell>
          <TableCell>
            <TextField
              ref={reLidRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.re_lid : null
              }
              onChange={(value) => {
                setFormData({ ...formData, re_lid: value });
                autoSave("re_lid", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leLidRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.le_lid : null
              }
              onChange={(value) => {
                setFormData({ ...formData, le_lid: value });
                autoSave("le_lid", value);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">SCRELA</TableCell>
          <TableCell>
            <TextField
              ref={reScleraRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.re_sclera : null
              }
              onChange={(value) => {
                setFormData({ ...formData, re_sclera: value });
                autoSave("re_sclera", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leScleraRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.le_sclera : null
              }
              onChange={(value) => {
                setFormData({ ...formData, le_sclera: value });
                autoSave("le_sclera", value);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">CORNEA</TableCell>
          <TableCell>
            <TextField
              ref={reCorneaRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.re_cornea : null
              }
              onChange={(value) => {
                setFormData({ ...formData, re_cornea: value });
                autoSave("re_cornea", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leCorneaRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.le_cornea : null
              }
              onChange={(value) => {
                setFormData({ ...formData, le_cornea: value });
                autoSave("le_cornea", value);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">CONJUCTIVA</TableCell>
          <TableCell>
            <TextField
              ref={reConjuctivaRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.re_conjuctiva : null
              }
              onChange={(value) => {
                setFormData({ ...formData, re_conjuctiva: value });
                autoSave("re_conjuctiva", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leConjuctivaRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.le_conjuctiva : null
              }
              onChange={(value) => {
                setFormData({ ...formData, le_conjuctiva: value });
                autoSave("le_conjuctiva", value);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">IRIS</TableCell>
          <TableCell>
            <TextField
              ref={reIrisRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.re_iris : null
              }
              onChange={(value) => {
                setFormData({ ...formData, re_iris: value });
                autoSave("re_iris", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leIrisRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.le_iris : null
              }
              onChange={(value) => {
                setFormData({ ...formData, le_iris: value });
                autoSave("le_iris", value);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">PUPIL</TableCell>
          <TableCell>
            <TextField
              ref={rePupilRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.re_pupil : null
              }
              onChange={(value) => {
                setFormData({ ...formData, re_pupil: value });
                autoSave("re_pupil", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={lePupilRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.le_pupil : null
              }
              onChange={(value) => {
                setFormData({ ...formData, le_pupil: value });
                autoSave("le_pupil", value);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">LENS</TableCell>
          <TableCell>
            <TextField
              ref={reLensRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.re_lens : null
              }
              onChange={(value) => {
                setFormData({ ...formData, re_lens: value });
                autoSave("re_lens", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leLensRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.le_lens : null
              }
              onChange={(value) => {
                setFormData({ ...formData, le_lens: value });
                autoSave("le_lens", value);
              }}
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">IOP</TableCell>
          <TableCell>
            <TextField
              ref={reIopRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.re_iop : null
              }
              onChange={(value) => {
                setFormData({ ...formData, re_iop: value });
                autoSave("re_iop", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leIopRef}
              fullWidth
              defaultValue={
                external_examination ? external_examination.le_iop : null
              }
              onChange={(value) => {
                setFormData({ ...formData, le_iop: value });
                autoSave("le_iop", value);
              }}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(ExternalExamination);
