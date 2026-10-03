import React from "react";
import {
  Avatar,
  Box,
  Button,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { QuestionMarkRounded as QuestionMarkIcon } from "@mui/icons-material";

const ConfirmationDialog = ({ message, onCancel, onOk }) => {
  return (
    <React.Fragment>
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <Avatar>
            <QuestionMarkIcon />
          </Avatar>
          <Typography>{message}</Typography>
        </Stack>
      </CardContent>
      <CardActions>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          size="large"
          color="secondary"
          sx={{ mr: 1 }}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={onOk}
        >
          Yes
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default ConfirmationDialog;
