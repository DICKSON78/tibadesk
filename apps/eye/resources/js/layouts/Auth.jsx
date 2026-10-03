import React from "react";
import { Outlet } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

// Use clinic logo from public folder for reliable serving
const publicLogoUrl = "/images/logo.png";

const Auth = () => {
  return (
    <Container
      component="main"
      maxWidth="xs"
    >
      <Box
        py={2}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="100vh"
      >
        <Card>
          <Box
            display="flex"
            justifyContent="center"
          >
            <Box
              component="img"
              src={publicLogoUrl}
              alt="Logo"
              sx={{
                height: 192,
                width: "auto",
              }}
            />
          </Box>
          <Outlet />
        </Card>
        <Card sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            p={2}
          >
            {"© "}
            {new Date().getFullYear()} TibaDesk
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default Auth;
