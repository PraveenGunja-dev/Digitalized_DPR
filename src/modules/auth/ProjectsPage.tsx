import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, MapPin, Users, FileText, Loader2, AlertTriangle, Plus, UserPlus } from "lucide-react";
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { getUserProjects, getAssignedProjects } from "./services/projectService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerUser } from "./services/authService";
import { createProject, assignProjectToSupervisor } from "./services/projectService";
import { getAllSupervisors } from "./services/authService";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modals
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  
  // State for forms
  const [projectForm, setProjectForm] = useState({
    Name: "",
    Location: "",
    Status: "planning",
    PercentComplete: 0,
    PlannedStartDate: "",
    PlannedFinishDate: ""
  });
  
  const getDefaultRole = () => {
    if (!user?.Role) return "supervisor";
    
    // PMAG can create Site PM and PMAG users, default to Site PM
    if (user.Role === "PMAG") {
      return "Site PM";
    }
    
    // Site PM can only create supervisors
    if (user.Role === "Site PM") {
      return "supervisor";
    }
    
    // Default to supervisor for other roles
    return "supervisor";
  };
  
  const [registerForm, setRegisterForm] = useState({
    Name: "",
    Email: "",
    password: "",
    Role: getDefaultRole() as "supervisor" | "Site PM" | "PMAG",
    assignProject: false,
    ProjectId: "" as string | number
  });
  
  // Determine available roles based on current user's role
  const getAvailableRoles = () => {
    if (!user?.Role) return [];
    
    // PMAG can create Site PM and PMAG users
    if (user.Role === "PMAG") {
      return [
        { value: "Site PM", label: "Site PM" },
        { value: "PMAG", label: "PMAG" }
      ];
    }
    
    // Site PM can only create supervisors
    if (user.Role === "Site PM") {
      return [
        { value: "supervisor", label: "Supervisor" }
      ];
    }
    
    // Supervisors cannot create users
    return [];
  };
  
  const [loadingState, setLoadingState] = useState({
    createUser: false,
    createProject: false
  });
  
  // State for data
  const [supervisors, setSupervisors] = useState<any[]>([]);

  // Update the default role when user role changes
  useEffect(() => {
    setRegisterForm(prev => ({
      ...prev,
      Role: getDefaultRole()
    }));
  }, [user?.Role]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Log user data for debugging
        console.log("User data in ProjectsPage:", user);
        console.log("User role:", user?.Role);
        
        // Fetch projects based on user role
        let projectsData: any[] = [];
        if (user?.Role === "supervisor") {
          console.log("Fetching assigned projects for supervisor");
          projectsData = await getAssignedProjects();
        } else {
          console.log("Fetching all projects for", user?.Role);
          projectsData = await getUserProjects();
        }
        
        console.log("Projects fetched:", projectsData);
        setProjects(projectsData);
      } catch (err) {
        setError("Failed to fetch projects");
        toast.error("Failed to fetch projects");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      fetchProjects();
    }
  }, [token, user]);

  const handleProjectSelect = (project: any) => {
    if (!user) return;
    
    // Log the navigation for debugging
    console.log("Navigating to dashboard for role:", user.Role);
    console.log("Project data:", project);
    
    // Navigate based on user role
    switch (user.Role) {
      case "supervisor":
        navigate("/supervisor", { 
          state: { 
            user,
            projectId: project.ObjectId, 
            projectName: project.Name,
            projectDetails: project
          } 
        });
        break;
        
      case "Site PM":
        navigate("/pm", { 
          state: { 
            user,
            projectId: project.ObjectId, 
            projectName: project.Name,
            projectDetails: project
          } 
        });
        break;
        
      case "PMAG":
        navigate("/pmrg", { 
          state: { 
            user,
            projectId: project.ObjectId, 
            projectName: project.Name,
            projectDetails: project
          } 
        });
        break;
        
      default:
        // For any other role, show an error with the actual role
        console.error("Unsupported user role:", user.Role);
        toast.error(`Unsupported user role: ${user.Role}`);
        break;
    }
  };

  // Handle form changes
  const handleProjectFormChange = (field: string, value: string | number) => {
    setProjectForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegisterFormChange = (field: string, value: string | boolean) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle project creation
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState(prev => ({ ...prev, createProject: true }));
    
    try {
      const projectData = {
        Name: projectForm.Name,
        Location: projectForm.Location,
        Status: projectForm.Status,
        PercentComplete: projectForm.PercentComplete,
        PlannedStartDate: projectForm.PlannedStartDate,
        PlannedFinishDate: projectForm.PlannedFinishDate,
        ActualStartDate: null,
        ActualFinishDate: null
      };
      
      await createProject(projectData);
      
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
      
      // Refresh projects list
      const projectsData = await getUserProjects();
      setProjects(projectsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Project creation failed');
    } finally {
      setLoadingState({ ...loadingState, createProject: false });
    }
  };

  // Handle user registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState(prev => ({ ...prev, createUser: true }));
    
    try {
      const userData = {
        Name: registerForm.Name,
        Email: registerForm.Email,
        password: registerForm.password,
        Role: registerForm.Role
      };
      
      const registeredUserResponse = await registerUser(userData);
      
      // If assignProject is checked and a project is selected, assign the project
      if (registerForm.assignProject && registerForm.ProjectId) {
        try {
          // Ensure we're passing numbers to the API
          const projectId = parseInt(registerForm.ProjectId.toString());
          // For supervisors, we use the user's ObjectId; for other roles, we might need to handle differently
          const userId = registeredUserResponse.user.ObjectId;
          
          console.log('Assigning project:', { projectId, userId });
          
          await assignProjectToSupervisor(projectId, userId);
          toast.success(`User created and project assigned successfully!`);
        } catch (assignError) {
          console.error('Project assignment error:', assignError);
          toast.warning(`User created but project assignment failed: ${(assignError as Error).message}`);
        }
      } else {
        toast.success("User created successfully!");
      }
      
      setShowCreateUserModal(false);
      
      // Reset form
      setRegisterForm({
        Name: "",
        Email: "",
        password: "",
        Role: getDefaultRole(),
        assignProject: false,
        ProjectId: ""
      });
      
      // Refresh projects list
      const projectsData = await getUserProjects();
      setProjects(projectsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'User creation failed');
    } finally {
      setLoadingState({ ...loadingState, createUser: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Projects</h3>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mr-2"
          >
            Retry
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        userName={user?.Name || "User"} 
        userRole={user?.Role} 
        onAddUser={() => setShowCreateUserModal(true)}
        onAddProject={() => setShowCreateProjectModal(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Projects
              </h1>
              <p className="text-muted-foreground">
                {user?.Role === "supervisor" 
                  ? "Select a project to manage your daily activities" 
                  : "Select a project to view and manage"}
              </p>
            </div>
            
            {/* PMAG-specific buttons */}
          </div>
        </motion.div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
            <p className="text-muted-foreground mb-6">
              {user?.Role === "supervisor"
                ? "You haven't been assigned to any projects yet."
                : "There are no projects available at the moment."}
            </p>
            {/* PMAG-specific buttons in empty state */}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              // Ensure we have a unique key even if ObjectId is missing
              const uniqueKey = project.ObjectId ? `project-${project.ObjectId}` : `project-index-${index}`;
              
              return (
                <motion.div
                  key={`motion-${uniqueKey}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    key={`card-${uniqueKey}`}
                    className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary"
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{project.Name}</h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{project.Location || "Location not specified"}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {project.PlannedStartDate ? new Date(project.PlannedStartDate).toLocaleDateString() : "N/A"} - 
                          {project.PlannedFinishDate ? new Date(project.PlannedFinishDate).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="capitalize">{project.Status || "Status unknown"}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{project.PercentComplete || 0}%</span>
                      </div>
                      <div className="mt-2 w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${project.PercentComplete || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={registerForm.Name}
                onChange={(e) => handleRegisterFormChange("Name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={registerForm.Email}
                onChange={(e) => handleRegisterFormChange("Email", e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={registerForm.password}
                onChange={(e) => handleRegisterFormChange("password", e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select 
                value={registerForm.Role} 
                onValueChange={(value) => handleRegisterFormChange("Role", value as any)}
                disabled={getAvailableRoles().length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles().map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getAvailableRoles().length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.Role === "supervisor" 
                    ? "Supervisors cannot create users" 
                    : "No roles available for your user type"}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="assignProject"
                checked={registerForm.assignProject}
                onChange={(e) => handleRegisterFormChange("assignProject", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="assignProject">Assign project to this user (cannot be changed later)</Label>
            </div>
            {/* Project assignment functionality - only available during user creation */}
            {registerForm.assignProject && (
              <div>
                <Label htmlFor="project">Project</Label>
                <Select 
                  value={registerForm.ProjectId.toString()} 
                  onValueChange={(value) => handleRegisterFormChange("ProjectId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => {
                      // Ensure we have a valid value for the SelectItem
                      const value = (project.ObjectId || project.id || '').toString();
                      
                      // Skip items with empty values
                      if (!value) return null;
                      
                      return (
                        <SelectItem 
                          key={project.ObjectId || project.id || project.Name} 
                          value={value}
                        >
                          {project.Name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateUserModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loadingState.createUser}>
                {loadingState.createUser ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Project Modal */}
      <Dialog open={showCreateProjectModal} onOpenChange={setShowCreateProjectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectForm.Name}
                onChange={(e) => handleProjectFormChange("Name", e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={projectForm.Location}
                onChange={(e) => handleProjectFormChange("Location", e.target.value)}
                placeholder="Enter location"
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={projectForm.Status} onValueChange={(value) => handleProjectFormChange("Status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={projectForm.PlannedStartDate}
                  onChange={(e) => handleProjectFormChange("PlannedStartDate", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={projectForm.PlannedFinishDate}
                  onChange={(e) => handleProjectFormChange("PlannedFinishDate", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateProjectModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loadingState.createProject}>
                {loadingState.createProject ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ProjectsPage;