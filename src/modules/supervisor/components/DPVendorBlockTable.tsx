import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { StyledExcelTable } from "@/components/StyledExcelTable";
import { StatusChip } from "@/components/StatusChip";
import { fetchDpVendorBlockData } from "@/modules/supervisor/services/mockDataService";

interface DPVendorBlockData {
  activityId: string;
  activities: string;
  plot: string;
  newBlockNom: string;
  priority: string;
  baselinePriority: string;
  contractorName: string;
  scope: string;
  holdDueToWtg: string;
  front: string;
  actual: string;
  completionPercentage: string;
  remarks: string;
  yesterdayValue: string;
  todayValue: string;
  // Category row properties
  category?: string;
  isCategoryRow?: boolean;
}

interface DPVendorBlockTableProps {
  data: DPVendorBlockData[];
  setData: (data: DPVendorBlockData[]) => void;
  onSave: () => void;
  onSubmit?: () => void;
  yesterday: string;
  today: string;
  isLocked?: boolean;
  status?: string; // Add status prop
  useMockData?: boolean; // Flag to use mock data
}

export function DPVendorBlockTable({ 
  data, 
  setData, 
  onSave, 
  onSubmit, 
  yesterday, 
  today, 
  isLocked = false,
  status = 'draft', // Add status prop with default
  useMockData = false // Flag to use mock data
}: DPVendorBlockTableProps) {
  // Fetch data from mock API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (useMockData) {
        try {
          const mockData = await fetchDpVendorBlockData();
          setData(mockData);
        } catch (error) {
          console.error('Error fetching mock data:', error);
        }
      }
    };

    fetchData();
  }, [setData, useMockData]);
  
  // Define columns
  const columns = [
    "Activity_ID(p6)",
    "Activities(p6)",
    "Plot(p6)",
    "New Block Nom(p6)",
    "Priority(user)",
    "Baseline Priority(p6)",
    "Contractor Name(user)",
    "Scope(user)",
    "Hold Due to WTG(user)",
    "Front(auto)",
    "Actual(auto)",
    "% Completion",
    "Remarks",
    yesterday,
    today
  ];

  // Define column widths for better alignment
  const columnWidths = {
    "Activity_ID(p6)": 40,
    "Activities(p6)": 120,
    "Plot(p6)": 60,
    "New Block Nom(p6)": 80,
    "Priority(user)": 60,
    "Baseline Priority(p6)": 80,
    "Contractor Name(user)": 80,
    "Scope(user)": 60,
    "Hold Due to WTG(user)": 80,
    "Front(auto)": 60,
    "Actual(auto)": 60,
    "% Completion": 60,
    "Remarks": 100,
    [yesterday]: 60,
    [today]: 60
  };
  
  // Convert array of objects to array of arrays
  const tableData = data.map(row => {
    if (row.isCategoryRow) {
      // Category row - only show category in first column, rest empty
      return [
        row.category || '',
        '', '', '', '', '', '', '', '', '', '', '',
        '', ''
      ];
    } else {
      // Activity row - show all data
      return [
        row.activityId,
        row.activities,
        row.plot,
        row.newBlockNom,
        row.priority,
        row.baselinePriority,
        row.contractorName,
        row.scope,
        row.holdDueToWtg,
        row.front,
        row.actual,
        row.completionPercentage,
        row.remarks,
        row.yesterdayValue,
        row.todayValue
      ];
    }
  });
  
  // Handle data changes from ExcelTable
  const handleDataChange = (newData: any[][]) => {
    // Convert array of arrays back to array of objects
    const updatedData = newData.map((row, index) => {
      const originalRow = data[index];
      
      if (originalRow?.isCategoryRow) {
        // Category row - preserve category data
        return {
          ...originalRow,
          category: row[0] || ''
        };
      } else {
        // Activity row - update all fields
        return {
          activityId: row[0] || "",
          activities: row[1] || "",
          plot: row[2] || "",
          newBlockNom: row[3] || "",
          priority: row[4] || "",
          baselinePriority: row[5] || "",
          contractorName: row[6] || "",
          scope: row[7] || "",
          holdDueToWtg: row[8] || "",
          front: row[9] || "",
          actual: row[10] || "",
          completionPercentage: row[11] || "",
          remarks: row[12] || "",
          yesterdayValue: row[13] || "",
          todayValue: row[14] || ""
        };
      }
    });
    setData(updatedData);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-muted p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-base mb-1">Project Information</h3>
        <p className="font-medium text-sm">PLOT - A-06 135 MW - KHAVDA HYBRID SOLAR PHASE 3 (YEAR 2025-26)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
          <p className="text-xs">Reporting Date: {today}</p>
          <p className="text-xs">Progress Date: {yesterday}</p>
        </div>
      </div>
      <StyledExcelTable
        title="DP Vendor Block Table"
        columns={columns}
        data={tableData}
        onDataChange={handleDataChange}
        onSave={onSave}
        onSubmit={onSubmit}
        isReadOnly={isLocked}
        editableColumns={["Priority(user)", "Contractor Name(user)", "Scope(user)", "Hold Due to WTG(user)", "Remarks", today]}
        columnTypes={{
          "Priority(user)": "text",
          "Contractor Name(user)": "text",
          "Scope(user)": "number",
          "Hold Due to WTG(user)": "text",
          "Front(auto)": "number",
          "Actual(auto)": "number",
          "% Completion": "number",
          [yesterday]: "number",
          [today]: "number"
        }}
        columnWidths={columnWidths}
        status={status} // Pass status to StyledExcelTable
      />
    </div>
  );
}
