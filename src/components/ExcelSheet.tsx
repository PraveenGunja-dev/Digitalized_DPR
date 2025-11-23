import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "./ui/button";
import { Save, Download } from "lucide-react";
import { toast } from "sonner";

interface CellData {
  value: string;
  readOnly: boolean;
  columnType?: "text" | "number" | "date" | "dropdown";
  options?: string[];
}

interface ExcelSheetProps {
  title: string;
  columns: string[];
  rows: CellData[][];
  onSubmit?: () => void;
}

export const ExcelSheet = ({ title, columns, rows: initialRows, onSubmit }: ExcelSheetProps) => {
  const [rows, setRows] = useState(initialRows);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex].value = value;
    setRows(newRows);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const nextCol = colIndex + 1;
      if (nextCol < columns.length) {
        setSelectedCell({ row: rowIndex, col: nextCol });
        const nextInput = document.querySelector(
          `input[data-row="${rowIndex}"][data-col="${nextCol}"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      } else if (rowIndex + 1 < rows.length) {
        setSelectedCell({ row: rowIndex + 1, col: 0 });
        const nextInput = document.querySelector(
          `input[data-row="${rowIndex + 1}"][data-col="0"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (rowIndex + 1 < rows.length) {
        setSelectedCell({ row: rowIndex + 1, col: colIndex });
        const nextInput = document.querySelector(
          `input[data-row="${rowIndex + 1}"][data-col="${colIndex}"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = () => {
    toast.success("Sheet submitted successfully!", {
      description: "Your data has been sent for review.",
    });
    onSubmit?.();
  };

  return (
    <div className="excel-container">
      {/* Excel Toolbar */}
      <div className="excel-toolbar">
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" className="excel-button">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button size="sm" onClick={handleSubmit} className="excel-save-button">
              <Save className="w-4 h-4 mr-1" />
              Submit Sheet
            </Button>
          </div>
        </div>
      </div>

      {/* Excel Grid */}
      <div className="excel-grid-wrapper">
        <div className="excel-grid">
          {/* Column Headers */}
          <div className="excel-row excel-header-row">
            <div className="excel-cell excel-row-header">#</div>
            {columns.map((col, i) => (
              <div key={i} className="excel-cell excel-column-header">
                {col}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="excel-row">
              <div className="excel-cell excel-row-header">{rowIndex + 1}</div>
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`excel-cell excel-data-cell ${
                    cell.readOnly ? "excel-readonly-cell" : "excel-editable-cell"
                  } ${
                    selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                      ? "excel-selected-cell"
                      : ""
                  }`}
                >
                  {cell.readOnly ? (
                    <div className="excel-cell-content">{cell.value}</div>
                  ) : (
                    <input
                      type={cell.columnType === "number" ? "number" : "text"}
                      value={cell.value}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      data-row={rowIndex}
                      data-col={colIndex}
                      className="excel-input"
                      placeholder={cell.readOnly ? "" : "Enter value"}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="excel-status-bar">
        <div className="text-xs text-gray-600">
          Ready | {rows.length} rows × {columns.length} columns
        </div>
      </div>
    </div>
  );
};
