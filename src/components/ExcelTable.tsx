import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";

interface ExcelTableProps {
  title: string;
  columns: string[];
  data: any[];
  onDataChange: (newData: any[]) => void;
  onSave?: () => void;
  onSubmit?: () => void;
  isReadOnly?: boolean;
  hideAddRow?: boolean;
  excludeColumns?: string[];
  editableColumns?: string[]; // Columns that can be edited even when isReadOnly is true
  columnTypes?: Record<string, 'text' | 'number' | 'date'>; // Input types for specific columns
}

export const ExcelTable = ({ 
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
  columnTypes = {}
}: ExcelTableProps) => {
  // Filter out excluded columns
  const filteredColumns = columns.filter(column => !excludeColumns.includes(column));
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    // Allow editing if not readonly or if the column is in the editableColumns list
    const columnName = columns[colIndex];
    const canEdit = !isReadOnly || editableColumns.includes(columnName);
    
    if (!canEdit) return;
    
    const newData = [...data];
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = value;
    onDataChange(newData);
  };

  const handleAddRow = () => {
    if (isReadOnly) return;
    
    const newRow = Array(columns.length).fill("");
    onDataChange([...data, newRow]);
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (isReadOnly) return;
    
    const newData = [...data];
    newData.splice(rowIndex, 1);
    onDataChange(newData);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-background ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''}`}>
      {/* Header - hidden in fullscreen mode */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isFullscreen ? 'hidden' : 'bg-gray-50 dark:bg-muted'}`}>
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="text-sm text-muted-foreground">({data.length} rows)</span>
        </div>
        <div className="flex items-center space-x-2">
          {!isReadOnly && onSave && (
            <Button size="sm" onClick={onSave} variant="outline">
              Save
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4 mr-1" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 mr-1" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Fullscreen header when in fullscreen mode */}
      {isFullscreen && (
        <div className="p-4 border-b bg-white dark:bg-background">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{title} - Fullscreen View</h2>
              <p className="text-sm text-muted-foreground">{data.length} rows × {columns.length} columns</p>
            </div>
            <div className="flex space-x-2">
              {!isReadOnly && onSave && (
                <Button size="sm" onClick={onSave} variant="outline">
                  Save
                </Button>
              )}
              {!isReadOnly && onSubmit && (
                <Button 
                  size="sm" 
                  onClick={() => {
                    const confirmed = window.confirm("Check once - if submitted, editing is not possible. Do you want to proceed?");
                    if (confirmed) {
                      onSubmit();
                    }
                  }}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={toggleFullscreen}
              >
                <Minimize className="w-4 h-4 mr-1" />
                Exit Fullscreen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'max-h-[600px]'}`}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-muted sticky top-0 z-10">
              {filteredColumns.map((column, index) => (
                <th 
                  key={index} 
                  className="border-r border-b border-gray-300 dark:border-border px-3 py-2 text-left font-medium text-gray-700 dark:text-foreground min-w-[120px] bg-gray-100 dark:bg-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={rowIndex % 2 === 0 ? "bg-white dark:bg-background hover:bg-gray-50 dark:hover:bg-gray-900" : "bg-gray-50 dark:bg-muted/30 hover:bg-gray-100 dark:hover:bg-gray-800"}
              >
                {filteredColumns.map((_, filteredColIndex) => {
                  // Find the original column index to map to the correct data
                  const originalColIndex = columns.findIndex(col => col === filteredColumns[filteredColIndex]);
                  return (
                    <td 
                      key={filteredColIndex} 
                      className="border-r border-t border-gray-300 dark:border-border p-0 align-middle"
                    >
                      <Input
                        value={row[originalColIndex] || ""}
                        onChange={(e) => handleCellChange(rowIndex, originalColIndex, e.target.value)}
                        className="border-0 rounded-none focus-visible:ring-1 focus-visible:ring-blue-500 h-8 w-full px-2"
                        readOnly={!editableColumns.includes(columns[originalColIndex]) && isReadOnly}
                        type={columnTypes[columns[originalColIndex]] || 'text'}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row button - removed as per requirements */}
      {/* {!isReadOnly && !hideAddRow && (
        <div className="border-t bg-gray-50 dark:bg-muted px-4 py-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8"
            onClick={handleAddRow}
          >
            + Add Row
          </Button>
        </div>
      )} */}

      {/* Status bar - hidden in fullscreen mode */}
      <div className={`border-t bg-gray-50 dark:bg-muted px-4 py-1 flex justify-between text-xs text-gray-500 dark:text-muted-foreground ${isFullscreen ? 'hidden' : ''}`}>
        <div>
          Ready | {data.length} rows × {columns.length} columns
        </div>
        <div>
          Adani Workflow Excel Sheet
        </div>
      </div>
    </div>
  );
};