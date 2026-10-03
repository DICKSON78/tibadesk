import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

const NoItemsOverlay = ({ message, hideIcon }) => (
  <div className="empty-state">
    {!hideIcon ? (
      <div className="empty-state-icon">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="w-7 h-7 text-mist-400"
        />
      </div>
    ) : null}
    <p className={`text-sm text-mist-500 ${hideIcon ? "mt-0" : "mt-0"}`}>
      {message || "No data available"}
    </p>
  </div>
);

const SearchTextField = ({ label, placeholder, onChange, sx, ...rest }) => {
  const [term, setTerm] = useState("");

  const handleChange = (event) => {
    setTerm(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className={`flex items-center gap-2 bg-mist-100 rounded-lg px-3 py-2 ${sx || ""}`}>
      <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 text-mist-400" />
      <input
        type="text"
        value={term}
        onChange={handleChange}
        placeholder={placeholder || label || "Search"}
        aria-label={label || placeholder || "Search"}
        className="bg-transparent text-sm text-navy-900 placeholder-mist-400 outline-none w-full"
        {...rest}
      />
    </div>
  );
};

const TablePaginationActions = ({ count, page, pageSize, onPageChange }) => {
  const lastPage = Math.max(1, Math.ceil((count || 0) / (pageSize || 25)));
  const currentPage = page || 1;

  const go = (next) => {
    const clamped = Math.min(Math.max(next, 1), lastPage);
    if (clamped !== currentPage) {
      onPageChange(clamped);
    }
  };

  const btn =
    "w-8 h-8 rounded-lg flex items-center justify-center text-mist-500 transition-all duration-200 hover:bg-mist-100 hover:text-navy-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent";

  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => go(1)} disabled={currentPage === 1} className={btn} aria-label="First page">
        <FontAwesomeIcon icon={faAnglesLeft} className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => go(currentPage - 1)} disabled={currentPage === 1} className={btn} aria-label="Previous page">
        <FontAwesomeIcon icon={faAngleLeft} className="w-3.5 h-3.5" />
      </button>
      <span className="px-2 text-sm text-mist-500">
        Page {currentPage} of {lastPage}
      </span>
      <button type="button" onClick={() => go(currentPage + 1)} disabled={currentPage >= lastPage} className={btn} aria-label="Next page">
        <FontAwesomeIcon icon={faAngleRight} className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => go(lastPage)} disabled={currentPage >= lastPage} className={btn} aria-label="Last page">
        <FontAwesomeIcon icon={faAnglesRight} className="w-3.5 h-3.5" />
      </button>
    </div>
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
  const visibleColumns = columns.filter(
    (col) => typeof col.show === "undefined" || col.show
  );
  const selected = checked || [];

  const [state, setState] = useState({ items, ...initialState });
  const [localPage, setLocalPage] = useState(page);
  const [localPageSize, setLocalPageSize] = useState(pageSize || 25);

  useEffect(() => {
    setState((prev) => ({ ...prev, items }));
  }, [items]);

  useEffect(() => {
    setLocalPage(page);
  }, [page]);

  useEffect(() => {
    setLocalPageSize(pageSize || 25);
  }, [pageSize]);

  const isItemCheckable = (item, index) =>
    typeof checkboxSelection === "function"
      ? checkboxSelection(item, index)
      : true;

  const getCheckableItems = () =>
    state.items.filter((item, index) => isItemCheckable(item, index));

  const renderHeadRow = () => (
    <tr>
      {checkboxSelection ? (
        <th className="w-10 px-4 py-3">
          <input
            type="checkbox"
            aria-label="Select all rows"
            checked={
              getCheckableItems().length > 0 &&
              selected.length === getCheckableItems().length
            }
            onChange={(event) => {
              if (typeof setChecked === "function") {
                setChecked(event.target.checked ? getCheckableItems() : []);
              }
            }}
            className="rounded border-mist-300 text-azure-600 focus:ring-azure-500"
          />
        </th>
      ) : null}
      {visibleColumns.map((col, index) => (
        <th key={index} style={col.tableCellProps?.style}>
          <div className="flex items-center gap-1">
            {col.headerName}
          </div>
        </th>
      ))}
    </tr>
  );

  const colSpan = visibleColumns.length + (checkboxSelection ? 1 : 0);

  return (
    <div className="re-table-wrap">
      <div className="relative overflow-x-auto">
        {loading ? (
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden">
            <div className="h-full w-1/3 animate-pulse bg-azure-600" />
          </div>
        ) : null}

        <table className="re-table">
          <thead>{renderHeadRow()}</thead>
          <tbody>
            {state.items.length > 0 ? (
              <>
                {state.items.map((item, index, array) => (
                  <React.Fragment key={index}>
                    <tr
                      className={
                        selected.indexOf(item) !== -1 ? "bg-azure-50" : undefined
                      }
                    >
                      {checkboxSelection ? (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label="Select row"
                            disabled={!isItemCheckable(item, index)}
                            checked={selected.indexOf(item) !== -1}
                            onChange={(event) => {
                              if (typeof setChecked === "function") {
                                setChecked(
                                  event.target.checked
                                    ? [...selected, item]
                                    : selected.filter((_, i) => i !== index)
                                );
                              }
                            }}
                            className="rounded border-mist-300 text-azure-600 focus:ring-azure-500"
                          />
                        </td>
                      ) : null}
                      {visibleColumns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          style={col.tableCellProps?.style}
                          className={col.tableCellProps?.className}
                        >
                          {typeof col.renderCell === "function"
                            ? col.renderCell(item, index, array)
                            : typeof col.valueGetter === "function"
                              ? col.valueGetter(item, index, array)
                              : item[col.field]}
                        </td>
                      ))}
                    </tr>

                    {renderExpanded ? (
                      <tr className="bg-azure-50">
                        {checkboxSelection ? <td /> : null}
                        <td colSpan={visibleColumns.length}>
                          {renderExpanded(item, index, array)}
                        </td>
                      </tr>
                    ) : null}

                    {repeatHead && index < array.length - 1 ? (
                      <>{renderHeadRow()}</>
                    ) : null}
                  </React.Fragment>
                ))}
              </>
            ) : (
              <tr>
                <td colSpan={colSpan}>
                  <NoItemsOverlay
                    message={noItemsOverlayMessage}
                    hideIcon={hideNoItemsOverlayIcon}
                  />
                </td>
              </tr>
            )}
          </tbody>

          {footerItems ? (
            <tfoot>
              {footerItems.map((itemColumns, index) => (
                <tr key={index}>
                  {itemColumns.map((col, colIndex) => (
                    <td key={colIndex} style={col.tableCellProps?.style}>
                      {col.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tfoot>
          ) : null}
        </table>
      </div>

      {!hidePaginationFooter ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-mist-100">
          <p className="text-sm text-mist-500">
            {itemCount > 0
              ? `Showing ${(localPage - 1) * localPageSize + 1} to ${Math.min(
                  localPage * localPageSize,
                  itemCount
                )} of ${itemCount} entries`
              : "0 entries"}
          </p>
          <div className="flex items-center gap-3">
            <select
              value={localPageSize}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (typeof onPageSizeChange === "function") {
                  onPageSizeChange(next);
                }
              }}
              aria-label="Rows per page"
              className="px-3 py-1.5 rounded-lg text-sm border border-mist-200 bg-white text-mist-700 focus:border-azure-500 focus:ring-2 focus:ring-azure-500/20 outline-none"
            >
              {[25, 50, 100, 250, 500, 1000].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <TablePaginationActions
              count={itemCount}
              page={localPage}
              pageSize={localPageSize}
              onPageChange={(next) => {
                if (typeof onPageChange === "function") {
                  onPageChange(next);
                }
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { NoItemsOverlay, SearchTextField };
export default Table;
