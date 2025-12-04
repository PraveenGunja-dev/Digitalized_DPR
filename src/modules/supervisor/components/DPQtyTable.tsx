import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { ExcelTable } from "@/components/ExcelTable";
import { getTodayAndYesterday } from "@/modules/auth/services/dprSupervisorService";
import { toast } from "sonner";

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
}

export function DPQtyTable({ data, setData, onSave, onSubmit, isLocked = false }: DPQtyTableProps) {
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
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <p className="font-medium">PLOT - A-06 135 MW - KHAVDA HYBRID SOLAR PHASE 3 (YEAR 2025-26)</p>
        <p>Reporting Date: {today}</p>
        <p>Progress Date: {yesterday}</p>
        {isLocked && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
            This entry has been submitted and is locked for 2 days. Values remain visible but cannot be edited.
          </div>
        )}
      </div>
      
      <ExcelTable
        title="DP Qty Table"
        columns={columns}
        data={tableData}
        onDataChange={handleDataChange}
        onSave={onSave}
        onSubmit={onSubmit}
        isReadOnly={isLocked}
      />
    </div>
  );
}
