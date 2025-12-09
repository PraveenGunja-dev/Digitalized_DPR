import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { StyledExcelTable } from "@/components/StyledExcelTable";
import { StatusChip } from "@/components/StatusChip";
import { fetchDpBlockData } from "@/modules/supervisor/services/mockDataService";

interface DPBlockData {
  // From P6 API
  activityId: string;
  activities: string;
  plot: string;
  newBlockNom: string;
  baselinePriority: string;
  scope: string;
  holdDueToWtg: string;
  front: string;
  actual: string;
  completionPercentage: string;
  balance: string;
  baselineStart: string;
  baselineFinish: string;
  actualStart: string;
  actualFinish: string;
  forecastStart: string;
  forecastFinish: string;
  
  // Date values
  yesterdayValue?: string; // Number value, not editable
  todayValue?: string; // Number value, editable
}

interface DPBlockTableProps {
  data: DPBlockData[];
  setData: (data: DPBlockData[]) => void;
  onSave: () => void;
  onSubmit?: () => void;
  yesterday: string;
  today: string;
  isLocked?: boolean;
  status?: string; // Add status prop
  useMockData?: boolean; // Flag to use mock data
}

export function DPBlockTable({ data, setData, onSave, onSubmit, yesterday, today, isLocked = false, status = 'draft', useMockData = false }: DPBlockTableProps) {
  // Fetch data from mock API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (useMockData) {
        try {
          const mockData = await fetchDpBlockData();
          setData(mockData);
        } catch (error) {
          console.error('Error fetching mock data:', error);
        }
      }
    };

    fetchData();
  }, [setData, useMockData]);
  
  // Define columns based on user requirements
  const columns = [
    "Activity_ID (p6)",
    "Activities (p6)",
    "Plot (p6)", // spv_number
    "New Block Nom (p6)", // block
    "Baseline Priority (p6)", // priority
    "Scope (p6)", // scope
    "Hold Due to WTG (p6)", // hold
    "Front (auto)", // front
    "Actual (auto)", // completed
    "% Completion (auto)", // calculated
    "Balance (auto)", // balance
    "Baseline Start (p6)", // baseline_start
    "Baseline Finish (p6)", // baseline_finish
    "Actual Start (user)", // actual_start
    "Actual Finish (user)", // actual_finish
    "Forecast Start (p6)", // forecast_start
    "Forecast Finish (p6)", // forecast_finish
    yesterday, // Number value, not editable
    today // Number value, editable
  ];
  
  // Define column widths for better alignment
  const columnWidths = {
    "Activity_ID (p6)": 40,
    "Activities (p6)": 120,
    "Plot (p6)": 60,
    "New Block Nom (p6)": 80,
    "Baseline Priority (p6)": 80,
    "Scope (p6)": 60,
    "Hold Due to WTG (p6)": 60,
    "Front (auto)": 60,
    "Actual (auto)": 60,
    "% Completion (auto)": 60,
    "Balance (auto)": 60,
    "Baseline Start (p6)": 80,
    "Baseline Finish (p6)": 80,
    "Actual Start (user)": 80,
    "Actual Finish (user)": 80,
    "Forecast Start (p6)": 80,
    "Forecast Finish (p6)": 80,
    [yesterday]: 60,
    [today]: 60
  };
  
  // Define which columns are editable by the user
  const editableColumns = [
    "Actual Start (user)",
    "Actual Finish (user)",
    today // Number value, editable
  ];

  // Convert array of objects to array of arrays
  const tableData = data.map(row => [
    row.activityId || '',
    row.activities || '',
    row.plot || '',
    row.newBlockNom || '',
    row.baselinePriority || '',
    row.scope || '',
    row.holdDueToWtg || '',
    row.front || '',
    row.actual || '',
    row.completionPercentage || '',
    row.balance || '',
    row.baselineStart || '',
    row.baselineFinish || '',
    row.actualStart || '',
    row.actualFinish || '',
    row.forecastStart || '',
    row.forecastFinish || '',
    row.yesterdayValue || '', // Number value for yesterday
    row.todayValue || '' // Number value for today (editable)
  ]);
  
  // Handle data changes from ExcelTable
  const handleDataChange = (newData: any[][]) => {
    // Convert array of arrays back to array of objects
    const updatedData = newData.map((row, index) => ({
      activityId: row[0] || '',
      activities: row[1] || '',
      plot: row[2] || '',
      newBlockNom: row[3] || '',
      baselinePriority: row[4] || '',
      scope: row[5] || '',
      holdDueToWtg: row[6] || '',
      front: row[7] || '',
      actual: row[8] || '',
      completionPercentage: row[9] || '',
      balance: row[10] || '',
      baselineStart: row[11] || '',
      baselineFinish: row[12] || '',
      actualStart: row[13] || '',
      actualFinish: row[14] || '',
      forecastStart: row[15] || '',
      forecastFinish: row[16] || '',
      yesterdayValue: row[17] || '', // Number value for yesterday (not editable)
      todayValue: row[18] || '' // Number value for today (editable)
    }));
    setData(updatedData);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-muted p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-base mb-1">DP Block Table</h3>
      </div>
      
      <StyledExcelTable
        title="DP Block Table"
        columns={columns}
        data={tableData}
        onDataChange={handleDataChange}
        onSave={onSave}
        onSubmit={onSubmit}
        isReadOnly={isLocked}
        editableColumns={editableColumns}
        columnTypes={{
          "Activity_ID (p6)": "text",
          "Activities (p6)": "text",
          "Plot (p6)": "text",
          "New Block Nom (p6)": "text",
          "Baseline Priority (p6)": "text",
          "Scope (p6)": "number",
          "Hold Due to WTG (p6)": "number",
          "Front (auto)": "number",
          "Actual (auto)": "number",
          "% Completion (auto)": "number",
          "Balance (auto)": "number",
          "Baseline Start (p6)": "date",
          "Baseline Finish (p6)": "date",
          "Actual Start (user)": "date",
          "Actual Finish (user)": "date",
          "Forecast Start (p6)": "date",
          "Forecast Finish (p6)": "date",
          [yesterday]: "number", // Number value, not editable
          [today]: "number" // Number value, editable
        }}
        columnWidths={columnWidths}
        status={status} // Pass status to StyledExcelTable
      />
    </div>
  );
}