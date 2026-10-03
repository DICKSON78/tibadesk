import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  IconButton,
  InputAdornment,
  LinearProgress,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowDropDownRounded as ArrowDropDownIcon,
  ChevronLeftRounded as ChevronLeftIcon,
  ChevronRightRounded as ChevronRightIcon,
  FirstPageRounded as FirstPageIcon,
  LastPageRounded as LastPageIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import TextField from "./TextField";

const NoItemsOverlayContainer = styled("div")(({ theme, height }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height,
  "& .ant-empty-img-1": {
    fill: theme.palette.mode === "light" ? "#aeb8c2" : "#262626",
  },
  "& .ant-empty-img-2": {
    fill: theme.palette.mode === "light" ? "#f5f5f7" : "#595959",
  },
  "& .ant-empty-img-3": {
    fill: theme.palette.mode === "light" ? "#dce0e6" : "#434343",
  },
  "& .ant-empty-img-4": {
    fill: theme.palette.mode === "light" ? "#fff" : "#1c1c1c",
  },
  "& .ant-empty-img-5": {
    fillOpacity: theme.palette.mode === "light" ? "0.8" : "0.08",
    fill: theme.palette.mode === "light" ? "#f5f5f5" : "#fff",
  },
}));

const NoItemsOverlay = ({ message, hideIcon }) => {
  return (
    <NoItemsOverlayContainer height={hideIcon ? 24 : 160}>
      {!hideIcon ? (
        <svg
          width="120"
          height="100"
          viewBox="0 0 184 152"
          focusable="false"
        >
          <g
            fill="none"
            fillRule="evenodd"
          >
            <g transform="translate(24 31.67)">
              <ellipse
                className="ant-empty-img-5"
                cx="67.797"
                cy="106.89"
                rx="67.797"
                ry="12.668"
              />
              <path
                className="ant-empty-img-1"
                d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
              />
              <path
                className="ant-empty-img-2"
                d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
              />
              <path
                className="ant-empty-img-3"
                d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
              />
            </g>
            <path
              className="ant-empty-img-3"
              d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
            />
            <g
              className="ant-empty-img-4"
              transform="translate(149.65 15.383)"
            >
              <ellipse
                cx="20.654"
                cy="3.167"
                rx="2.849"
                ry="2.815"
              />
              <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
            </g>
          </g>
        </svg>
      ) : null}
      <Typography
        mt={hideIcon ? 0 : 1}
        variant="body2"
        color="text.secondary"
      >
        {message || "No data available"}
      </Typography>
    </NoItemsOverlayContainer>
  );
};

const ColumnHeaderContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "8px",
  height: "100%",
}));

