import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, MapPin, Users, FileText, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { getUserProjects, getAssignedProjects } from "./services/projectService";
import { toast } from "sonner";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <Navbar userName={user?.Name || "User"} userRole={user?.Role} />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Projects
          </h1>
          <p className="text-muted-foreground">
            {user?.Role === "supervisor" 
              ? "Select a project to manage your daily activities" 
              : "Select a project to view and manage"}
          </p>
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
            {user?.Role === "PMAG" && (
              <Button onClick={() => navigate("/pmrg")}>
                Go to PMRG Dashboard
              </Button>
            )}
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
    </div>
  );
};

export default ProjectsPage;