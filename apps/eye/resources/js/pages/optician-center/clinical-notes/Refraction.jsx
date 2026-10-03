import React, { forwardRef, useImperativeHandle } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const RefractionDetails = ({ consultation: { refraction } }, ref) => {
  useImperativeHandle(ref, () => ({
    validate: () => {
      return true;
    },
  }));

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell colSpan={8}>Subjective Refraction</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={4}>RE</TableCell>
          <TableCell colSpan={4}>LE</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell component="th">SPH</TableCell>
          <TableCell component="th">CYL</TableCell>
          <TableCell component="th">AXIS</TableCell>
          <TableCell component="th">VA</TableCell>
          <TableCell component="th">SPH</TableCell>
          <TableCell component="th">CYL</TableCell>
          <TableCell component="th">AXIS</TableCell>
          <TableCell component="th">VA</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{refraction ? refraction.sub_re_sph : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_re_cyl : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_re_axis : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_re_va : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_sph : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_cyl : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_axis : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_va : null}</TableCell>
        </TableRow>

        <TableRow>
          <TableCell component="th">ADD</TableCell>
          <TableCell component="th">VA</TableCell>
          <TableCell component="th" />
          <TableCell component="th" />
          <TableCell component="th">ADD</TableCell>
          <TableCell component="th">VA</TableCell>
          <TableCell component="th" />
          <TableCell component="th" />
        </TableRow>
        <TableRow>
          <TableCell>{refraction ? refraction.sub_re_add : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_re_add_va : null}</TableCell>
          <TableCell />
          <TableCell />
          <TableCell>{refraction ? refraction.sub_le_add : null}</TableCell>
          <TableCell>{refraction ? refraction.sub_le_add_va : null}</TableCell>
          <TableCell />
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default forwardRef(RefractionDetails);
