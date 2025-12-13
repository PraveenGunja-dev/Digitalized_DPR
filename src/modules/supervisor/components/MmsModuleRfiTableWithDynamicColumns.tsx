import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Plus, Edit, Trash2 } from "lucide-react";
import { StyledExcelTable } from "@/components/StyledExcelTable";
import { 
  getMmsRfiDynamicColumns,
  addMmsRfiDynamicColumn,
  updateMmsRfiDynamicColumn,
  deleteMmsRfiDynamicColumn,
  getMmsRfiDraftEntry,
  saveMmsRfiDraftEntry,
  submitMmsRfiEntry
} from "@/modules/auth/services/mmsRfiService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DynamicColumn {
  id: number;
  project_id: number;
  column_name: string;
  display_name: string;
  data_type: string;
  is_required: boolean;
  default_value: string | null;
  position: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface MmsModuleRfiData {
  rfiNo: string;
  subject: string;
  module: string;
  submittedDate: string;
  responseDate: string;
  status: string;
  remarks: string;
  yesterdayValue: string;
  todayValue: string;
  [key: string]: string; // For dynamic columns
}

interface MmsModuleRfiTableWithDynamicColumnsProps {
  projectId: number;
  userId: number;
  yesterday: string;
  today: string;
  isLocked?: boolean;
  status?: string;
}

