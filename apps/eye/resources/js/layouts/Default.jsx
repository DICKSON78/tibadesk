import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import {
  AppBar,
  Avatar,
  Box,
  CardHeader,
  Chip,
  Divider,
  Drawer,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuList,
  Modal as MuiModal,
  Popover,
  Stack,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  DarkModeRounded as DarkModeIcon,
  ExpandMoreRounded as ChevronDownIcon,
  LightModeOutlined as LightModeIcon,
  LockRounded as LockIcon,
  LogoutRounded as LogoutIcon,
  MoreVert as MoreIcon,
  Person2Rounded as UserIcon,
} from "@mui/icons-material";
import MenuIcon from "../components/icons/Menu";

import darkTheme from "../themes/dark";
import Menu from "../components/Menu";
import Modal from "../components/Modal";
import ChangePassword from "../pages/auth/ChangePassword";
import loader from "../../images/loader.svg";

import useFetch from "../hooks/useFetch";
import { useFilterContext } from "../contexts/FilterContext";

import { numberFormat } from "../helpers";
import { clearToken } from '../lib/session';

const drawerWidth = 272;

const drawerOpenedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const drawerClosedMixin = (theme) => ({
  width: 0,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  whiteSpace: "nowrap",
});

const ADMIN_PREFIXES = [
  "/dashboard", "/patient-records", "/reception", "/payment-center",
  "/consultation-room", "/optician-center", "/medicine-center",
  "/dispensing", "/procedure-room", "/other-dispensing",
  "/inventory-management", "/marketing", "/financial-management",
  "/user-management", "/settings",
];

