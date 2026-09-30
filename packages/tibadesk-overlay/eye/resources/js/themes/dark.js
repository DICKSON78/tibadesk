import { alpha, createTheme } from "@mui/material/styles";
import {
  amber,
  green,
  grey,
  lightBlue,
  purple,
  red,
} from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6e88d9",
      contrastText: "#fff",
    },
    secondary: {
      main: "#9db0e8",
      contrastText: "#fff",
    },
    info: {
      main: lightBlue[600],
      contrastText: "#fff",
    },
    success: {
      main: green[600],
      contrastText: "#fff",
    },
    warning: {
      main: amber[600],
      contrastText: "#fff",
    },
    error: {
      main: red[600],
      contrastText: "#fff",
    },
    neutral: {
      main: grey[600],
      contrastText: "#fff",
    },
    purple: {
      main: purple[400],
      contrastText: "#fff",
    },
    background: {
      default: "#20222c",
      paper: "#20222c",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    h4: {
      fontSize: 18,
    },
    h5: {
      fontSize: 16.2,
    },
    h6: {
      fontSize: 14.4,
    },
    subtitle1: {
      fontSize: 12.6,
    },
    subtitle2: {
      fontSize: 11.7,
    },
    body1: {
      fontSize: 11.7,
    },
    body2: {
      fontSize: 10.8,
    },
    button: {
      fontSize: 10.8,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#20222c",
          boxShadow: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: "0 8px 24px 0 rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        regular: {
          height: 64,
          minHeight: 64,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "linear-gradient(180deg, #0e1743 0%, #010736 55%, #01052b 100%)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.15)",
        },
      },
      variants: [
        {
          props: { variant: "outlined-elevation" },
          style: {
            boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 255, 255, 0.08)",
          "&:not(.MuiModalContent-root) > .MuiCardHeader-root + .MuiCardContent-root":
            {
              paddingTop: 0,
            },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          "&.no-action-margin .MuiCardHeader-action": {
            marginRight: 0,
          },
        },
      },
      defaultProps: {
        titleTypographyProps: {
          variant: "subtitle1",
          fontWeight: 700,
          color: "text.secondary",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          "&:last-child": {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiAlert: {
      defaultProps: {
        variant: "filled",
      },
    },
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          fontSize: "0.75rem",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          whiteSpace: "nowrap",
        },
        contained: {
          textTransform: "none",
        },
        outlined: {
          textTransform: "none",
        },
        sizeSmall: {
          fontSize: "0.7rem",
        },
        sizeLarge: {
          fontSize: "0.8rem",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: "auto",
        },
        flexContainerVertical: {
          "& > .MuiTab-root": {
            borderBottomWidth: 1,
            borderRadius: "5px 0 0 5px",
            marginBottom: "8px",

            "&:last-child": {
              marginBottom: 0,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottomWidth: 0,
          borderRadius: "5px 5px 0 0",
          marginRight: "8px",
          backgroundColor: "#20222c",
          minHeight: "auto",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "rgba(255, 255, 255, 0.08) !important",
            },
          "&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "rgba(255, 255, 255, 0.25) !important",
            },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: "4px",
          marginRight: "4px",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: 0,
          "&:not(.no-hover-highlight) > .MuiTableBody-root > .MuiTableRow-root":
            {
              "&:hover > .MuiTableCell-root": {
                backgroundColor: "#rgba(255, 255, 255, 0.075)",
              },
            },
          "&.no-table-head > .MuiTableBody-root > .MuiTableRow-root:first-of-type > .MuiTableCell-root":
            {
              "&:first-of-type": {
                borderTopLeftRadius: 6,
              },
              "&:last-child": {
                borderTopRightRadius: 6,
              },
            },
          "&.has-footer > .MuiTableBody-root > .MuiTableRow-root:last-child > .MuiTableCell-root":
            {
              borderBottomWidth: 1,
              "&:first-of-type": {
                borderBottomLeftRadius: 0,
              },
              "&:last-child": {
                borderBottomRightRadius: 0,
              },
            },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "8px 12px",
          "&:not(:last-child)": {
            borderRightWidth: 0,
            borderBottomWidth: 0,
          },
          "&:last-child": {
            borderBottomWidth: 0,
          },
        },
        head: {
          padding: "12px",
          backgroundColor: "#20222c",
        },
        footer: {
          padding: "12px",
          backgroundColor: "#20222c",
          fontSize: "0.75rem",
          fontWeight: 700,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.expanded": {
            backgroundColor: alpha(lightBlue[600], 0.08),
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& > .MuiTableRow-root:first-of-type > .MuiTableCell-root": {
            "&:first-of-type": {
              borderTopLeftRadius: 6,
            },
            "&:last-child": {
              borderTopRightRadius: 6,
            },
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& > .MuiTableRow-root": {
            "&:hover": {
              backgroundColor: "#292b38",
            },
            "& > th": {
              padding: "12px",
              backgroundColor: "#20222c",
              fontWeight: 500,
            },
            "&:last-child > .MuiTableCell-root": {
              borderBottomWidth: 1,
              "&:first-of-type": {
                borderBottomLeftRadius: 6,

                "& + .MuiTableCell-root": {
                  borderBottomLeftRadius: 0,
                },
              },
              "&:last-child": {
                borderBottomRightRadius: 6,
              },
            },
          },
        },
      },
    },
    MuiTableFooter: {
      styleOverrides: {
        root: {
          "& > .MuiTableRow-root": {
            "&:first-of-type > .MuiTableCell-root": {
              borderTopWidth: 0,
            },
            "&:last-child": {
              "& > .MuiTableCell-root": {
                borderBottomWidth: 1,
              },
              "& > .MuiTableCell-root:first-of-type": {
                borderBottomLeftRadius: 6,
              },
              "& > .MuiTableCell-root:last-child": {
                borderBottomRightRadius: 6,
              },
            },
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
    MuiPopover: {
      defaultProps: {
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          verticalAlign: "bottom",
          fontSize: "1.25rem",
        },
        fontSizeSmall: {
          fontSize: "1.05rem",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          cursor: "pointer",
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
