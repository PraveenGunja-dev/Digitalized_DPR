import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette } from "lucide-react";

interface ColumnColorPickerProps {
  columns: string[];
  columnColors: Record<string, string>;
  onColorChange: (columnName: string, color: string) => void;
}

// Predefined color palette
const colorPalette = [
  { name: "Blue", value: "#0B74B0" },
  { name: "Purple", value: "#75479C" },
  { name: "Pink", value: "#BD3861" },
  { name: "Green", value: "#22A04B" },
  { name: "Orange", value: "#FF6B35" },
  { name: "Amber", value: "#F7931E" },
  { name: "Red", value: "#C44536" },
  { name: "Indigo", value: "#4A6FA5" },
  { name: "Violet", value: "#6B5B95" },
  { name: "Light Green", value: "#88B785" },
  { name: "Gold", value: "#E6AE4E" },
  { name: "Magenta", value: "#9E4C98" },
  { name: "None", value: "none" }, // Changed from "" to "none"
];

export function ColumnColorPicker({ columns, columnColors, onColorChange }: ColumnColorPickerProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  return (
    <div className="flex items-center space-x-2">
      <Palette className="w-4 h-4 text-gray-500" />
      <span className="text-sm font-medium">Column Colors:</span>
      
      <Select value={selectedColumn} onValueChange={setSelectedColumn}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Select column" />
        </SelectTrigger>
        <SelectContent>
          {columns.map((column) => (
            <SelectItem key={column} value={column} className="text-xs">
              {column}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedColumn && (
        <div className="flex items-center space-x-1">
          <span 
            className="w-4 h-4 rounded border border-gray-300" 
            style={{ 
              backgroundColor: columnColors[selectedColumn] && columnColors[selectedColumn] !== "none" ? columnColors[selectedColumn] : "transparent",
              border: columnColors[selectedColumn] && columnColors[selectedColumn] !== "none" ? "1px solid #ccc" : "1px dashed #ccc"
            }}
          />
          <Select 
            value={columnColors[selectedColumn] || ""} 
            onValueChange={(color) => {
              // Handle "none" value by passing empty string
              onColorChange(selectedColumn, color === "none" ? "" : color);
            }}
          >
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {colorPalette.map((color) => (
                <SelectItem key={color.value} value={color.value} className="text-xs">
                  <div className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded mr-2 border border-gray-300" 
                      style={{ 
                        backgroundColor: color.value !== "none" ? color.value : "transparent",
                        border: color.value !== "none" ? "1px solid #ccc" : "1px dashed #ccc"
                      }}
                    />
                    {color.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}