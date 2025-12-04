import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { StyledExcelTable } from "@/components/StyledExcelTable";
import { getTodayAndYesterday } from "@/modules/auth/services/dprSupervisorService";
import { toast } from "sonner";

// Chip component for status display
const StatusChip = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

interface DPQtyData {
  slNo: string;
  description: string;
  totalQuantity: string;
  uom: string;
  balance: string;
  basePlanStart: string;
  basePlanFinish: string;
  actualStart: string;
  actualFinish: string;
  forecastStart: string;
  forecastFinish: string;
  remarks: string;
  cumulative: string;
}

interface DPQtyTableProps {
  data: DPQtyData[];
  setData: (data: DPQtyData[]) => void;
  onSave: () => void;
  onSubmit?: () => void;
  isLocked?: boolean;
  status?: string; // Add status prop
}

export function DPQtyTable({ data, setData, onSave, onSubmit, isLocked = false, status = 'draft' }: DPQtyTableProps) {
  const { today, yesterday } = getTodayAndYesterday();
  
  // Convert data to the format expected by ExcelTable
  const columns = [
    "Sl.No",
    "Description",
    "Total Quantity",
    "UOM",
    "Balance",
    "Base Plan Start",
    "Base Plan Finish",
    "Actual Start",
    "Actual Finish",
    "Forecast Start",
    "Forecast Finish",
    "Remarks",
    "Cumulative"
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
    row.cumulative
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
      cumulative: row[12] || ""
    }));
    setData(updatedData);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-muted p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-2">Project Information</h3>
        <p className="font-medium">PLOT - A-06 135 MW - KHAVDA HYBRID SOLAR PHASE 3 (YEAR 2025-26)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          <p>Reporting Date: {today}</p>
          <p>Progress Date: {yesterday}</p>
        </div>
        {isLocked && (
          <div className="mt-3 flex items-center">
            <span className="mr-2">Status:</span>
            <StatusChip status={status} />
          </div>
        )}
      </div>
      
      <StyledExcelTable
        title="DP Qty Table"
        columns={columns}
        data={tableData}
        onDataChange={handleDataChange}
        onSave={onSave}
        onSubmit={onSubmit}
        isReadOnly={isLocked}
        excludeColumns={["Sl.No"]}
        editableColumns={[]}
        columnTypes={{
          "Total Quantity": "number",
          "Balance": "number",
          "Base Plan Start": "date",
          "Base Plan Finish": "date",
          "Actual Start": "date",
          "Actual Finish": "date",
          "Forecast Start": "date",
          "Forecast Finish": "date",
          "Cumulative": "number"
        }}
        initialColumnColors={{
          "Description": "#0B74B0",
          "Total Quantity": "#75479C",
          "Balance": "#BD3861"
        }}
      />
    </div>
  );
}