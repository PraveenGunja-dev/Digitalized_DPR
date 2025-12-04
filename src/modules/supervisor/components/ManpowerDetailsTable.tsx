import { StyledExcelTable } from "@/components/StyledExcelTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

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

interface ManpowerDetailsData {
  activityId: string;
  slNo: string;
  block: string;
  contractorName: string;
  activity: string;
  section: string;
  yesterdayValue: string;
  todayValue: string;
}

interface ManpowerDetailsTableProps {
  data: ManpowerDetailsData[];
  setData: (data: ManpowerDetailsData[]) => void;
  totalManpower: number;
  setTotalManpower: (value: number) => void;
  onSave: () => void;
  onSubmit?: () => void;
  yesterday: string;
  today: string;
  isLocked?: boolean;
  status?: string; // Add status prop
}

export function ManpowerDetailsTable({ 
  data, 
  setData, 
  totalManpower, 
  setTotalManpower, 
  onSave, 
  onSubmit,
  yesterday, 
  today,
  isLocked = false,
  status = 'draft' // Add status prop with default value
}: ManpowerDetailsTableProps) {
  // Define columns
  const columns = [
    "Activity_ID",
    "Sl No",
    "Block",
    "Contractor Name",
    "Activity",
    "Section",
    yesterday,
    today
  ];
  
  // Convert array of objects to array of arrays
  const tableData = data.map(row => [
    row.activityId,
    row.slNo,
    row.block,
    row.contractorName,
    row.activity,
    row.section,
    row.yesterdayValue,
    row.todayValue
  ]);
  
  // Handle data changes from ExcelTable
  const handleDataChange = (newData: any[][]) => {
    // Convert array of arrays back to array of objects
    const updatedData = newData.map(row => ({
      activityId: row[0] || "",
      slNo: row[1] || "",
      block: row[2] || "",
      contractorName: row[3] || "",
      activity: row[4] || "",
      section: row[5] || "",
      yesterdayValue: row[6] || "",
      todayValue: row[7] || ""
    }));
    setData(updatedData);
  };

  return (
    <div className="space-y-4 w-full">
      {isLocked && (
        <div className="p-3 flex items-center">
          <span className="mr-2">Status:</span>
          <StatusChip status={status} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <span className="font-medium mr-2">Total Manpower Available at Site:</span>
          <Input 
            type="number" 
            value={totalManpower} 
            onChange={(e) => setTotalManpower(Number(e.target.value))}
            className="w-24 ml-2"
            readOnly={isLocked}
          />
        </div>
        <Button 
          onClick={onSave} 
          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
          disabled={isLocked}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Manpower
        </Button>
      </div>
      
      <StyledExcelTable
        title="Manpower Details Table"
        columns={columns}
        data={tableData}
        onDataChange={handleDataChange}
        onSave={onSave}
        onSubmit={onSubmit}
        isReadOnly={isLocked}
        excludeColumns={["Sl No"]}
        editableColumns={[]}
        columnTypes={{
          [yesterday]: "number",
          [today]: "number"
        }}
        initialColumnColors={{
          "Activity": "#0B74B0",
          [yesterday]: "#75479C",
          [today]: "#BD3861"
        }}
      />
    </div>
  );
}