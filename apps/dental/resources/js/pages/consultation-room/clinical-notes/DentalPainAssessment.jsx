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
} from "../../../components/ui/index.jsx";
import TextField from "../../../components/TextField";
import usePatch from "../../../hooks/usePatch";

const DentalPainAssessment = (
  { consultation: { id, dental_pain_assessment, status } },
  ref
) => {
  const [formData, setFormData] = useState(dental_pain_assessment);

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (
      !dental_pain_assessment ||
      (dental_pain_assessment && value !== dental_pain_assessment[field])
    ) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, {
        what: "Pain Assessment",
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
        <TableRow sx={{ backgroundColor: '#E0F2F1' }}>
          <TableCell sx={{ fontWeight: 'bold' }}>Assessment</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Finding</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell component="th">Pain Level (0-10)</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.pain_level : null}
              onChange={(value) => {
                setFormData({ ...formData, pain_level: value });
                autoSave("pain_level", value);
              }}
              placeholder="0 = No pain, 10 = Worst pain"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Pain Location</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.pain_location : null}
              onChange={(value) => {
                setFormData({ ...formData, pain_location: value });
                autoSave("pain_location", value);
              }}
              placeholder="e.g., Upper right molar, Lower left quadrant"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Pain Type</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.pain_type : null}
              onChange={(value) => {
                setFormData({ ...formData, pain_type: value });
                autoSave("pain_type", value);
              }}
              placeholder="e.g., Sharp / Dull / Throbbing / Shooting / Burning"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Pain Duration</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.pain_duration : null}
              onChange={(value) => {
                setFormData({ ...formData, pain_duration: value });
                autoSave("pain_duration", value);
              }}
              placeholder="e.g., Continuous / Intermittent / Hours / Days / Weeks"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Pain Triggers</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.pain_triggers : null}
              onChange={(value) => {
                setFormData({ ...formData, pain_triggers: value });
                autoSave("pain_triggers", value);
              }}
              placeholder="e.g., Hot / Cold / Sweet / Biting / Spontaneous"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Pain Relieving Factors</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.pain_relieving_factors : null}
              onChange={(value) => {
                setFormData({ ...formData, pain_relieving_factors: value });
                autoSave("pain_relieving_factors", value);
              }}
              placeholder="e.g., Analgesics / Cold compress / None"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Pain Radiation</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.pain_radiation : null}
              onChange={(value) => {
                setFormData({ ...formData, pain_radiation: value });
                autoSave("pain_radiation", value);
              }}
              placeholder="e.g., To ear / To temple / To eye / No radiation"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Swelling Level</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.swelling_level : null}
              onChange={(value) => {
                setFormData({ ...formData, swelling_level: value });
                autoSave("swelling_level", value);
              }}
              placeholder="e.g., None / Mild / Moderate / Severe"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Swelling Location</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.swelling_location : null}
              onChange={(value) => {
                setFormData({ ...formData, swelling_location: value });
                autoSave("swelling_location", value);
              }}
              placeholder="e.g., Buccal / Lingual / Palatal / Floor of mouth"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Numbness Location</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.numbness_location : null}
              onChange={(value) => {
                setFormData({ ...formData, numbness_location: value });
                autoSave("numbness_location", value);
              }}
              placeholder="e.g., Lower lip / Tongue / Chin / None"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Numbness Severity</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_pain_assessment ? dental_pain_assessment.numbness_severity : null}
              onChange={(value) => {
                setFormData({ ...formData, numbness_severity: value });
                autoSave("numbness_severity", value);
              }}
              placeholder="e.g., Mild / Moderate / Severe / Complete"
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(DentalPainAssessment);
