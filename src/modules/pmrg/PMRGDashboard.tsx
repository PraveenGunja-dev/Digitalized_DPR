import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { StatsCard } from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCheck, TrendingUp, Users, Award, Activity, Plus, FolderPlus, UserPlus, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { registerUser } from "@/modules/auth/services/authService";
import { createProject, assignProjectToSupervisor, getUserProjects } from "@/modules/auth/services/projectService";
import { getAllSupervisors } from "@/modules/auth/services/authService";
import { toast } from "sonner";

// Function to format date as YYYY-MM-DD
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const PMRGDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
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
    Role: "supervisor" as "supervisor" | "Site PM" | "PMAG"
  });
  const [assignForm, setAssignForm] = useState({
    projectId: "",
    supervisorId: ""
  });
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState({
    email: '',
    password: '',
    role: ''
  });

  // Fetch projects and supervisors
  const fetchData = async () => {
    try {
      // Fetch projects
      const projectsData = await getUserProjects();
      setProjects(projectsData);
      
      // Fetch supervisors from API
      console.log("About to fetch supervisors...");
      const supervisorsData = await getAllSupervisors();
      console.log("Supervisors fetched:", supervisorsData); // Debug log
      setSupervisors(supervisorsData);
    } catch (error) {
      console.error("Failed to fetch data:", error); // Debug log
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = () => {
    setShowRegisterModal(true);
  };

  const handleCreateProject = () => {
    setShowCreateProjectModal(true);
  };

  const handleAssignProject = () => {
    console.log("Supervisors available for assignment:", supervisors); // Debug log
    console.log("Number of supervisors:", supervisors.length); // Debug log
    setShowAssignProjectModal(true);
  };

  const handleProjectFormChange = (field: string, value: string | number) => {
    setProjectForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegisterFormChange = (field: string, value: string) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAssignFormChange = (field: string, value: string) => {
    setAssignForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Project creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    
    try {
      const userData = {
        Name: registerForm.Name,
        Email: registerForm.Email,
        password: registerForm.password,
        Role: registerForm.Role
      };
      
      await registerUser(userData);
      
      // Show success modal with user details
      setRegisteredUser({
        email: registerForm.Email,
        password: registerForm.password,
        role: registerForm.Role
      });
      setShowSuccessModal(true);
      setShowRegisterModal(false);
      
      // Reset form
      setRegisterForm({
        Name: "",
        Email: "",
        password: "",
        Role: "supervisor"
      });
      
      // Refresh supervisors list to include the newly created supervisor
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignLoading(true);
    
    try {
      await assignProjectToSupervisor(
        parseInt(assignForm.projectId),
        parseInt(assignForm.supervisorId)
      );
      
      toast.success("Project assigned successfully!");
      setShowAssignProjectModal(false);
      
      // Reset form
      setAssignForm({
        projectId: "",
        supervisorId: ""
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Project assignment failed');
    } finally {
      setAssignLoading(false);
    }
  };

  const statsData = [
    { title: "Total Projects", value: projects.length, icon: FolderPlus, trend: { value: 12, isPositive: true } },
    { title: "Active Projects", value: projects.filter(p => p.Status === "active").length, icon: Activity, trend: { value: 8, isPositive: true } },
    { title: "Total Supervisors", value: supervisors.length, icon: Users, trend: { value: 3, isPositive: true } },
    { title: "Completed Projects", value: projects.filter(p => p.Status === "completed").length, icon: Award, trend: { value: 2, isPositive: true } },
  ];

  const projectChartData = projects.slice(0, 5).map(project => ({
    name: project.Name,
    progress: project.PercentComplete
  }));

  const progressData = [
    { name: 'Jan', progress: 45 },
    { name: 'Feb', progress: 52 },
    { name: 'Mar', progress: 48 },
    { name: 'Apr', progress: 78 },
    { name: 'May', progress: 65 },
    { name: 'Jun', progress: 80 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        userName={user?.Name || "User"} 
        userRole={user?.Role || "PMAG"} 
        projectName={projectName}
        onAddUser={handleCreateUser}
        onAddProject={handleCreateProject}
        onAssignProject={handleAssignProject}
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
                PMRG Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage projects, supervisors, and assignments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 px-4 py-2 rounded-lg">
                <div className="flex items-center">
                  <FileCheck className="w-5 h-5 text-primary mr-2" />
                  <span className="font-medium">Project Management</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Project Progress Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Progress Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Progress Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="progress" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recent Projects</h3>
              <Button onClick={handleCreateProject}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Project</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Progress</th>
                    <th className="text-left py-3 px-4">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map((project, index) => {
                    // Ensure we have a unique key even if ObjectId is missing
                    const uniqueKey = project.ObjectId ? `project-${project.ObjectId}` : `project-index-${index}`;
                    
                    return (
                      <tr key={uniqueKey} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{project.Name}</td>
                        <td className="py-3 px-4">{project.Location}</td>
                        <td className="py-3 px-4">
                          <Badge variant={project.Status === "active" ? "default" : project.Status === "completed" ? "secondary" : "outline"}>
                            {project.Status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-24 bg-secondary rounded-full h-2 mr-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${project.PercentComplete}%` }}
                              ></div>
                            </div>
                            <span>{project.PercentComplete}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(project.PlannedStartDate)} - {formatDate(project.PlannedFinishDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Create User Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
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
              <Select value={registerForm.Role} onValueChange={(value) => handleRegisterFormChange("Role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="Site PM">Site PM</SelectItem>
                  <SelectItem value="PMAG">PMAG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowRegisterModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={registerLoading}>
                {registerLoading ? "Creating..." : "Create User"}
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
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Project Modal */}
      <Dialog open={showAssignProjectModal} onOpenChange={setShowAssignProjectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Project to Supervisor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <Label htmlFor="project">Project</Label>
              <Select value={assignForm.projectId} onValueChange={(value) => handleAssignFormChange("projectId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
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
            <div>
              <Label htmlFor="supervisor">Supervisor</Label>
              <Select value={assignForm.supervisorId} onValueChange={(value) => handleAssignFormChange("supervisorId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor) => {
                    // Ensure we have a valid value for the SelectItem
                    const value = (supervisor.ObjectId || supervisor.id || '').toString();
                    
                    // Skip items with empty values
                    if (!value) return null;
                    
                    return (
                      <SelectItem 
                        key={supervisor.ObjectId || supervisor.id || supervisor.Name} 
                        value={value}
                      >
                        {supervisor.Name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowAssignProjectModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignLoading}>
                {assignLoading ? "Assigning..." : "Assign Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Created Successfully</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>User has been created with the following credentials:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Email:</strong> {registeredUser.email}</p>
              <p><strong>Password:</strong> {registeredUser.password}</p>
              <p><strong>Role:</strong> {registeredUser.role}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please share these credentials with the user. They can now log in to the system.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMRGDashboard;