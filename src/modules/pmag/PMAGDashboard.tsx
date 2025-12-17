import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { useNotification } from "@/modules/auth/contexts/NotificationContext";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { 
  PMAGDashboardSummary,
  PMAGSheetEntries,
  PMAGChartsSection,
  PMAGUserManagementModals,
  PMAGSuccessModal
} from "./components";
import { fetchData, fetchApprovedEntries, finalApproveEntry, rejectEntry } from "./services";

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
        approvedEntries={approvedEntries}
        historyEntries={historyEntries}
        archivedEntries={archivedEntries}
      />

      <PMAGSheetEntries
        approvedEntries={approvedEntries}
        loadingEntries={loadingEntries}
        onRefresh={loadApprovedEntries}
        onFinalApprove={handleFinalApprove}
        onReject={handleReject}
        expandedEntries={expandedEntries}
        setExpandedEntries={setExpandedEntries}
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
    </DashboardLayout>
  );
};

export default PMAGDashboard;