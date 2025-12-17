import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Check, 
  X, 
  CheckCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface EntryCardProps {
  entry: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
  sheetType: string;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  isExpanded,
  onToggleExpand,
  onEdit,
  onApprove,
  onReject,
  onViewDetails,
  sheetType
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted_to_pm": return "secondary";
      case "approved_by_pm": return "default";
      case "rejected_by_pm": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted_to_pm": return "Pending";
      case "approved_by_pm": return "Approved";
      case "rejected_by_pm": return "Rejected";
      default: return status;
    }
  };

  return (
    <motion.div 
      key={entry.id} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800"
    >
      {/* Collapsible Entry Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between p-3 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={onToggleExpand}
      >
        <div className="flex items-start space-x-3 w-full">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Entry #{entry.id}</span>
                <Badge 
                  variant={getStatusVariant(entry.status)}
                  className="px-2 py-0.5 text-xs font-medium"
                >
                  {getStatusText(entry.status)}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground mt-1 md:mt-0">
                {new Date(entry.submitted_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-1">
              <span className="text-sm text-muted-foreground truncate">
                {entry.supervisor_name || 'Supervisor'} ({entry.supervisor_email})
              </span>
              <span className="text-xs font-medium text-primary hidden md:block">
                Project ID: {entry.project_id}
              </span>
              <span className="text-xs text-muted-foreground mt-1 md:mt-0">
                {sheetType.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {entry.status === "submitted_to_pm" && (
              <>
                {onEdit && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="transition-colors duration-200 px-2 py-1 h-7"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                {onApprove && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove();
                    }}
                    className="bg-green-600 hover:bg-green-700 transition-colors duration-200 px-2 py-1 h-7"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                )}
                {onReject && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject();
                    }}
                    className="transition-colors duration-200 px-2 py-1 h-7"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </>
            )}
            {entry.status === "approved_by_pm" && onApprove && (
              <Badge variant="outline" className="text-green-600 border-green-600 px-2 py-0.5 text-xs font-medium">
                <CheckCircle className="w-3 h-3 mr-1" />
                Sent to PMAG
              </Badge>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
        >
          <div className="p-3 bg-gray-50 dark:bg-gray-700">
            {onViewDetails && (
              <div className="flex justify-end mb-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onViewDetails}
                >
                  View Details
                </Button>
              </div>
            )}
            <div className="text-sm space-y-1">
              <p><strong>Submitted:</strong> {new Date(entry.submitted_at).toLocaleString()}</p>
              {entry.approved_at && (
                <p><strong>Approved:</strong> {new Date(entry.approved_at).toLocaleString()}</p>
              )}
              {entry.rejected_at && (
                <p><strong>Rejected:</strong> {new Date(entry.rejected_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};