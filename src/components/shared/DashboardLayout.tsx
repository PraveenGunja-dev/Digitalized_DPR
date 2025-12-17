import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  projectName?: string;
  onAddUser?: () => void;
  onAssignProject?: () => void;
  onCreateProject?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userName,
  userRole,
  projectName,
  onAddUser,
  onAssignProject,
  onCreateProject
}) => {
  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Navbar 
        userName={userName} 
        userRole={userRole} 
        projectName={projectName}
        onAddUser={onAddUser}
        onAssignProject={onAssignProject}
        onCreateProject={onCreateProject}
      />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </motion.div>
  );
};