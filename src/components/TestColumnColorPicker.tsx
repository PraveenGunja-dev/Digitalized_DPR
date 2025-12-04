import { useState } from "react";
import { ColumnColorPicker } from "./ColumnColorPicker";

export function TestColumnColorPicker() {
  const [columnColors, setColumnColors] = useState<Record<string, string>>({});
  
  const columns = ["Column A", "Column B", "Column C", "Column D"];
  
  const handleColorChange = (columnName: string, color: string) => {
    setColumnColors(prev => ({
      ...prev,
      [columnName]: color
    }));
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Test Column Color Picker</h2>
      <ColumnColorPicker 
        columns={columns}
        columnColors={columnColors}
        onColorChange={handleColorChange}
      />
      <div className="mt-4">
        <h3 className="font-medium">Current Colors:</h3>
        <pre>{JSON.stringify(columnColors, null, 2)}</pre>
      </div>
    </div>
  );
}