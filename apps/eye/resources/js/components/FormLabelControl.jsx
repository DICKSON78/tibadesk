import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const FormLabelControl = ({ containerProps, label, required, children }) => {
  return (
    <Box
      component="div"
      {...containerProps}
    >
      {label ? (
        <Typography
          fontWeight={500}
          sx={{
            mx: 0.5,
            mb: 0.5,
          }}
        >
          {label}
          {required ? (
            <Box
              component="span"
              color="error.main"
              ml={0.25}
            >
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
};

export default FormLabelControl;
