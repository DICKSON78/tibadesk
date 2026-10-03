import React from "react";
import { Avatar, Box, Card, Grid, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const InfoCard = ({ title, count, icon, color, onClick, ...rest }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Grid
      md={3}
      sm={12}
      xs={12}
      {...rest}
    >
      <Card
        {...(theme.palette.mode === "light" && {
          variant: "elevation",
          elevation: 0,
        })}
        onClick={handleClick}
        sx={{
          p: 3,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${alpha(color, 0.25)}`,
          } : {},
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(to bottom right, ${alpha(color, 0.8)}, ${alpha(color, 0.18)})`
              : theme.palette.background.paper,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          spacing={2}
        >
          <Box flexGrow={1}>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography
              variant="body1"
              fontWeight="600"
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
    </Grid>
  );
};

export default InfoCard;
