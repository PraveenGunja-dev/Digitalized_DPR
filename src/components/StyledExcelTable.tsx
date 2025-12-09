import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, Save } from "lucide-react";
import { StatusChip } from "./StatusChip";

// ========================
// EXCEL THEMES (LIGHT + DARK)
// ========================
const excelThemes = {
  light: {
    bg: "#FFFFFF",
    headerBg: "#F2F2F2",
    headerText: "#000",
    text: "#000",
    grid: "#D4D4D4",
    activeBorder: "#0B74B0",
    hoverBg: "#EAF2FB",
    statusBg: "#F4F4F4",
  },
  dark: {
    bg: "#1E1E1E",
    headerBg: "#2B2B2B",
    headerText: "#E8E8E8",
    text: "#E8E8E8",
    grid: "#3A3A3A",
    activeBorder: "#2EA3F2",
    hoverBg: "#2E3238",
    statusBg: "#252525",
  },
};

export const StyledExcelTable = ({
  title,
  columns,
  data,
  onDataChange,
  onSave,
  onSubmit,
  isReadOnly = false,
  hideAddRow = false,
  excludeColumns = [],
  editableColumns = [],
  columnTypes = {},
  columnWidths = {},
  status = "draft",
}) => {
  const filteredColumns = columns.filter((c) => !excludeColumns.includes(c));
  const [activeCell, setActiveCell] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detect system/UI theme
  const [themeMode, setThemeMode] = useState("light");

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setThemeMode(isDark ? "dark" : "light");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const T = excelThemes[themeMode];

  const handleCellChange = (row, col, value) => {
    const cName = columns[col];
    const canEdit = !isReadOnly || editableColumns.includes(cName);
    if (!canEdit) return;

    const updated = [...data];
    updated[row] = [...updated[row]];
    updated[row][col] = value;
    onDataChange(updated);
  };

  const addRow = () => {
    if (isReadOnly) return;
    onDataChange([...data, Array(columns.length).fill("")]);
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  // ==========================================
  // EXCEL HEADER STYLE
  // ==========================================
  const excelHeaderStyle = (col) => ({
    backgroundColor: T.headerBg,
    color: T.headerText,
    border: `1px solid ${T.grid}`,
    fontSize: "14px",
    fontWeight: "500" as const,
    padding: "3px",
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    height: "42px",
    minWidth: columnWidths[col] ? `${columnWidths[col]}px` : "90px",
  });

  // ==========================================
  // EXCEL CELL STYLE
  // ==========================================
  const excelCellStyle = (row, col) => {
    const isActive = activeCell?.row === row && activeCell?.col === col;

    return {
      border: `1px solid ${T.grid}`,
      backgroundColor: T.bg,
      height: "24px",
      padding: 0,
      position: "relative" as const,
      transition: "background 0.1s",
      ...(isActive && {
        outline: `2px solid ${T.activeBorder}`,
        outlineOffset: "-2px",
      }),
    };
  };

  return (
    <div
      className={`border ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
      style={{
        borderColor: T.grid,
        backgroundColor: T.bg,
      }}
    >
      {/* ======================= HEADER ======================= */}
      {!isFullscreen && (
        <div
          className="flex items-center justify-between p-3 border-b"
          style={{ backgroundColor: T.headerBg, borderColor: T.grid }}
        >
          <div className="flex items-center space-x-2">
            <h3
              className="font-semibold text-lg"
              style={{ color: T.headerText }}
            >
              {title}
            </h3>
            <span style={{ color: T.headerText }}>({data.length} rows)</span>

            {status !== "draft" && <StatusChip status={status} />}
          </div>

          <div className="flex items-center space-x-2">
            {onSave && (
              <Button size="sm" variant="outline" onClick={onSave}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            )}

            {!isReadOnly && onSubmit && (
              <Button
                size="sm"
                onClick={() => {
                  if (
                    window.confirm(
                      "Once submitted, editing is not possible. Proceed?"
                    )
                  ) {
                    onSubmit();
                  }
                }}
              >
                Submit
              </Button>
            )}

            <Button size="sm" variant="outline" onClick={toggleFullscreen}>
              <Maximize className="w-4 h-4 mr-1" />
              Fullscreen
            </Button>
          </div>
        </div>
      )}

      {/* ======================= FULLSCREEN HEADER ======================= */}
      {isFullscreen && (
        <div
          className="flex items-center justify-between p-3 border-b"
          style={{
            backgroundColor: T.headerBg,
            borderColor: T.grid,
          }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: T.headerText }}>
              {title}
            </h2>
            <p style={{ color: T.headerText }}>
              {data.length} rows × {columns.length} columns
            </p>
          </div>

          <div className="flex space-x-2">
            {onSave && (
              <Button size="sm" variant="outline" onClick={onSave}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            )}
            {!isReadOnly && onSubmit && (
              <Button
                size="sm"
                onClick={() => {
                  if (window.confirm("Submit sheet?")) onSubmit();
                }}
              >
                Submit
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={toggleFullscreen}>
              <Minimize className="w-4 h-4 mr-1" />
              Exit
            </Button>
          </div>
        </div>
      )}

      {/* ======================= TABLE ======================= */}
      <div
        className={`overflow-auto ${
          isFullscreen ? "h-[calc(100vh-120px)]" : "max-h-[600px]"
        }`}
      >
        <table
          className="w-full border-collapse"
          style={{ tableLayout: "fixed" }}
        >
          <thead>
            <tr>
              {filteredColumns.map((col, i) => (
                <th key={i} style={excelHeaderStyle(col)}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, r) => (
              <tr key={r}>
                {filteredColumns.map((colName, i) => {
                  const col = columns.indexOf(colName);
                  const value = row[col];
                  const type = columnTypes[colName] || "text";

                  return (
                    <td
                      key={i}
                      style={excelCellStyle(r, col)}
                      onClick={() => setActiveCell({ row: r, col })}
                    >
                      <Input
                        type={type}
                        value={value || ""}
                        readOnly={isReadOnly && !editableColumns.includes(colName)}
                        onChange={(e) =>
                          handleCellChange(r, col, e.target.value)
                        }
                        className="w-full h-full px-2 text-[8px] border-none focus-visible:ring-0"
                        style={{
                          background: "transparent",
                          color: T.text,
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ======================= STATUS BAR ======================= */}
      {!isFullscreen && (
        <div
          className="flex justify-between px-3 py-1 text-xs border-t"
          style={{
            backgroundColor: T.statusBg,
            borderColor: T.grid,
            color: T.headerText,
          }}
        >
          <div>
            Ready | {data.length} rows × {columns.length} columns
          </div>
          <div>Excel Style Sheet</div>
        </div>
      )}
    </div>
  );
};
