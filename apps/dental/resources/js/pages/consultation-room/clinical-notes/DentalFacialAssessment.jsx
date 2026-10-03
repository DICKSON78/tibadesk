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

const DentalFacialAssessment = (
  { consultation: { id, dental_facial_assessment, status } },
  ref
) => {
  const [formData, setFormData] = useState(dental_facial_assessment);

  const { handlePatch: handleAutoSave } = usePatch();

  const autoSave = (field, value) => {
    if (
      !dental_facial_assessment ||
      (dental_facial_assessment && value !== dental_facial_assessment[field])
    ) {
      handleAutoSave(`api/consultations/${id}/auto-save-clinical-notes`, {
        what: "Facial Assessment",
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
          <TableCell component="th">Facial Symmetry</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.facial_symmetry : null}
              onChange={(value) => {
                setFormData({ ...formData, facial_symmetry: value });
                autoSave("facial_symmetry", value);
              }}
              placeholder="e.g., Symmetrical / Asymmetrical"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Facial Swelling</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.facial_swelling : null}
              onChange={(value) => {
                setFormData({ ...formData, facial_swelling: value });
                autoSave("facial_swelling", value);
              }}
              placeholder="e.g., None / Mild / Moderate / Severe"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Facial Trauma</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.facial_trauma : null}
              onChange={(value) => {
                setFormData({ ...formData, facial_trauma: value });
                autoSave("facial_trauma", value);
              }}
              placeholder="e.g., None / Fracture / Soft tissue injury"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Right TMJ - Tenderness</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.right_tmj_tenderness : null}
              onChange={(value) => {
                setFormData({ ...formData, right_tmj_tenderness: value });
                autoSave("right_tmj_tenderness", value);
              }}
              placeholder="e.g., None / Mild / Moderate / Severe"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Right TMJ - Clicking</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.right_tmj_clicking : null}
              onChange={(value) => {
                setFormData({ ...formData, right_tmj_clicking: value });
                autoSave("right_tmj_clicking", value);
              }}
              placeholder="e.g., Yes / No"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Right TMJ - Pain on Opening</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.right_tmj_pain_on_opening : null}
              onChange={(value) => {
                setFormData({ ...formData, right_tmj_pain_on_opening: value });
                autoSave("right_tmj_pain_on_opening", value);
              }}
              placeholder="e.g., Yes / No"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Left TMJ - Tenderness</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.left_tmj_tenderness : null}
              onChange={(value) => {
                setFormData({ ...formData, left_tmj_tenderness: value });
                autoSave("left_tmj_tenderness", value);
              }}
              placeholder="e.g., None / Mild / Moderate / Severe"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Left TMJ - Clicking</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.left_tmj_clicking : null}
              onChange={(value) => {
                setFormData({ ...formData, left_tmj_clicking: value });
                autoSave("left_tmj_clicking", value);
              }}
              placeholder="e.g., Yes / No"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Left TMJ - Pain on Opening</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.left_tmj_pain_on_opening : null}
              onChange={(value) => {
                setFormData({ ...formData, left_tmj_pain_on_opening: value });
                autoSave("left_tmj_pain_on_opening", value);
              }}
              placeholder="e.g., Yes / No"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Submandibular Lymph Nodes</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.submandibular_lymph_nodes : null}
              onChange={(value) => {
                setFormData({ ...formData, submandibular_lymph_nodes: value });
                autoSave("submandibular_lymph_nodes", value);
              }}
              placeholder="e.g., Not palpable / Palpable / Tender"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Cervical Lymph Nodes</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.cervical_lymph_nodes : null}
              onChange={(value) => {
                setFormData({ ...formData, cervical_lymph_nodes: value });
                autoSave("cervical_lymph_nodes", value);
              }}
              placeholder="e.g., Not palpable / Palpable / Tender"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Pre-auricular Lymph Nodes</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.pre_auricular_lymph_nodes : null}
              onChange={(value) => {
                setFormData({ ...formData, pre_auricular_lymph_nodes: value });
                autoSave("pre_auricular_lymph_nodes", value);
              }}
              placeholder="e.g., Not palpable / Palpable / Tender"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Lip Competence</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.lip_competence : null}
              onChange={(value) => {
                setFormData({ ...formData, lip_competence: value });
                autoSave("lip_competence", value);
              }}
              placeholder="e.g., Competent / Incompetent"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Lip Dryness</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.lip_dryness : null}
              onChange={(value) => {
                setFormData({ ...formData, lip_dryness: value });
                autoSave("lip_dryness", value);
              }}
              placeholder="e.g., None / Mild / Moderate / Severe"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Lip Lesions</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.lip_lesions : null}
              onChange={(value) => {
                setFormData({ ...formData, lip_lesions: value });
                autoSave("lip_lesions", value);
              }}
              placeholder="e.g., None / Ulcer / Herpes / Other"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Palate Shape</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.palate_shape : null}
              onChange={(value) => {
                setFormData({ ...formData, palate_shape: value });
                autoSave("palate_shape", value);
              }}
              placeholder="e.g., Normal / High arched / Cleft"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Palate Lesions</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.palate_lesions : null}
              onChange={(value) => {
                setFormData({ ...formData, palate_lesions: value });
                autoSave("palate_lesions", value);
              }}
              placeholder="e.g., None / Torus / Tumor / Ulcer"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Hard Palate</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.hard_palate : null}
              onChange={(value) => {
                setFormData({ ...formData, hard_palate: value });
                autoSave("hard_palate", value);
              }}
              placeholder="e.g., Normal / Abnormal"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell component="th">Soft Palate</TableCell>
          <TableCell>
            <TextField
              fullWidth
              defaultValue={dental_facial_assessment ? dental_facial_assessment.soft_palate : null}
              onChange={(value) => {
                setFormData({ ...formData, soft_palate: value });
                autoSave("soft_palate", value);
              }}
              placeholder="e.g., Normal / Deviated / Cleft"
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(DentalFacialAssessment);