const DefaultInner = ({ setThemeMode, setUser, smsBalance }) => {
  const notificationsTimer = useRef();
  const modalRef = useRef();
  const navigate = useNavigate();
  const theme = useTheme();
  const breakpointDownMedium = useMediaQuery(theme.breakpoints.down("md"));
  const { currentFilter } = useFilterContext();
  const breakpointUpMedium = useMediaQuery(theme.breakpoints.up("md"));

  const { data: user, loading, error } = useFetch(
    "/api/auth/user",
    null,
    true,
    null,
    (response) => response.data.data
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [splashLoading, setSplashLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashLoading(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationsTimer.current) {
        window.clearInterval(notificationsTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      window.user = user;
      setUser(user);
      try {
        if (window.notificationEvents && typeof window.notificationEvents.refresh === 'function') {
          window.notificationEvents.refresh();
        }
      } catch (e) {}
    }
  }, [user, setUser]);

  useEffect(() => {
    if (error && !loading) {
      navigate("/login");
    }
  }, [error, loading, navigate]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleTheme = () => {
    const themeMode = theme.palette.mode === "light" ? "dark" : "light";
    window.localStorage.removeItem("theme_mode");
    window.localStorage.setItem("theme_mode", themeMode);
    setThemeMode(themeMode);
  };

  const handleAccountMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsAccountMenuOpen(true);
  };

  const handleAccountMenuClose = () => {
    setIsAccountMenuOpen(false);
    setAnchorEl(null);
  };

  const openChangePasswordModal = () => {
    let component = <ChangePassword modal={modalRef.current} />;

    modalRef.current.open("Change Password", component);
  };

  const handleLogout = () => {
    // This application's token only. The applications TibaDesk mounts
    // alongside this one share the origin and therefore this localStorage, so
    // clearing all of it would sign the user out of dental and pharmacy as a
    // side effect of logging out of eye.
    clearToken();
    navigate("/login");
  };

  return (
    <React.Fragment>
      {user ? (
        <React.Fragment>
          <ThemeProvider theme={darkTheme}>
            <AppBar
              position="fixed"
              variant="elevation"
              elevation={1}
              sx={{
                zIndex: theme.zIndex.drawer + 1,
                bgcolor:
                  theme.palette.mode === "light" ? "#ffffff" : "background.paper",
                boxShadow: "none",
                borderBottom:
                  theme.palette.mode === "light"
                    ? "1px solid #eeeef1"
                    : "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <Toolbar>
                <Tooltip title="Toggle menu">
                  <IconButton
                    edge="start"
                    color="inherit"
                    onClick={toggleDrawer}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>

                <Box
                  component="img"
                  src="/images/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  ml={2}
                />

                <Typography
                  variant="h5"
                  fontWeight="bold"
                  ml={1}
                >
                  EYE
                  <Typography
                    component="span"
                    color="secondary"
                    variant="h5"
                    fontWeight="bold"
                  >
                    CARE
                  </Typography>
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Tooltip
                  title={
                    theme.palette.mode === "light"
                      ? "Enable dark mode"
                      : "Disable dark mode"
                  }
                >
                  <IconButton
                    color="inherit"
                    sx={{ mr: { xs: 2, sm: 2, md: 1 } }}
                    onClick={toggleTheme}
                  >
                    {theme.palette.mode === "light" ? (
                      <DarkModeIcon />
                    ) : (
                      <LightModeIcon />
                    )}
                  </IconButton>
                </Tooltip>

                {user.privileges.dashboard &&
                location.pathname.indexOf("/dashboard") === 0 ? (
                  <Chip
                    variant="outlined"
                    sx={{ mr: { xs: 1, sm: 1, md: 2 } }}
                    color="primary"
                    label={
                      <Typography
                        variant="body2"
                        color="primary.contrastText"
                      >
                        {`SMS Balance: ${numberFormat(smsBalance)}`}
                      </Typography>
                    }
                  />
                ) : null}

                <Chip
                  variant="outlined"
                  sx={{
                    display: { xs: "none", sm: "none", md: "inline-flex" },
                  }}
                  color="primary"
                  avatar={
                    <Avatar>
                      <UserIcon fontSize="small" />
                    </Avatar>
                  }
                  label={
                    <Stack
                      direction="row"
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        color="primary.contrastText"
                      >
                        {user.full_name}
                      </Typography>
                      <ChevronDownIcon sx={{ ml: 0.5 }} />
                    </Stack>
                  }
                  onClick={handleAccountMenuOpen}
                />

                <IconButton
                  color="inherit"
                  sx={{
                    display: {
                      xs: "inline-flex",
                      sm: "inline-flex",
                      md: "none",
                    },
                  }}
                  onClick={handleAccountMenuOpen}
                >
                  <MoreIcon />
                </IconButton>
              </Toolbar>
              <Divider />
            </AppBar>
          </ThemeProvider>

          {/* Drawer for small screens */}
          {breakpointDownMedium ? (
            <Drawer
              container={() => window.document.body}
              variant="temporary"
              open={isDrawerOpen}
              ModalProps={{
                keepMounted: true,
                disableScrollLock: true,
              }}
              sx={{
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                },
              }}
              onClose={toggleDrawer}
            >
              <Toolbar />
              <Menu
                drawerOpen={isDrawerOpen}
                setDrawerOpen={setIsDrawerOpen}
                user={user}
              />
            </Drawer>
          ) : null}
          {/*****/}

          <Box sx={{ display: "flex" }}>
            {/* Drawer for large screens */}
            {breakpointUpMedium ? (
              <Drawer
                variant="permanent"
                ModalProps={{ disableScrollLock: true }}
                sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  ...(isDrawerOpen && {
                    ...drawerOpenedMixin(theme),
                    "& .MuiDrawer-paper": drawerOpenedMixin(theme),
                  }),
                  ...(!isDrawerOpen && {
                    ...drawerClosedMixin(theme),
                    "& .MuiDrawer-paper": drawerClosedMixin(theme),
                  }),
                }}
              >
                <Toolbar />
                <Menu
                  drawerOpen={isDrawerOpen}
                  user={user}
                />
              </Drawer>
            ) : null}
            {/*****/}

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                minHeight: "100vh",
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ minHeight: { xs: 56, sm: 64 } }} />
              <Box flexGrow={1}>
                <Outlet />
              </Box>
            </Box>
          </Box>

          <Popover
            anchorEl={anchorEl}
            open={isAccountMenuOpen}
            onClose={handleAccountMenuClose}
          >
            <CardHeader
              title={user.full_name}
              subheader={user.job_title?.name}
              titleTypographyProps={{
                variant: "subtitle1",
                fontWeight: "500",
              }}
              avatar={
                <Avatar>
                  <UserIcon />
                </Avatar>
              }
            />
            <Divider />
            <MenuList dense>
              <ListItem disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={() => {
                    handleAccountMenuClose();
                    openChangePasswordModal();
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LockIcon />
                  </ListItemIcon>
                  <ListItemText>Change Password</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={() => {
                    handleAccountMenuClose();
                    handleLogout();
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </ListItemButton>
              </ListItem>
            </MenuList>
          </Popover>
        </React.Fragment>
      ) : null}

      <Modal ref={modalRef} />
      <MuiModal
        open={loading || (splashLoading && location.pathname !== '/dashboard')}
        hideBackdrop
        disableAutoFocus
        disableEnforceFocus
        sx={{ pointerEvents: 'none' }}
      >
        <Box
          display="flex"
          flexDirection="column"
          height="100vh"
          alignItems="center"
          justifyContent="center"
          sx={{ pointerEvents: "none", bgcolor: "rgba(0,0,0,0.1)" }}
        >
          <Box
            component="img"
            src="/images/logo.png"
            alt="Logo"
            width={128}
            height="auto"
            sx={{ pointerEvents: "none", mb: 3 }}
          />
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            gutterBottom
            sx={{ textShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}
          >
            Loading New Kayoka
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ opacity: 0.8 }}
          >
            Please wait while we prepare your experience
          </Typography>
        </Box>
      </MuiModal>
    </React.Fragment>
  );
};

const Default = ({ setThemeMode, setUser, smsBalance }) => {
  const location = useLocation();
  const isAdminPath = ADMIN_PREFIXES.some(p => location.pathname === p || location.pathname.startsWith(p + "/"));
  if (!isAdminPath) return null;
  return <DefaultInner setThemeMode={setThemeMode} setUser={setUser} smsBalance={smsBalance} />;
};

export default Default;
