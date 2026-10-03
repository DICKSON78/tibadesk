import React from "react";
import { Avatar, Box, Card, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const InfoCard = ({ title, count, icon, color, ...rest }) => {
  const theme = useTheme();

  return (
    <Card
      {...(theme.palette.mode === "light" && {
        variant: "elevation",
        elevation: 0,
      })}
      {...(theme.palette.mode === "dark" && {
        variant: "outlined",
      })}
      {...rest}
      sx={{
        p: 3,
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(to bottom right, ${alpha(color, 0.8)}, ${alpha(color, 0.18)})`
            : theme.palette.background.paper,
        ...rest?.sx,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        spacing={2}
      >
        <Box flexGrow={1}>
          <Typography color="text.secondary">{title}</Typography>
          <Typography
            variant="h6"
            fontWeight="500"
            mt="4px"
          >
            {count}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: color,
            boxShadow: `0 7px 30px ${alpha(color, 0.15)}`,
            width: 40,
            height: 40,
            position: "relative",
            "&::before": {
              content: `""`,
              position: "absolute",
              width: "7px",
              height: "38px",
              borderBottomRightRadius: "11px",
              borderTopRightRadius: "6px",
              top: "10%",
              right: "30%",
              backgroundColor: "rgba(255, 255, 255, 0.135)",
              transform: "rotate(35deg)",
            },
            "&::after": {
              content: `""`,
              position: "absolute",
              width: "6px",
              height: "40px",
              borderTopLeftRadius: "5px",
              borderBottomLeftRadius: "3px",
              top: "-4%",
              right: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.135)",
              transform: "rotate(35deg)",
            },
          }}
        >
          {icon}
        </Avatar>
      </Stack>
    </Card>
  );
};

export default InfoCard;
