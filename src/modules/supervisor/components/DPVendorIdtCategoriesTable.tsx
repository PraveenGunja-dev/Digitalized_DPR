import { useState, useEffect } from "react";
import { StyledExcelTable } from "../../../components/StyledExcelTable";
import { fetchDpVendorIdtCategories } from "../services/mockDataService";

interface DPVendorIdtCategoryData {
  // Category row
  category?: string;
  is_category_row?: boolean;
  
  // Activity row
  activity_id?: string;
  activity?: string;
  plot?: string;
  block?: string;
  priority?: string;
  baseline_priority?: string;
  contractor?: string;
  scope?: string;
  front?: string;
  actual?: string;
  percent_completion?: string;
  remarks?: string;
}

interface DPVendorIdtCategoriesTableProps {
  onSave: () => void;
  onSubmit?: () => void;
  yesterday: string;
  today: string;
  isLocked?: boolean;
  status?: string;
  useMockData?: boolean;
}

export function DPVendorIdtCategoriesTable({ 
  onSave, 
  onSubmit, 
  yesterday, 
  today, 
  isLocked = false,
  status = 'draft',
  useMockData = false
}: DPVendorIdtCategoriesTableProps) {
  const [data, setData] = useState<DPVendorIdtCategoryData[]>([]);
  
  // Fetch data from mock API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (useMockData) {
        try {
          const mockData = await fetchDpVendorIdtCategories();
          setData(mockData);
        } catch (error) {
          console.error('Error fetching mock data:', error);
        }
      }
    };

    fetchData();
  }, [useMockData]);
  
  // Define columns
  const columns = [
    "Activity ID",
    "Activity",
    "Plot",
    "Block",
    "Priority",
    "Baseline Priority",
    "Contractor",
    "Scope",
    "Front",
    "Actual",
    "% Completion",
    "Remarks",
    yesterday,
    today
  ];
  
  // Convert array of objects to array of arrays
  const tableData = data.map(row => {
    if (row.is_category_row) {
      // Category row - only show category in first column, rest empty
      return [
        row.category || '',
        '', '', '', '', '', '', '', '', '', '', '',
        '', ''
      ];
    } else {
      // Activity row - show all data
      return [
        row.activity_id || '',
        row.activity || '',
        row.plot || '',
        row.block || '',
        row.priority || '',
        row.baseline_priority || '',
        row.contractor || '',
        row.scope || '',
        row.front || '',
        row.actual || '',
        row.percent_completion || '',
        row.remarks || '',
        '', // yesterday value (not editable)
        ''  // today value (not editable in this view)
      ];
    }
  });
  
  // Define which columns are editable
  const editableColumns = [
    "Priority",
    "Contractor",
    "Scope",
    "Front",
    "Remarks",
    today
  ];
  
  // Define column types
  const columnTypes: Record<string, 'text' | 'number' | 'date'> = {
    "Activity ID": "text",
    "Activity": "text",
    "Plot": "text",
    "Block": "text",
    "Priority": "text",
    "Baseline Priority": "text",
    "Contractor": "text",
    "Scope": "number",
    "Front": "number",
    "Actual": "text",
    "% Completion": "number",
    "Remarks": "text",
    [yesterday]: "number",
    [today]: "number"
  };
  
  // Define column widths for better alignment
  const columnWidths = {
    "Activity ID": 120,
    "Activity": 200,
    "Plot": 80,
    "Block": 120,
    "Priority": 100,
    "Baseline Priority": 120,
    "Contractor": 150,
    "Scope": 80,
    "Front": 80,
    "Actual": 80,
    "% Completion": 100,
    "Remarks": 150,
    [yesterday]: 100,
    [today]: 100
  };

  return (
    <div className="space-y-2 w-full">
      <StyledExcelTable
        title="DP Vendor IDT Categories Table"
        columns={columns}
        data={tableData}
        onDataChange={() => {}} // No data changes in this view
        onSave={onSave}
        onSubmit={onSubmit}
        isReadOnly={isLocked}
        editableColumns={editableColumns}
        columnTypes={columnTypes}
        columnWidths={columnWidths}
        status={status}
      />
    </div>
  );
}