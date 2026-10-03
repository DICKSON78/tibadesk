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

const DentalFunctionalAssessment = (
  { consultation: { id, dental_functional_assessment, status } },
  ref
) => {
  const [formData, setFormData] = useState(dental_functional_assessment);

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (
      !dental_functional_assessment ||
      (dental_functional_assessment && value !== dental_functional_assessment[field])
    ) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, {
        what: "Dental Functional Test",
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
          <TableCell component="th">Maximum Mouth Opening</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.maximum_mouth_opening : null}
              onChange={(value) => {
                setFormData({ ...formData, maximum_mouth_opening: value });
                autoSave("maximum_mouth_opening", value);
              }}
              placeholder="e.g., Normal (>40mm) / Restricted (<35mm)"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Lateral Excursion - Right</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.lateral_excursion_right : null}
              onChange={(value) => {
                setFormData({ ...formData, lateral_excursion_right: value });
                autoSave("lateral_excursion_right", value);
              }}
              placeholder="e.g., Normal / Restricted / Deviated"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Lateral Excursion - Left</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.lateral_excursion_left : null}
              onChange={(value) => {
                setFormData({ ...formData, lateral_excursion_left: value });
                autoSave("lateral_excursion_left", value);
              }}
              placeholder="e.g., Normal / Restricted / Deviated"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Protrusion</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.protrusion : null}
              onChange={(value) => {
                setFormData({ ...formData, protrusion: value });
                autoSave("protrusion", value);
              }}
              placeholder="e.g., Normal / Restricted / Deviated"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Bite Force</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.bite_force : null}
              onChange={(value) => {
                setFormData({ ...formData, bite_force: value });
                autoSave("bite_force", value);
              }}
              placeholder="e.g., Strong / Normal / Weak"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Bite Classification</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.bite_classification : null}
              onChange={(value) => {
                setFormData({ ...formData, bite_classification: value });
                autoSave("bite_classification", value);
              }}
              placeholder="e.g., Class I / Class II / Class III"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Occlusal Relationship</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.occlusal_relationship : null}
              onChange={(value) => {
                setFormData({ ...formData, occlusal_relationship: value });
                autoSave("occlusal_relationship", value);
              }}
              placeholder="e.g., Normal / Malocclusion"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Cross Bite</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.cross_bite : null}
              onChange={(value) => {
                setFormData({ ...formData, cross_bite: value });
                autoSave("cross_bite", value);
              }}
              placeholder="e.g., None / Anterior / Posterior / Both"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Overjet</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.overjet : null}
              onChange={(value) => {
                setFormData({ ...formData, overjet: value });
                autoSave("overjet", value);
              }}
              placeholder="e.g., Normal (2-4mm) / Increased / Reduced"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Overbite</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.overbite : null}
              onChange={(value) => {
                setFormData({ ...formData, overbite: value });
                autoSave("overbite", value);
              }}
              placeholder="e.g., Normal (2-4mm) / Deep / Open"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Centric Relation</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.centric_relation : null}
              onChange={(value) => {
                setFormData({ ...formData, centric_relation: value });
                autoSave("centric_relation", value);
              }}
              placeholder="e.g., Normal / Displaced"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Centric Occlusion</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_functional_assessment ? dental_functional_assessment.centric_occlusion : null}
              onChange={(value) => {
                setFormData({ ...formData, centric_occlusion: value });
                autoSave("centric_occlusion", value);
              }}
              placeholder="e.g., Normal / Premature contact / Interference"
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(DentalFunctionalAssessment);
