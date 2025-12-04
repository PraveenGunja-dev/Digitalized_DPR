import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { StyledExcelTable } from "@/components/StyledExcelTable";

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

interface DPBlockData {
  activityId: string;
  activities: string;
  plot: string;
  block: string;
  priority: string;
  contractorName: string;
  scope: string;
  yesterdayValue: string;
  todayValue: string;
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
}

export function DPBlockTable({ data, setData, onSave, onSubmit, yesterday, today, isLocked = false, status = 'draft' }: DPBlockTableProps) {
  // Define columns
  const columns = [
    "Activity_ID",
    "Activities",
    "Plot",
    "Block",
    "Priority",
    "Contractor Name",
    "Scope",
    yesterday,
    today
  ];
  
  // Convert array of objects to array of arrays
  const tableData = data.map(row => [
    row.activityId || '',
    row.activities || '',
    row.plot || '',
    row.block || '',
    row.priority || '',
    row.contractorName || '',
    row.scope || '',
    row.yesterdayValue || '',
    row.todayValue || ''
  ]);
  
  // Handle data changes from ExcelTable
  const handleDataChange = (newData: any[][]) => {
    // Convert array of arrays back to array of objects
    const updatedData = newData.map(row => ({
      activityId: row[0] || '',
      activities: row[1] || '',
      plot: row[2] || '',
      block: row[3] || '',
      priority: row[4] || '',
      contractorName: row[5] || '',
      scope: row[6] || '',
      yesterdayValue: row[7] || '',
      todayValue: row[8] || ''
    }));
    setData(updatedData);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-muted p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-2">DP Block Table</h3>
        {isLocked && (
          <div className="mt-3 flex items-center">
            <span className="mr-2">Status:</span>
            <StatusChip status={status} />
          </div>
        )}
      </div>
      
      <StyledExcelTable
        title="DP Block Table"
        columns={columns}
        data={tableData}
        onDataChange={handleDataChange}
        onSave={onSave}
        onSubmit={onSubmit}
        isReadOnly={isLocked}
        editableColumns={[]}
        columnTypes={{
          [yesterday]: "number",
          [today]: "number"
        }}
        initialColumnColors={{
          "Activities": "#0B74B0",
          "Block": "#75479C",
          [yesterday]: "#BD3861",
          [today]: "#22A04B"
        }}
      />
    </div>
  );
}