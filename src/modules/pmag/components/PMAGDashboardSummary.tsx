import React from "react";
import { motion } from "framer-motion";
import { FileCheck, TrendingUp, Users, Award } from "lucide-react";
import { StatsCards } from "@/components/shared/StatsCards";

interface PMAGDashboardSummaryProps {
  projectName: string;
  approvedEntries: any[];
  historyEntries: any[];
  archivedEntries: any[];
}

export const PMAGDashboardSummary: React.FC<PMAGDashboardSummaryProps> = ({
  projectName,
  approvedEntries,
  historyEntries,
  archivedEntries
}) => {
  const statsData = [
    { title: "Approved Sheets", value: approvedEntries.length, icon: FileCheck },
    { title: "Historical Entries", value: historyEntries.length, icon: TrendingUp },
    { title: "Team Members", value: 12, icon: Users },
    { title: "Performance Score", value: 94, icon: Award },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            PMAG Dashboard
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {projectName ? `Project: ${projectName}` : "Project management dashboard"}
          </motion.p>
        </div>
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-primary/10 px-4 py-2 rounded-lg">
            <div className="flex items-center">
              <FileCheck className="w-5 h-5 text-primary mr-2" />
              <span className="font-medium">Final Approval Dashboard</span>
            </div>
          </div>
        </motion.div>
      </div>

      <StatsCards stats={statsData} />
    </div>
  );
};