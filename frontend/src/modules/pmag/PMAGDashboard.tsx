import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { useNotification } from "@/modules/auth/contexts/NotificationContext";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  PMAGDashboardSummary,
  PMAGSheetEntries,
  PMAGChartsSection,
  PMAGUserManagementModals,
  PMAGSuccessModal
} from "./components";
import { SnapshotFilterModal } from "@/modules/superadmin/components/SnapshotFilterModal";
import { fetchData, fetchApprovedEntries, fetchHistoryEntries, fetchArchivedEntries, finalApproveEntry, rejectEntry } from "./services";

const PMAGDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const { projectName, projectId } = location.state || {
    projectName: "Project",
    projectId: null
  };

  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAssignProjectModal, setShowAssignProjectModal] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [approvedEntries, setApprovedEntries] = useState<any[]>([]);
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState<number | null>(7); // Default to 7 days
  const [archivedEntries, setArchivedEntries] = useState<any[]>([]);
  const [selectedArchivedEntry, setSelectedArchivedEntry] = useState<any>(null);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showArchivedListModal, setShowArchivedListModal] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [projectForm, setProjectForm] = useState({
    Name: "",
    Location: "",
    Status: "planning",
    PercentComplete: 0,
    PlannedStartDate: "",
    PlannedFinishDate: ""
  });
  const [registerForm, setRegisterForm] = useState({
    Name: "",
    Email: "",
    password: "",
    Role: "Site PM" as "Site PM" | "PMAG", // PMAG can only create Site PMs and other PMAG users
    assignProject: false,
    ProjectId: "" as string | number
  });
  const [assignForm, setAssignForm] = useState({
    projectIds: [] as string[],  // Changed to array for multiple projects
    supervisorIds: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState({
    email: '',
    password: '',
    role: '',
    projectId: null as string | null
  });
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [supervisorSearchTerm, setSupervisorSearchTerm] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Record<number, boolean>>({});
  const [showSnapshotFilter, setShowSnapshotFilter] = useState(false);

  // Fetch projects and supervisors
  const loadInitialData = async () => {
    try {
      const data = await fetchData();
      setProjects(data.projects);
      setSupervisors(data.supervisors);

      // Fetch approved entries for PMAG review
      await loadApprovedEntries();
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch data");
    }
  };

  // Fetch approved entries from PM
  const loadApprovedEntries = async () => {
    try {
      setLoadingEntries(true);
      const entries = await fetchApprovedEntries();
      setApprovedEntries(entries);
    } catch (error) {
      console.error('Error fetching approved entries:', error);
      toast.error("Failed to load approved sheets");
    } finally {
      setLoadingEntries(false);
    }
  };

  // Fetch history entries with date filter
  const loadHistoryEntries = async (days?: number | null) => {
    try {
      setLoadingEntries(true);
      const entries = await fetchHistoryEntries(days);
      setHistoryEntries(entries || []);
    } catch (error) {
      console.error('Error fetching history entries:', error);
      toast.error("Failed to load history");
    } finally {
      setLoadingEntries(false);
    }
  };

  // Fetch archived entries
  const loadArchivedEntries = async () => {
    try {
      setLoadingEntries(true);
      const entries = await fetchArchivedEntries();
      setArchivedEntries(entries || []);
    } catch (error) {
      console.error('Error fetching archived entries:', error);
      toast.error("Failed to load archived sheets");
    } finally {
      setLoadingEntries(false);
    }
  };

  // Handle final approve entry
  const handleFinalApprove = async (entryId: number) => {
    try {
      await finalApproveEntry(entryId);

      // Find the entry that was approved to get details for notification
      const entry = approvedEntries.find(e => e.id === entryId);
      if (entry) {
        // Add notification for successful final approval
        addNotification({
          title: "Sheet Final Approved",
          message: `The ${entry.sheet_type.replace(/_/g, ' ')} sheet has been final approved and archived.`,
          type: "success",
          userId: user?.ObjectId,
          projectId: entry.project_id,
          entryId: entry.id,
          sheetType: entry.sheet_type
        });
      }

      // Refresh entries
      await loadApprovedEntries();
    } catch (error) {
      console.error(`Failed to final approve entry ${entryId}:`, error);
    }
  };

  // Handle reject entry
  const handleReject = async (entryId: number) => {
    try {
      await rejectEntry(entryId);

      // Find the entry that was rejected to get details for notification
      const entry = approvedEntries.find(e => e.id === entryId);
      if (entry) {
        // Add notification for rejection
        addNotification({
          title: "Sheet Rejected to PM",
          message: `The ${entry.sheet_type.replace(/_/g, ' ')} sheet has been rejected and sent back to PM for revision.`,
          type: "warning",
          userId: user?.ObjectId,
          projectId: entry.project_id,
          entryId: entry.id,
          sheetType: entry.sheet_type
        });
      }

      // Refresh entries
      await loadApprovedEntries();
    } catch (error) {
      console.error(`Failed to reject entry ${entryId}:`, error);
    }
  };

  // Handle register form change
  const handleRegisterFormChange = (field: string, value: string | boolean) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle assign form change
  const handleAssignFormChange = (field: string, value: string | string[]) => {
    setAssignForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle project form change
  const handleProjectFormChange = (field: string, value: string | number) => {
    setProjectForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle supervisor selection toggle
  const handleToggleSupervisorSelection = (supervisorId: string) => {
    setAssignForm(prev => {
      const currentIds = [...prev.supervisorIds];
      const index = currentIds.indexOf(supervisorId);

      if (index >= 0) {
        // Remove if already selected
        currentIds.splice(index, 1);
      } else {
        // Add if not selected
        currentIds.push(supervisorId);
      }

      return {
        ...prev,
        supervisorIds: currentIds
      };
    });
  };

  // Handle project selection toggle
  const handleToggleProjectSelection = (projectId: string) => {
    setAssignForm(prev => {
      const currentIds = [...prev.projectIds];
      const index = currentIds.indexOf(projectId);

      if (index >= 0) {
        // Remove if already selected
        currentIds.splice(index, 1);
      } else {
        // Add if not selected
        currentIds.push(projectId);
      }

      return {
        ...prev,
        projectIds: currentIds
      };
    });
  };

  // Handle create user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateUserModal(false);
    setShowRegisterModal(true);
  };

  // Handle create project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real implementation, we would call a service function here
      // For now, we'll just show a success message
      toast.success("Project created successfully!");
      setShowCreateProjectModal(false);

      // Reset form
      setProjectForm({
        Name: "",
        Location: "",
        Status: "planning",
        PercentComplete: 0,
        PlannedStartDate: "",
        PlannedFinishDate: ""
      });
    } catch (error) {
      console.error('Project creation error:', error);
      toast.error('Project creation failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle register user
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);

    try {
      // In a real implementation, we would call a service function here
      // For now, we'll just show a success message
      toast.success("User registered successfully!");
      setShowRegisterModal(false);
      setShowSuccessModal(true);

      // Set registered user details
      setRegisteredUser({
        email: registerForm.Email,
        password: registerForm.password,
        role: registerForm.Role,
        projectId: registerForm.assignProject ? registerForm.ProjectId.toString() : null
      });

      // Reset form
      setRegisterForm({
        Name: "",
        Email: "",
        password: "",
        Role: "Site PM",
        assignProject: false,
        ProjectId: ""
      });
    } catch (error) {
      console.error('User registration error:', error);
      toast.error('User registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Handle assign projects
  const handleAssignProjects = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignLoading(true);

    try {
      // In a real implementation, we would call a service function here
      // For now, we'll just show a success message
      toast.success("Projects assigned successfully!");
      setShowAssignProjectModal(false);

      // Reset form
      setAssignForm({
        projectIds: [],
        supervisorIds: []
      });
      setProjectSearchTerm('');
      setSupervisorSearchTerm('');
    } catch (error) {
      console.error('Project assignment error:', error);
      toast.error('Project assignment failed');
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <DashboardLayout
      userName={user?.Name || "User"}
      userRole={user?.Role || "PMAG"}
      projectName={projectName}
      onAddUser={() => setShowCreateUserModal(true)}
      onCreateProject={() => setShowCreateProjectModal(true)}
      onAssignProject={() => setShowAssignProjectModal(true)}
    >
      <PMAGDashboardSummary
        projectName={projectName}
        userName={user?.Name}
        approvedEntries={approvedEntries}
        historyEntries={historyEntries}
        archivedEntries={archivedEntries}
        onShowHistory={async () => {
          await loadHistoryEntries(historyFilter);
          setShowHistoryModal(true);
        }}
        onShowArchived={async () => {
          await loadArchivedEntries();
          setShowArchivedListModal(true);
        }}
        onShowSnapshotFilter={() => setShowSnapshotFilter(true)}
      />

      <PMAGSheetEntries
        approvedEntries={approvedEntries}
        loadingEntries={loadingEntries}
        onRefresh={loadApprovedEntries}
        onFinalApprove={handleFinalApprove}
        onReject={handleReject}
        expandedEntries={expandedEntries}
        setExpandedEntries={setExpandedEntries}
        onPushToP6={(entry) => {
          toast.info(`Push to P6 functionality for entry #${entry.id} coming soon`);
        }}
      />

      <PMAGChartsSection />

      <PMAGUserManagementModals
        showCreateUserModal={showCreateUserModal}
        setShowCreateUserModal={setShowCreateUserModal}
        showCreateProjectModal={showCreateProjectModal}
        setShowCreateProjectModal={setShowCreateProjectModal}
        showRegisterModal={showRegisterModal}
        setShowRegisterModal={setShowRegisterModal}
        showAssignProjectModal={showAssignProjectModal}
        setShowAssignProjectModal={setShowAssignProjectModal}
        projects={projects}
        supervisors={supervisors}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        assignForm={assignForm}
        setAssignForm={setAssignForm}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        registerLoading={registerLoading}
        assignLoading={assignLoading}
        loading={loading}
        projectSearchTerm={projectSearchTerm}
        setProjectSearchTerm={setProjectSearchTerm}
        supervisorSearchTerm={supervisorSearchTerm}
        setSupervisorSearchTerm={setSupervisorSearchTerm}
        onCreateUser={handleCreateUser}
        onCreateProject={handleCreateProject}
        onRegisterUser={handleRegisterUser}
        onAssignProjects={handleAssignProjects}
        onRegisterFormChange={handleRegisterFormChange}
        onAssignFormChange={handleAssignFormChange}
        onProjectFormChange={handleProjectFormChange}
        onToggleSupervisorSelection={handleToggleSupervisorSelection}
        onToggleProjectSelection={handleToggleProjectSelection}
      />

      <PMAGSuccessModal
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        registeredUser={registeredUser}
        projects={projects}
      />

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {/* Excel-style Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#F3F3F3] dark:bg-[#2B2B2B] border-b-2 border-[#999999]">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-black dark:text-white">📋 Submission History</h2>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ({historyEntries.length} entries)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                id="history-filter"
                value={historyFilter?.toString() || "all"}
                onChange={(e) => {
                  const days = e.target.value === "all" ? null : parseInt(e.target.value);
                  setHistoryFilter(days);
                  loadHistoryEntries(days);
                }}
                className="border border-[#999999] rounded px-3 py-1.5 text-sm bg-white dark:bg-[#1E1E1E] text-black dark:text-white"
              >
                <option value="all">All time</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
              <button
                onClick={() => loadHistoryEntries(historyFilter)}
                className="px-3 py-1.5 text-sm bg-white dark:bg-[#1E1E1E] border border-[#999999] rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
              >
                ⟳ Refresh
              </button>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 border border-[#999999] rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-black dark:text-white"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Excel-style Table Container */}
          <div className="flex-1 overflow-auto bg-white dark:bg-[#1E1E1E]">
            {historyEntries.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No history entries found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filter settings</p>
              </div>
            ) : (
              <table className="w-full border-collapse" style={{ border: "2px solid #999999", minWidth: "900px" }}>
                {/* Excel-style Header */}
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    <th style={{
                      backgroundColor: "#f1f5f9",
                      color: "#000000",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "10px 8px",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #94a3b8",
                      borderRight: "1px solid #cbd5e1",
                      borderLeft: "2px solid #999999",
                      borderTop: "2px solid #999999",
                      width: "80px"
                    }}>
                      ENTRY ID
                    </th>
                    <th style={{
                      backgroundColor: "#f1f5f9",
                      color: "#000000",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "10px 8px",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #94a3b8",
                      borderRight: "1px solid #cbd5e1",
                      borderTop: "2px solid #999999",
                      width: "180px"
                    }}>
                      SHEET TYPE
                    </th>
                    <th style={{
                      backgroundColor: "#f1f5f9",
                      color: "#000000",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "10px 8px",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #94a3b8",
                      borderRight: "1px solid #cbd5e1",
                      borderTop: "2px solid #999999",
                      width: "150px"
                    }}>
                      PROJECT
                    </th>
                    <th style={{
                      backgroundColor: "#f1f5f9",
                      color: "#000000",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "10px 8px",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #94a3b8",
                      borderRight: "1px solid #cbd5e1",
                      borderTop: "2px solid #999999",
                      width: "130px"
                    }}>
                      SUBMITTED BY
                    </th>
                    <th style={{
                      backgroundColor: "#f1f5f9",
                      color: "#000000",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "10px 8px",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #94a3b8",
                      borderRight: "1px solid #cbd5e1",
                      borderTop: "2px solid #999999",
                      width: "150px"
                    }}>
                      SUBMITTED DATE
                    </th>
                    <th style={{
                      backgroundColor: "#86efac",
                      color: "#000000",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "10px 8px",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #94a3b8",
                      borderRight: "1px solid #cbd5e1",
                      borderTop: "2px solid #999999",
                      width: "120px"
                    }}>
                      STATUS
                    </th>
                    <th style={{
                      backgroundColor: "#3b82f6",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "10px 8px",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #94a3b8",
                      borderRight: "2px solid #999999",
                      borderTop: "2px solid #999999",
                      width: "100px"
                    }}>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyEntries.map((entry: any, index: number) => {
                    const isEvenRow = index % 2 === 0;
                    const rowBg = isEvenRow ? "#FFFFFF" : "#F8FBFF";
                    const darkRowBg = isEvenRow ? "#1E1E1E" : "#242424";

                    return (
                      <tr key={entry.id} className="hover:bg-[#EAF2FB] dark:hover:bg-[#2E3238]">
                        <td style={{
                          backgroundColor: rowBg,
                          padding: "8px",
                          fontSize: "12px",
                          textAlign: "center",
                          borderBottom: "1px solid #D4D4D4",
                          borderRight: "1px solid #D4D4D4",
                          borderLeft: "2px solid #999999",
                          color: "#2563eb",
                          fontWeight: "bold"
                        }} className="dark:!bg-[#1E1E1E]">
                          #{entry.id}
                        </td>
                        <td style={{
                          backgroundColor: rowBg,
                          padding: "8px",
                          fontSize: "12px",
                          textAlign: "left",
                          borderBottom: "1px solid #D4D4D4",
                          borderRight: "1px solid #D4D4D4",
                          color: "#000000",
                          textTransform: "capitalize"
                        }} className="dark:!bg-[#1E1E1E] dark:!text-white">
                          {entry.sheet_type?.replace(/_/g, ' ')}
                        </td>
                        <td style={{
                          backgroundColor: rowBg,
                          padding: "8px",
                          fontSize: "12px",
                          textAlign: "left",
                          borderBottom: "1px solid #D4D4D4",
                          borderRight: "1px solid #D4D4D4",
                          color: "#000000"
                        }} className="dark:!bg-[#1E1E1E] dark:!text-white">
                          {entry.project_name || 'N/A'}
                        </td>
                        <td style={{
                          backgroundColor: rowBg,
                          padding: "8px",
                          fontSize: "12px",
                          textAlign: "center",
                          borderBottom: "1px solid #D4D4D4",
                          borderRight: "1px solid #D4D4D4",
                          color: "#000000"
                        }} className="dark:!bg-[#1E1E1E] dark:!text-white">
                          {entry.supervisor_name || 'Supervisor'}
                        </td>
                        <td style={{
                          backgroundColor: rowBg,
                          padding: "8px",
                          fontSize: "11px",
                          textAlign: "center",
                          borderBottom: "1px solid #D4D4D4",
                          borderRight: "1px solid #D4D4D4",
                          color: "#666666"
                        }} className="dark:!bg-[#1E1E1E] dark:!text-gray-400">
                          {entry.created_at ? new Date(entry.created_at).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </td>
                        <td style={{
                          backgroundColor: rowBg,
                          padding: "8px",
                          fontSize: "11px",
                          textAlign: "center",
                          borderBottom: "1px solid #D4D4D4",
                          borderRight: "1px solid #D4D4D4"
                        }} className="dark:!bg-[#1E1E1E]">
                          <span style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "600",
                            backgroundColor:
                              entry.status === 'final_approved' || entry.status === 'archived' ? '#dcfce7' :
                                entry.status === 'rejected' ? '#fee2e2' :
                                  entry.status === 'pm_approved' ? '#dbeafe' :
                                    '#fef3c7',
                            color:
                              entry.status === 'final_approved' || entry.status === 'archived' ? '#166534' :
                                entry.status === 'rejected' ? '#991b1b' :
                                  entry.status === 'pm_approved' ? '#1e40af' :
                                    '#92400e'
                          }}>
                            {entry.status === 'final_approved' ? '✓ APPROVED' :
                              entry.status === 'archived' ? '📦 ARCHIVED' :
                                entry.status === 'rejected' ? '✕ REJECTED' :
                                  entry.status === 'pm_approved' ? '⏳ PM APPROVED' :
                                    (entry.status?.replace(/_/g, ' ').toUpperCase() || 'DRAFT')}
                          </span>
                        </td>
                        <td style={{
                          backgroundColor: rowBg,
                          padding: "8px",
                          textAlign: "center",
                          borderBottom: "1px solid #D4D4D4",
                          borderRight: "2px solid #999999"
                        }} className="dark:!bg-[#1E1E1E]">
                          <button
                            onClick={() => {
                              setSelectedArchivedEntry(entry);
                              setShowHistoryModal(false);
                              setShowArchivedModal(true);
                            }}
                            style={{
                              backgroundColor: "#2563eb",
                              color: "#ffffff",
                              padding: "5px 12px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "600",
                              border: "none",
                              cursor: "pointer"
                            }}
                            className="hover:bg-blue-700 transition-colors"
                          >
                            👁 View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Status Bar */}
          <div className="px-4 py-2 bg-[#F4F4F4] dark:bg-[#252525] border-t-2 border-[#999999] flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Showing {historyEntries.length} of {historyEntries.length} entries
            </span>
            <span className="text-xs text-gray-500">
              {historyFilter ? `Filtered: Last ${historyFilter} days` : 'All time'}
            </span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archived List Modal */}
      <Dialog open={showArchivedListModal} onOpenChange={setShowArchivedListModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Archived Entries</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {archivedEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No archived entries found</p>
              </div>
            ) : (
              archivedEntries.map((entry: any) => (
                <div key={entry.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Entry #{entry.id}</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Sheet:</span> {entry.sheet_type?.replace(/_/g, ' ')}</p>
                        <p><span className="font-medium">Project:</span> {entry.project_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Submitted by:</span> {entry.supervisor_name || 'Supervisor'}</p>
                        <p><span className="font-medium">Status:</span> Final Approved</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center md:items-end">
                      <button
                        onClick={() => {
                          setSelectedArchivedEntry(entry);
                          setShowArchivedListModal(false);
                          setShowArchivedModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowArchivedListModal(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archived Entry Detail Modal - Excel Style */}
      <Dialog open={showArchivedModal} onOpenChange={setShowArchivedModal}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col p-0">
          {selectedArchivedEntry && (
            <>
              {/* Excel-style Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#F3F3F3] dark:bg-[#2B2B2B] border-b-2 border-[#999999]">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-black dark:text-white">
                    📊 {selectedArchivedEntry.sheet_type?.replace(/_/g, ' ').toUpperCase() || 'Sheet Details'}
                  </h2>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Entry #{selectedArchivedEntry.id}
                  </span>
                  <span style={{
                    padding: "3px 10px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: "600",
                    backgroundColor:
                      selectedArchivedEntry.status === 'final_approved' || selectedArchivedEntry.status === 'archived' ? '#dcfce7' :
                        selectedArchivedEntry.status === 'rejected' ? '#fee2e2' :
                          selectedArchivedEntry.status === 'pm_approved' ? '#dbeafe' :
                            '#fef3c7',
                    color:
                      selectedArchivedEntry.status === 'final_approved' || selectedArchivedEntry.status === 'archived' ? '#166534' :
                        selectedArchivedEntry.status === 'rejected' ? '#991b1b' :
                          selectedArchivedEntry.status === 'pm_approved' ? '#1e40af' :
                            '#92400e'
                  }}>
                    {selectedArchivedEntry.status?.replace(/_/g, ' ').toUpperCase() || 'DRAFT'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Submitted by: <strong>{selectedArchivedEntry.supervisor_name || 'Supervisor'}</strong>
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(selectedArchivedEntry.updated_at || selectedArchivedEntry.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    onClick={() => setShowArchivedModal(false)}
                    className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 border border-[#999999] rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-black dark:text-white"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Excel-style Content Area */}
              <div className="flex-1 overflow-auto bg-white dark:bg-[#1E1E1E] p-4">
                {(() => {
                  const entryData = typeof selectedArchivedEntry.data_json === 'string'
                    ? JSON.parse(selectedArchivedEntry.data_json)
                    : selectedArchivedEntry.data_json;

                  return (
                    <>
                      {/* Static Header Info */}
                      {entryData?.staticHeader && (
                        <div className="mb-4 rounded-lg overflow-hidden" style={{ border: "2px solid #999999" }}>
                          <div className="bg-[#f1f5f9] dark:bg-[#2B2B2B] px-4 py-2 border-b-2 border-[#94a3b8]">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">📋 Project Information</span>
                          </div>
                          <div className="bg-white dark:bg-[#1E1E1E] p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 uppercase">Project:</span>
                              <span className="text-sm font-medium text-black dark:text-white">{entryData.staticHeader.projectInfo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 uppercase">Reporting Date:</span>
                              <span className="text-sm font-medium text-black dark:text-white">{entryData.staticHeader.reportingDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 uppercase">Progress Date:</span>
                              <span className="text-sm font-medium text-black dark:text-white">{entryData.staticHeader.progressDate}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Excel-style Data Table */}
                      {entryData?.rows && entryData.rows.length > 0 && (
                        <div className="overflow-x-auto rounded-lg" style={{ border: "2px solid #999999" }}>
                          <table className="w-full border-collapse" style={{ minWidth: "100%" }}>
                            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                              <tr>
                                {Object.keys(entryData.rows[0]).map((key, index) => (
                                  <th
                                    key={key}
                                    style={{
                                      backgroundColor: "#f1f5f9",
                                      color: "#000000",
                                      fontSize: "10px",
                                      fontWeight: "700",
                                      padding: "10px 8px",
                                      textAlign: "center",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                      borderBottom: "2px solid #94a3b8",
                                      borderRight: index === Object.keys(entryData.rows[0]).length - 1 ? "none" : "1px solid #cbd5e1",
                                      whiteSpace: "nowrap",
                                      minWidth: "80px"
                                    }}
                                  >
                                    {key.replace(/([A-Z])/g, ' $1').trim().replace(/_/g, ' ')}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {entryData.rows.map((row: any, rowIndex: number) => {
                                const isEvenRow = rowIndex % 2 === 0;
                                const rowBg = isEvenRow ? "#FFFFFF" : "#F8FBFF";

                                return (
                                  <tr key={rowIndex} className="hover:bg-[#EAF2FB] dark:hover:bg-[#2E3238]">
                                    {Object.values(row).map((value: any, colIndex: number) => (
                                      <td
                                        key={`${rowIndex}-${colIndex}`}
                                        style={{
                                          backgroundColor: rowBg,
                                          padding: "8px 10px",
                                          fontSize: "12px",
                                          textAlign: typeof value === 'number' ? "right" : "left",
                                          borderBottom: "1px solid #D4D4D4",
                                          borderRight: colIndex === Object.values(row).length - 1 ? "none" : "1px solid #D4D4D4",
                                          color: "#000000",
                                          whiteSpace: "nowrap"
                                        }}
                                        className="dark:!bg-[#1E1E1E] dark:!text-white"
                                      >
                                        {value !== null && value !== undefined && value !== '' ? value : '-'}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Total Manpower (if applicable) */}
                      {entryData?.totalManpower !== undefined && (
                        <div className="mt-4 rounded-lg overflow-hidden" style={{ border: "2px solid #22c55e" }}>
                          <div className="bg-[#86efac] px-4 py-2 border-b-2 border-[#22c55e]">
                            <span className="text-xs font-bold text-green-800 uppercase tracking-wider">📊 Summary</span>
                          </div>
                          <div className="bg-[#dcfce7] dark:bg-green-900/30 p-4">
                            <p className="text-lg font-bold text-green-800 dark:text-green-400">
                              Total Manpower: {entryData.totalManpower}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Show message if no data */}
                      {(!entryData?.rows || entryData.rows.length === 0) && !entryData?.staticHeader && (
                        <div className="text-center py-16">
                          <div className="text-6xl mb-4">📭</div>
                          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No data available for this entry</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Footer Status Bar */}
              <div className="px-4 py-2 bg-[#F4F4F4] dark:bg-[#252525] border-t-2 border-[#999999] flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {(() => {
                    const entryData = typeof selectedArchivedEntry.data_json === 'string'
                      ? JSON.parse(selectedArchivedEntry.data_json)
                      : selectedArchivedEntry.data_json;
                    const rowCount = entryData?.rows?.length || 0;
                    const colCount = entryData?.rows?.[0] ? Object.keys(entryData.rows[0]).length : 0;
                    return `${rowCount} rows × ${colCount} columns`;
                  })()}
                </span>
                <span className="text-xs text-gray-500">
                  Project ID: {selectedArchivedEntry.project_id} | Sheet: {selectedArchivedEntry.sheet_type?.replace(/_/g, ' ')}
                </span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Snapshot Filter Modal */}
      <SnapshotFilterModal
        isOpen={showSnapshotFilter}
        onClose={() => setShowSnapshotFilter(false)}
        projects={projects}
      />
    </DashboardLayout>
  );
};

export default PMAGDashboard;