import React, { forwardRef, useImperativeHandle, useState } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import MuiModal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/CloseRounded";

const Modal = (props, ref) => {
  const [state, setState] = useState({
    open: false,
    title: undefined,
    subtitle: undefined,
    component: null,
    size: "sm",
  });

  useImperativeHandle(ref, () => ({
    open: (title, component, size = "sm", subtitle = "") => {
      setState({
        ...state,
        open: true,
        title,
        subtitle,
        component,
        size,
      });
    },
    close: _close,
  }));

  const _close = () => {
    setState({
      ...state,
      open: false,
      title: undefined,
      subtitle: undefined,
      component: null,
    });
  };

  return (
    <MuiModal
      open={state.open}
      // onClose={_close}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        "& .MuiContainer-root > .MuiModalContent-root": {
          "& > .MuiCardContent-root": {
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
            px: { xs: 2, sm: 2, md: 4 },
          },
          "& > .MuiCardActions-root": {
            px: { xs: 2, sm: 2, md: 4 },
            pt: 2,
            pb: 3,
          },
        },
      }}
    >
      <Container
        component="div"
        maxWidth={state.size}
        sx={{ py: 2 }}
      >
        <Card className="MuiModalContent-root">
          <CardHeader
            title={state.title}
            subheader={state.subtitle}
            titleTypographyProps={{
              variant: "h5",
              fontWeight: 700,
            }}
            subheaderTypographyProps={{
              variant: "subtitle2",
            }}
            action={
              <Tooltip title="Close">
                <IconButton onClick={_close}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            }
            sx={{
              px: { xs: 2, sm: 2, md: 4 },
              pt: 3,
            }}
          />
          {state.component}
        </Card>
      </Container>
    </MuiModal>
  );
};

export default forwardRef(Modal);
