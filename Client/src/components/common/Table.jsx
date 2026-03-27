"use client";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const normalizeHeader = (header, index) => {
  if (typeof header === "object" && header !== null) {
    return {
      key: header.key ?? `header-${index}`,
      label: header.label ?? "",
      className: header.className ?? "",
      contentClassName: header.contentClassName ?? "",
    };
  }

  return {
    key: `header-${index}`,
    label: header,
    className: "",
    contentClassName: "",
  };
};

const normalizeCell = (cell, index) => {
  if (typeof cell === "object" && cell !== null && !Array.isArray(cell) && !(cell instanceof Date)) {
    if (Object.prototype.hasOwnProperty.call(cell, "content")) {
      return {
        key: cell.key ?? `cell-${index}`,
        content: cell.content,
        className: cell.className ?? "",
        contentClassName: cell.contentClassName ?? "",
      };
    }
  }

  return {
    key: `cell-${index}`,
    content: cell,
    className: "",
    contentClassName: "",
  };
};

const Table = ({
  headers = [],
  rows = [],
  emptyMessage = "No data available",
  className = "",
  tableClassName = "",
  headClassName = "",
  bodyClassName = "",
  rowClassName = "",
  getRowKey,
  onRowClick,
}) => {
  const normalizedHeaders = headers.map(normalizeHeader);

  return (
    <div
      className={joinClasses(
        "w-full overflow-hidden rounded-[20px] border border-[#E9EDF5] bg-white",
        className
      )}
    >
      <div className="w-full overflow-x-auto no-scrollbar">
        <table
          className={joinClasses(
            "w-full min-w-max border-separate border-spacing-0 text-left sm:min-w-full",
            "text-[11px] sm:text-xs lg:text-sm",
            tableClassName
          )}
        >
          <thead className={joinClasses("bg-white", headClassName)}>
            <tr>
              {normalizedHeaders.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className={joinClasses(
                    "border-b border-[#E9EDF5] px-3 py-3 font-medium text-gray5",
                    "sm:px-4 sm:py-4 lg:px-5",
                    header.className
                  )}
                >
                  <div className={joinClasses("whitespace-nowrap", header.contentClassName)}>
                    {header.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={bodyClassName}>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => {
                const resolvedCells = Array.isArray(row) ? row : row?.cells ?? [];
                const resolvedRowClassName = Array.isArray(row) ? "" : row?.className ?? "";
                const rowKey =
                  (typeof getRowKey === "function" && getRowKey(row, rowIndex)) ||
                  (Array.isArray(row) ? `row-${rowIndex}` : row?.key ?? `row-${rowIndex}`);

                return (
                  <tr
                    key={rowKey}
                    role={typeof onRowClick === "function" ? "button" : undefined}
                    tabIndex={typeof onRowClick === "function" ? 0 : undefined}
                    onClick={typeof onRowClick === "function" ? () => onRowClick(row, rowIndex) : undefined}
                    onKeyDown={
                      typeof onRowClick === "function"
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(row, rowIndex);
                            }
                          }
                        : undefined
                    }
                    className={joinClasses(
                      "transition-colors duration-200 hover:bg-[#FAFBFD]",
                      typeof onRowClick === "function" && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D1FAE5] focus:ring-inset",
                      rowClassName,
                      resolvedRowClassName
                    )}
                  >
                    {resolvedCells.map((cell, cellIndex) => {
                      const normalizedCell = normalizeCell(cell, cellIndex);

                      return (
                        <td
                          key={normalizedCell.key}
                          className={joinClasses(
                            "border-b border-[#E9EDF5] px-3 py-3 align-middle text-[#1E2430]",
                            "sm:px-4 sm:py-4 lg:px-5",
                            normalizedCell.className
                          )}
                        >
                          <div
                            className={joinClasses(
                              "min-w-0",
                              normalizedCell.contentClassName
                            )}
                          >
                            {normalizedCell.content}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={Math.max(normalizedHeaders.length, 1)}
                  className="px-4 py-10 text-center text-sm text-[#8B95A7]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