const ColumnHeaderTitleContainer = styled("div")(({ theme }) => ({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const SearchTextField = ({ label, placeholder, onChange, sx }) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      placeholder={placeholder || "Search"}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      inputProps={{ sx: { py: "8px" } }}
      sx={{ width: 144, ...sx }}
      onChange={onChange}
    />
  );
};

const TablePaginationActions = ({ count, page, rowsPerPage, onPageChange }) => {
  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={(event) => onPageChange(event, 0)}
        disabled={page === 0}
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={(event) => onPageChange(event, page - 1)}
        disabled={page === 0}
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        onClick={(event) => onPageChange(event, page + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
      >
        <ChevronRightIcon />
      </IconButton>
      <IconButton
        onClick={(event) =>
          onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
        }
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
      >
        <LastPageIcon />
      </IconButton>
    </Box>
  );
};

const Table = ({
  loading,
  columns,
  items,
  noItemsOverlayMessage,
  hideNoItemsOverlayIcon,
  initialState,
  itemCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hidePaginationFooter,
  checkboxSelection,
  checked,
  setChecked,
  footerItems,
  renderExpanded,
  repeatHead,
}) => {
  columns = columns.filter(
    (col) => typeof col.show === "undefined" || col.show
  );
  checked = checked || [];

  const [state, setState] = useState({
    items,
    ...initialState,
  });

  useEffect(() => {
    setState({ ...state, items });
  }, [items]);

  const getCheckableItems = () => {
    if (typeof checkboxSelection === "function") {
      return state.items.filter((item, index) =>
        checkboxSelection(item, index)
      );
    }

    return state.items;
  };

  const isItemCheckable = (item, index) => {
    if (typeof checkboxSelection === "function") {
      return checkboxSelection(item, index);
    }

    return true;
  };

  const renderTableHeadRow = () => {
    return (
      <TableRow>
        {checkboxSelection ? (
          <TableCell
            component="th"
            sx={{ width: 64 }}
          >
            <Checkbox
              checked={
                getCheckableItems().length > 0 &&
                checked.length === getCheckableItems().length
              }
              onChange={(event) => {
                const checked1 = event.target.checked
                  ? getCheckableItems()
                  : [];

                if (typeof setChecked === "function") {
                  setChecked(checked1);
                }
              }}
            />
          </TableCell>
        ) : null}
        {columns.map((col, index) => (
          <TableCell
            key={index}
            component="th"
            {...col.tableCellProps}
          >
            <ColumnHeaderContainer>
              <ColumnHeaderTitleContainer>
                {col.headerName}
              </ColumnHeaderTitleContainer>
            </ColumnHeaderContainer>
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <Box sx={{ width: '100%', overflowX: "auto" }}>
      <MuiTable {...(footerItems ? { className: "has-footer" } : null)} sx={{ width: '100%' }}>
        <TableHead>{renderTableHeadRow()}</TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (checkboxSelection ? 1 : 0)}
                sx={{ p: 0, borderBottom: "none" }}
              >
                <LinearProgress />
              </TableCell>
            </TableRow>
          ) : null}
          {state.items.length > 0 ? (
            <React.Fragment>
              {state.items.map((item, index, array) => (
                <React.Fragment key={index}>
                  <TableRow selected={checked.indexOf(item) !== -1}>
                    {checkboxSelection ? (
                      <TableCell>
                        <Checkbox
                          disabled={!isItemCheckable(item, index)}
                          checked={checked.indexOf(item) !== -1}
                          onChange={(event) => {
                            const checked1 = event.target.checked
                              ? [...checked, item]
                              : checked.filter(
                                  (e, i) => i !== checked.indexOf(item)
                                );

                            if (typeof setChecked === "function") {
                              setChecked(checked1);
                            }
                          }}
                        />
                      </TableCell>
                    ) : null}
                    {columns.map((col, colIndex) => (
                      <Tooltip
                        key={colIndex}
                        title={
                          typeof col.renderCell === "function"
                            ? undefined
                            : col.headerName
                        }
                      >
                        <TableCell {...col.tableCellProps}>
                          {typeof col.renderCell === "function"
                            ? col.renderCell(item, index, array)
                            : typeof col.valueGetter === "function"
                              ? col.valueGetter(item, index, array)
                              : item[col.field]}
                        </TableCell>
                      </Tooltip>
                    ))}
                  </TableRow>
                  {renderExpanded ? (
                    <TableRow
                      selected={checked.indexOf(item) !== -1}
                      className="expanded"
                    >
                      {checkboxSelection ? <TableCell /> : null}
                      <TableCell colSpan={columns.length}>
                        {renderExpanded(item, index, array)}
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {repeatHead && index < array.length - 1 ? (
                    <React.Fragment>{renderTableHeadRow()}</React.Fragment>
                  ) : null}
                </React.Fragment>
              ))}
            </React.Fragment>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (checkboxSelection ? 1 : 0)}>
                <NoItemsOverlay
                  message={noItemsOverlayMessage}
                  hideIcon={hideNoItemsOverlayIcon}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {footerItems ? (
          <TableFooter>
            {footerItems.map((itemColumns, index, array) => (
              <TableRow key={index}>
                {itemColumns.map((col, colIndex) => (
                  <TableCell
                    key={colIndex}
                    component="th"
                    {...col.tableCellProps}
                  >
                    {col.value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        ) : null}
      </MuiTable>
      {!hidePaginationFooter ? (
        <TablePagination
          component="div"
          count={itemCount}
          page={page - 1}
          onPageChange={(event, page1) => {
            if (typeof onPageChange === "function") {
              onPageChange(page1 + 1);
            }
          }}
          rowsPerPageOptions={[25, 50, 100, 250, 500, 1000]}
          rowsPerPage={pageSize || 25}
          onRowsPerPageChange={(event) => {
            if (typeof onPageSizeChange === "function") {
              onPageSizeChange(event.target.value);
            }
          }}
          slotProps={{
            select: {
              IconComponent: ArrowDropDownIcon,
              MenuProps: { PaperProps: { variant: "outlined-elevation" } },
            },
          }}
          ActionsComponent={TablePaginationActions}
        />
      ) : null}
    </Box>
  );
};

export { NoItemsOverlay, SearchTextField };
export default Table;
