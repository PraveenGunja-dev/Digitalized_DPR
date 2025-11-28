import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Save, Download, Palette } from "lucide-react";
import { toast } from "sonner";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import { registerAllModules } from "handsontable/registry";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
// Import Handsontable styles correctly
import "handsontable/dist/handsontable.css";

// Register all Handsontable modules to ensure cell types are available
registerAllModules();

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
  const [data, setData] = useState<any[][]>([]);
  let hotInstance: Handsontable | null = null;
  
  // Theme state - using custom themes
  const [theme, setTheme] = useState<
    "htThemeAdaniBlue" | 
    "htThemeEmerald" | 
    "htThemeSunset" | 
    "htThemeOcean" | 
    "htThemeDark" | 
    "htThemeMain" | 
    "htThemeHorizon"
  >("htThemeAdaniBlue");

  // Convert initialRows to Handsontable data format
  useEffect(() => {
    const convertedData = initialRows.map(row => 
      row.map(cell => cell.value)
    );
    setData(convertedData);
  }, [initialRows]);

  // Define column settings for Handsontable
  const columnSettings = columns.map((col, index) => {
    const firstRowCell = initialRows[0]?.[index];
    if (!firstRowCell) return {};
    
    const settings: any = {
      readOnly: firstRowCell.readOnly || false  // Default to false if not specified
    };
    
    // Use correct Handsontable cell types
    if (firstRowCell.columnType === "number") {
      settings.type = "numeric";
      settings.numericFormat = {
        pattern: '0,0.00'
      };
    } else if (firstRowCell.columnType === "date") {
      settings.type = "date";
      settings.dateFormat = "YYYY-MM-DD";
    } else if (firstRowCell.columnType === "dropdown" && firstRowCell.options) {
      settings.type = "dropdown";
      settings.source = firstRowCell.options;
    } else {
      // Default to text type for any other case including undefined columnType
      settings.type = "text";
    }
    
    return settings;
  });

  const handleSubmit = () => {
    toast.success("Sheet submitted successfully!", {
      description: "Your data has been sent for review.",
    });
    onSubmit?.();
  };

  const handleExport = () => {
    // Create worksheet data
    const ws_data = [];
    
    // Add headers
    const headers = [...columns];
    ws_data.push(headers);
    
    // Add data rows
    data.forEach(row => {
      ws_data.push([...row]);
    });
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Enhance the worksheet with formatting
    // Set column widths
    const colWidths = columns.map((col, index) => {
      // Calculate width based on content length
      let maxWidth = col.length;
      data.forEach(row => {
        if (row[index] && row[index].toString().length > maxWidth) {
          maxWidth = row[index].toString().length;
        }
      });
      return { wch: Math.min(Math.max(maxWidth + 2, 10), 50) }; // Min 10, Max 50
    });
    
    // Apply column widths
    ws['!cols'] = colWidths;
    
    // Add metadata to workbook
    wb.Props = {
      Title: title,
      Subject: `${title} - Adani Workflow`,
      Author: "Adani Workflow System",
      CreatedDate: new Date(),
      Company: "Adani Group",
      Category: "Project Management"
    };
    
    // Add worksheet to workbook with a better name
    XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)); // Excel sheet names max 31 chars
    
    // Export to Excel file with a more descriptive name
    const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}_Adani_Workflow.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success("Excel file exported successfully!", {
      description: `File: ${fileName}`
    });
  };

  // Handle theme change
  const handleThemeChange = (newTheme: 
    "htThemeAdaniBlue" | 
    "htThemeEmerald" | 
    "htThemeSunset" | 
    "htThemeOcean" | 
    "htThemeDark" | 
    "htThemeMain" | 
    "htThemeHorizon"
  ) => {
    setTheme(newTheme);
    // Update the Handsontable instance with the new theme if it exists
    if (hotInstance) {
      // Apply theme by updating the container class
      const container = hotInstance.rootElement;
      if (container) {
        // Remove all theme classes
        container.classList.remove(
          "htThemeAdaniBlue",
          "htThemeEmerald",
          "htThemeSunset",
          "htThemeOcean",
          "htThemeDark",
          "htThemeMain",
          "htThemeHorizon"
        );
        // Add the new theme class
        container.classList.add(newTheme);
      }
      
      // Also update the settings to ensure the theme is applied
      hotInstance.updateSettings({
        className: `${newTheme} htCenter htMiddle`
      });
    }
  };

  return (
    <motion.div 
      className="excel-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Excel Toolbar */}
      <motion.div 
        className="excel-toolbar"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <motion.h2 
            className="text-sm font-semibold text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {title}
          </motion.h2>
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {/* Theme Selector */}
            <div className="flex items-center space-x-1">
              <Palette className="w-4 h-4 text-gray-500" />
              <select 
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as any)}
                className="text-xs border rounded px-1 py-0.5"
              >
                <option value="htThemeAdaniBlue">Adani Blue</option>
                <option value="htThemeEmerald">Emerald Green</option>
                <option value="htThemeSunset">Sunset Orange</option>
                <option value="htThemeOcean">Ocean Blue</option>
                <option value="htThemeDark">Dark Theme</option>
                <option value="htThemeMain">Main Theme</option>
                <option value="htThemeHorizon">Horizon Theme</option>
              </select>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="sm" 
                variant="ghost" 
                className="excel-button"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="sm" 
                onClick={handleSubmit} 
                className="excel-save-button"
              >
                <Save className="w-4 h-4 mr-1" />
                Submit Sheet
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Handsontable Grid */}
      <motion.div 
        className={`excel-grid-wrapper ${theme}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <HotTable
          data={data}
          colHeaders={columns}
          rowHeaders={true}
          contextMenu={["row_above", "row_below", "col_left", "col_right", "---------", "remove_row", "remove_col", "---------", "undo", "redo", "---------", "make_read_only", "alignment"]}
          height="auto"
          maxRows={100}
          minRows={10}
          minCols={columns.length}
          minSpareRows={1}
          licenseKey="non-commercial-and-evaluation"
          columns={columnSettings}
          className={`${theme} htCenter htMiddle`}
          stretchH="all"
          manualColumnResize={true}
          manualRowResize={true}
          filters={true}
          dropdownMenu={true}
          columnSorting={true}
          afterChange={(changes, source) => {
            if (changes && source !== 'loadData') {
              // Update data state when changes occur
              const newData = [...data];
              changes.forEach((change) => {
                const [row, prop, oldValue, newValue] = change;
                if (typeof row === 'number' && typeof prop === 'number') {
                  if (!newData[row]) newData[row] = [];
                  newData[row][prop] = newValue;
                }
              });
              setData(newData);
            }
          }}
          afterInit={function() {
            hotInstance = this as Handsontable;
            // Apply initial theme
            const container = this.rootElement;
            if (container) {
              container.classList.add(theme);
            }
          }}
        />
      </motion.div>

      {/* Status Bar */}
      <motion.div 
        className="excel-status-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <div className="text-xs text-gray-600">
          Ready | {data.length} rows × {columns.length} columns
        </div>
      </motion.div>
    </motion.div>
  );
};