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
}

export const ExcelTable = ({ 
  title, 
  columns, 
  data, 
  onDataChange,
  onSave,
  onSubmit,
  isReadOnly = false
}: ExcelTableProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (isReadOnly) return;
    
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
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isFullscreen ? 'bg-gray-100 dark:bg-muted' : 'bg-gray-50 dark:bg-muted'}`}>
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
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-muted sticky top-0 z-10">
              <th className="border-r border-b border-gray-300 dark:border-border w-12 h-8 text-center font-medium text-gray-700 dark:text-foreground">#</th>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className="border-r border-b border-gray-300 dark:border-border px-3 py-2 text-left font-medium text-gray-700 dark:text-foreground min-w-[120px]"
                >
                  {column}
                </th>
              ))}
              {!isReadOnly && (
                <th className="border-b border-gray-300 dark:border-border w-12"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={rowIndex % 2 === 0 ? "bg-white dark:bg-background" : "bg-gray-50 dark:bg-muted/30"}
              >
                <td className="border-r border-t border-gray-300 dark:border-border w-12 h-8 text-center text-gray-500 dark:text-muted-foreground text-xs">
                  {rowIndex + 1}
                </td>
                {columns.map((_, colIndex) => (
                  <td 
                    key={colIndex} 
                    className="border-r border-t border-gray-300 dark:border-border p-0"
                  >
                    <Input
                      value={row[colIndex] || ""}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      className="border-0 rounded-none focus-visible:ring-1 focus-visible:ring-blue-500 h-8"
                      readOnly={isReadOnly}
                    />
                  </td>
                ))}
                {!isReadOnly && (
                  <td className="border-t border-gray-300 dark:border-border w-12 p-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-full rounded-none text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={() => handleDeleteRow(rowIndex)}
                    >
                      ×
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row button */}
      {!isReadOnly && (
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
      )}

      {/* Status bar */}
      <div className="border-t bg-gray-50 dark:bg-muted px-4 py-1 flex justify-between text-xs text-gray-500 dark:text-muted-foreground">
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