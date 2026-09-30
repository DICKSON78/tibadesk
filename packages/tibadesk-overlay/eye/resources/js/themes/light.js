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
    mode: "light",
    primary: {
      main: "#2d4ea8",
      contrastText: "#fff",
    },
    secondary: {
      main: "#010736",
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
      main: grey[500],
      contrastText: "#fff",
    },
    purple: {
      main: purple[400],
      contrastText: "#fff",
    },
    text: {
      secondary: "rgba(0, 0, 0, 0.58)",
    },
    background: {
      default: "#eeeef1",
      paper: "#fff",
    },
    divider: "#eeeef1",
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: '0 8px 24px 0 rgba(1, 7, 54, 0.24)',
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
        elevation1: {
          boxShadow: '0px 8px 24px 0px rgba(1, 7, 54, 0.08)',
        },
      },
      variants: [
        {
          props: { variant: "outlined-elevation" },
          style: {
            boxShadow: '0px 8px 24px 0px rgba(1, 7, 54, 0.08)',
            border: "1px solid #eeeef1",
          },
        },
      ],
      defaultProps: {
        variant: "outlined-elevation",
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
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
      defaultProps: {
        disableElevation: true,
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
            borderRadius: "6px 0 0 6px",
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
          border: "1px solid #eeeef1",
          borderBottomWidth: 0,
          borderRadius: "6px 6px 0 0",
          marginRight: "8px",
          backgroundColor: "#fff",
          minHeight: "auto",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(240, 243, 247, 0.24)",
          "&:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#eeeef1 !important",
            },
          "&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#c9c9d0 !important",
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
                backgroundColor: "#f1f3f4",
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
          border: "1px solid #eeeef1",
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
          backgroundColor: "#f1f3f4",
        },
        footer: {
          padding: "12px",
          backgroundColor: "#f1f3f4",
          fontSize: "0.75rem",
          fontWeight: 700,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.expanded": {
            backgroundColor: alpha(lightBlue[600], 0.18),
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
              backgroundColor: "#f1f3f4",
            },
            "& > th": {
              padding: "12px",
              backgroundColor: "#f1f3f4",
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
        slotProps: {
          paper: { variant: "outlined-elevation" },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
        slotProps: {
          paper: { variant: "outlined-elevation" },
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
