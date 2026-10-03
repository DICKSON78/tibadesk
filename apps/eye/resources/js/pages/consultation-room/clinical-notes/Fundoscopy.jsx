import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "../../../components/TextField";
import usePatch from "../../../hooks/usePatch";

const Fundoscopy = ({ consultation: { id, status, fundoscopy } }, ref) => {
  const reRef = useRef();
  const leRef = useRef();

  const [formData, setFormData] = useState(fundoscopy);

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (!fundoscopy || (fundoscopy && value !== fundoscopy[field])) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, {
        what: "Fundoscopy",
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
    <Table className="no-table-head" sx={{ width: '100%' }}>
      <TableBody>
        <TableRow>
          <TableCell component="th">RE</TableCell>
          <TableCell component="th">LE</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <TextField
              ref={reRef}
              fullWidth
              defaultValue={fundoscopy ? fundoscopy.re : null}
              onChange={(value) => {
                setFormData({ ...formData, re: value });
                autoSave("re", value);
              }}
            />
          </TableCell>
          <TableCell>
            <TextField
              ref={leRef}
              fullWidth
              defaultValue={fundoscopy ? fundoscopy.le : null}
              onChange={(value) => {
                setFormData({ ...formData, le: value });
                autoSave("le", value);
              }}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(Fundoscopy);