export function MmsModuleRfiTableWithDynamicColumns({ 
  projectId,
  userId,
  yesterday,
  today,
  isLocked = false,
  status = 'draft'
}: MmsModuleRfiTableWithDynamicColumnsProps) {
  const [dynamicColumns, setDynamicColumns] = useState<DynamicColumn[]>([]);
  const [entry, setEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({
    columnName: '',
    displayName: '',
    dataType: 'text',
    isRequired: false,
    defaultValue: ''
  });

  // Load dynamic columns and entry data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load dynamic columns
        const columns = await getMmsRfiDynamicColumns(projectId);
        setDynamicColumns(columns);
        
        // Load entry data
        const draftEntry = await getMmsRfiDraftEntry(projectId);
        setEntry(draftEntry);
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const handleAddColumn = async () => {
    try {
      if (!newColumn.columnName || !newColumn.displayName) {
        setError('Column name and display name are required');
        return;
      }

      const addedColumn = await addMmsRfiDynamicColumn(
        projectId,
        newColumn.columnName,
        newColumn.displayName,
        newColumn.dataType,
        newColumn.isRequired,
        newColumn.defaultValue
      );

      setDynamicColumns([...dynamicColumns, addedColumn]);
      
      // Reset form
      setNewColumn({
        columnName: '',
        displayName: '',
        dataType: 'text',
        isRequired: false,
        defaultValue: ''
      });
      
      setIsManageColumnsOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error adding column:', err);
      setError('Failed to add column');
    }
  };

  const handleRemoveColumn = async (columnId: number) => {
    try {
      await deleteMmsRfiDynamicColumn(columnId);
      setDynamicColumns(dynamicColumns.filter(col => col.id !== columnId));
      setError(null);
    } catch (err) {
      console.error('Error removing column:', err);
      setError('Failed to remove column');
    }
  };

  const handleSaveEntry = async () => {
    if (!entry) return;
    
    try {
      const updatedEntry = await saveMmsRfiDraftEntry(entry.id, entry.data_json);
      setEntry(updatedEntry);
      setError(null);
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Failed to save entry');
    }
  };

  const handleSubmitEntry = async () => {
    if (!entry) return;
    
    try {
      await submitMmsRfiEntry(entry.id);
      // Reload the entry to get updated status
      const updatedEntry = await getMmsRfiDraftEntry(projectId);
      setEntry(updatedEntry);
      setError(null);
    } catch (err) {
      console.error('Error submitting entry:', err);
      setError('Failed to submit entry');
    }
  };

  const handleDataChange = (newData: any[][]) => {
    if (!entry) return;
    
    // Convert array of arrays back to rows with column names
    const updatedRows = newData.map(row => {
      const rowObj: any = {};
      
      // Add fixed columns
      rowObj.rfiNo = row[0] || '';
      rowObj.subject = row[1] || '';
      rowObj.module = row[2] || '';
      rowObj.submittedDate = row[3] || '';
      rowObj.responseDate = row[4] || '';
      rowObj.status = row[5] || '';
      rowObj.remarks = row[6] || '';
      rowObj.yesterdayValue = row[7] || '';
      rowObj.todayValue = row[8] || '';
      
      // Add dynamic columns
      dynamicColumns.forEach((col, index) => {
        rowObj[col.column_name] = row[9 + index] || '';
      });
      
      return rowObj;
    });
    
    setEntry({
      ...entry,
      data_json: {
        ...entry.data_json,
        rows: updatedRows
      }
    });
  };

  // Convert rows to array of arrays for the table
  const convertToTableData = () => {
    if (!entry) return [];
    
    return entry.data_json.rows.map((row: any) => {
      const rowData = [
        row.rfiNo || '',
        row.subject || '',
        row.module || '',
        row.submittedDate || '',
        row.responseDate || '',
        row.status || '',
        row.remarks || '',
        row.yesterdayValue || '',
        row.todayValue || ''
      ];
      
      // Add dynamic columns
      dynamicColumns.forEach(col => {
        rowData.push(row[col.column_name] || '');
      });
      
      return rowData;
    });
  };

  // Define all columns (fixed + dynamic)
  const allColumns = [
    "RFI No",
    "Subject",
    "Module",
    "Submitted Date",
    "Response Date",
    "Status",
    "Remarks",
    yesterday,
    today,
    ...dynamicColumns.map(col => col.display_name)
  ];

  // Define column types
  const columnTypes: Record<string, 'text' | 'number' | 'date'> = {
    "Submitted Date": "date",
    "Response Date": "date",
    [yesterday]: "number",
    [today]: "number"
  };

  // Add dynamic column types
  dynamicColumns.forEach(col => {
    columnTypes[col.display_name] = col.data_type as 'text' | 'number' | 'date';
  });

  // Define column widths
  const columnWidths: Record<string, number> = {
    "RFI No": 60,
    "Subject": 100,
    "Module": 60,
    "Submitted Date": 80,
    "Response Date": 80,
    "Status": 60,
    "Remarks": 100,
    [yesterday]: 60,
    [today]: 60
  };

  // Add dynamic column widths (default to 80)
  dynamicColumns.forEach(col => {
    columnWidths[col.display_name] = 80;
  });

  if (isLoading) {
    return <div>Loading MMS & RFI data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4 w-full">
      <div className="bg-muted p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base mb-1">MMS & Module RFI</h3>
            <p className="text-xs">Reporting Date: {today}</p>
          </div>
          <Dialog open={isManageColumnsOpen} onOpenChange={setIsManageColumnsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLocked}>
                <Edit className="mr-2 h-4 w-4" /> Manage Columns
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Dynamic Columns</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="columnName">Column Name</Label>
                  <Input
                    id="columnName"
                    value={newColumn.columnName}
                    onChange={(e) => setNewColumn({...newColumn, columnName: e.target.value})}
                    placeholder="Internal column name (e.g., 'priority')"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={newColumn.displayName}
                    onChange={(e) => setNewColumn({...newColumn, displayName: e.target.value})}
                    placeholder="Display name (e.g., 'Priority')"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataType">Data Type</Label>
                  <select
                    id="dataType"
                    className="w-full p-2 border rounded"
                    value={newColumn.dataType}
                    onChange={(e) => setNewColumn({...newColumn, dataType: e.target.value})}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={newColumn.isRequired}
                    onChange={(e) => setNewColumn({...newColumn, isRequired: e.target.checked})}
                  />
                  <Label htmlFor="isRequired">Required</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultValue">Default Value</Label>
                  <Input
                    id="defaultValue"
                    value={newColumn.defaultValue}
                    onChange={(e) => setNewColumn({...newColumn, defaultValue: e.target.value})}
                    placeholder="Default value (optional)"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsManageColumnsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddColumn}>
                    <Plus className="mr-2 h-4 w-4" /> Add Column
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {dynamicColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dynamic Columns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dynamicColumns.map((column) => (
                <div key={column.id} className="flex items-center bg-gray-100 rounded px-3 py-1">
                  <span className="text-sm">{column.display_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0"
                    onClick={() => handleRemoveColumn(column.id)}
                    disabled={isLocked}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <StyledExcelTable
        title="MMS & Module RFI Table"
        columns={allColumns}
        data={convertToTableData()}
        onDataChange={handleDataChange}
        onSave={handleSaveEntry}
        onSubmit={handleSubmitEntry}
        isReadOnly={isLocked}
        columnTypes={columnTypes}
        columnWidths={columnWidths}
        headerStructure={[
          // First header row - main column names
          [
            { label: "RFI No", colSpan: 1 },
            { label: "Subject", colSpan: 1 },
            { label: "Module", colSpan: 1 },
            { label: "Submitted Date", colSpan: 1 },
            { label: "Response Date", colSpan: 1 },
            { label: "Status", colSpan: 1 },
            { label: "Remarks", colSpan: 1 },
            { label: yesterday, colSpan: 1 },
            { label: today, colSpan: 1 },
            ...dynamicColumns.map(col => ({ label: col.display_name, colSpan: 1 }))
          ]
        ]}
        status={entry?.status}
      />
    </div>
  );
}