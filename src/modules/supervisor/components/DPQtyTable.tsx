import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { StyledExcelTable } from "@/components/StyledExcelTable";
import { getTodayAndYesterday } from "@/modules/auth/services/dprSupervisorService";
import { toast } from "sonner";
import { StatusChip } from "@/components/StatusChip";
import { fetchDpQtyData } from "@/modules/supervisor/services/mockDataService";

interface DPQtyData {
  slNo: string;
  description: string;
  totalQuantity: string;
  uom: string;
  basePlanStart: string;
  basePlanFinish: string;
  forecastStart: string;
  forecastFinish: string;
  actualStart: string;
  actualFinish: string;
  remarks: string;
  balance: string;
  cumulative: string;
  yesterday?: string; // Number value, not editable
  today?: string; // Number value, editable
}

interface DPQtyTableProps {
  data: DPQtyData[];
  setData: React.Dispatch<React.SetStateAction<DPQtyData[]>>;
  onSave: () => void;
  onSubmit?: () => void;
  yesterday: string;
  today: string;
  isLocked?: boolean;
  status?: 'draft' | 'submitted_to_pm' | 'approved_by_pm' | 'rejected_by_pm' | 'final_approved';
  projectId?: number; // Add projectId prop for P6 integration
  useMockData?: boolean; // Flag to use mock data
}

export function DPQtyTable({ data, setData, onSave, onSubmit, yesterday, today, isLocked = false, status = 'draft', projectId, useMockData = false }: DPQtyTableProps) {
  const { today: currentDate, yesterday: previousDate } = getTodayAndYesterday();
  
  // Fetch data from Oracle P6 when component mounts and projectId is provided
  useEffect(() => {
    const fetchData = async () => {
      if (useMockData) {
        // Fetch from mock API
        try {
          const mockData = await fetchDpQtyData();
          setData(mockData);
        } catch (error) {
          console.error('Error fetching mock data:', error);
        }
      } else if (projectId) {
        // Fetch from Oracle P6
        try {
          const response = await fetch(`/api/oracle-p6/dp-qty-data?projectId=${projectId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.length > 0) {
              setData(result.data);
            }
          } else {
            console.error('Failed to fetch P6 data:', await response.text());
          }
        } catch (error) {
          console.error('Error fetching P6 data:', error);
        }
      }
    };

    fetchData();
  }, [projectId, setData, useMockData]);
  
  // Convert data to the format expected by ExcelTable
  const columns = [
    "Sl.No (p6)",
    "Description (p6)",
    "Total Quantity (p6 edit)",
    "UOM (p6 edit)",
    "Balance (auto)",
    "Base Plan Start (p6)",
    "Base Plan Finish (p6)",
    "Actual Start (p6 edit)",
    "Actual Finish (p6 edit)",
    "Forecast Start (p6)",
    "Forecast Finish (p6)",
    "Remarks (user)",
    "Cumulative (auto)",
    yesterday,
    today
  ];
  
  // Define column widths for better alignment
  const columnWidths = {
    "Sl.No (p6)": 40,
    "Description (p6)": 120,
    "Total Quantity (p6 edit)": 80,
    "UOM (p6 edit)": 60,
    "Balance (auto)": 70,
    "Base Plan Start (p6)": 80,
    "Base Plan Finish (p6)": 80,
    "Actual Start (p6 edit)": 80,
    "Actual Finish (p6 edit)": 80,
    "Forecast Start (p6)": 80,
    "Forecast Finish (p6)": 80,
    "Remarks (user)": 100,
    "Cumulative (auto)": 70,
    [yesterday]: 70,
    [today]: 70
  };
  
  // Define which columns are editable by the user
  const editableColumns = [
    "Total Quantity (p6 edit)",
    "UOM (p6 edit)",
    "Actual Start (p6 edit)",
    "Actual Finish (p6 edit)",
    "Remarks (user)",
    today // Today value is editable
  ];
  
  // Convert array of objects to array of arrays
  const tableData = data.map(row => [
    row.slNo,
    row.description,
    row.totalQuantity,
    row.uom,
    row.balance,
    row.basePlanStart,
    row.basePlanFinish,
    row.actualStart,
    row.actualFinish,
    row.forecastStart,
    row.forecastFinish,
    row.remarks,
    row.cumulative,
    row.yesterday || "", // Number value for yesterday
    row.today || "" // Number value for today (editable)
  ]);
  
  // Handle data changes from ExcelTable
  const handleDataChange = (newData: any[][]) => {
    // Convert array of arrays back to array of objects
    const updatedData = newData.map(row => ({
      slNo: row[0] || "",
      description: row[1] || "",
      totalQuantity: row[2] || "",
      uom: row[3] || "",
      balance: row[4] || "",
      basePlanStart: row[5] || "",
      basePlanFinish: row[6] || "",
      actualStart: row[7] || "",
      actualFinish: row[8] || "",
      forecastStart: row[9] || "",
      forecastFinish: row[10] || "",
      remarks: row[11] || "",
      cumulative: row[12] || "",
      yesterday: row[13] || "", // Number value for yesterday (not editable)
      today: row[14] || "" // Number value for today (editable)
    }));
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
        title="DP Qty Table"
        columns={columns}
        data={tableData}
        onDataChange={handleDataChange}
        onSave={onSave}
        onSubmit={onSubmit}
        isReadOnly={isLocked}
        editableColumns={editableColumns}
        columnTypes={{
          "Sl.No (p6)": "text",
          "Description (p6)": "text",
          "Total Quantity (p6 edit)": "number",
          "UOM (p6 edit)": "text",
          "Balance (auto)": "number",
          "Base Plan Start (p6)": "date",
          "Base Plan Finish (p6)": "date",
          "Actual Start (p6 edit)": "date",
          "Actual Finish (p6 edit)": "date",
          "Forecast Start (p6)": "date",
          "Forecast Finish (p6)": "date",
          "Remarks (user)": "text",
          "Cumulative (auto)": "number",
          [yesterday]: "number", // Number value, not editable
          [today]: "number" // Number value, editable
        }}
        columnWidths={columnWidths}
        status={status} // Pass status to StyledExcelTable
      />
    </div>
  );
}