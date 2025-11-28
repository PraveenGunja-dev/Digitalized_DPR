import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ExcelSheet } from "@/components/ExcelSheet";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, Package, DollarSign, Plus, Download, Calendar, AlertCircle } from "lucide-react";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { getAssignedProjects } from "@/modules/auth/services/projectService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the Issue interface
interface Issue {
  id: string;
  description: string;
  startDate: string;
  finishedDate: string | null;
  delayedDays: number;
  status: "Open" | "In Progress" | "Resolved";
  actionRequired: string;
  remarks: string;
  attachment: File | null;
  attachmentName: string | null;
}

// Function to format date as YYYY-MM-DD
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Not set";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const SupervisorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  console.log("SupervisorDashboard component loaded", { user, token });
  
  // Extract project data from location state
  const locationState = location.state || {};
  const projectName = locationState.projectName || "Project";
  const projectId = locationState.projectId || null;
  const projectDetails = locationState.projectDetails || null;
  const openAddIssueModal = locationState.openAddIssueModal || false;
  const initialActiveTab = locationState.activeTab || "daily-input";

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  
  // State for issues
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isAddIssueModalOpen, setIsAddIssueModalOpen] = useState(false);
  
  // Form state for new issue
  const [newIssue, setNewIssue] = useState({
    description: "",
    startDate: "",
    finishedDate: "",
    status: "Open" as "Open" | "In Progress" | "Resolved",
    actionRequired: "",
    remarks: "",
    attachment: null as File | null,
  });
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Open the add issue modal when navigated with openAddIssueModal flag
  useEffect(() => {
    if (openAddIssueModal) {
      setActiveTab("issues"); // Switch to issues tab
      setIsAddIssueModalOpen(true);
      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true, state: { ...locationState, openAddIssueModal: false } });
    }
  }, [openAddIssueModal, navigate, location.pathname, locationState]);

  // Fetch assigned projects
  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        const projects = await getAssignedProjects();
        setAssignedProjects(projects);
      } catch (error) {
        toast.error("Failed to fetch assigned projects");
      }
    };

    if (token) {
      fetchAssignedProjects();
    }
  }, [token]);

  // Daily Input Sheet Data
  const dailyInputColumns = [
    "Date",
    "Shift",
    "Activity Code",
    "Activity Description",
    "Resource Type",
    "Quantity Used",
    "Unit",
    "Progress %",
    "Remarks",
  ];

  const dailyInputRows = [
    [
      { value: "2024-01-15", readOnly: true, columnType: "date" as const },
      { value: "Morning", readOnly: true, columnType: "text" as const },
      { value: "ACT-001", readOnly: true, columnType: "text" as const },
      { value: "Concrete Foundation Work", readOnly: true, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
    ],
    [
      { value: "2024-01-15", readOnly: true, columnType: "date" as const },
      { value: "Evening", readOnly: true, columnType: "text" as const },
      { value: "ACT-002", readOnly: true, columnType: "text" as const },
      { value: "Steel Reinforcement", readOnly: true, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
    ],
  ];

  // Material Tracking Sheet Data
  const materialColumns = [
    "Date",
    "Material Name",
    "Supplier",
    "Invoice Number",
    "Quantity Received",
    "Unit",
    "Unit Price",
    "Total Cost",
    "Remarks",
  ];

  const materialRows = [
    [
      { value: "2024-01-15", readOnly: true, columnType: "date" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: true, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
    ],
  ];

  // Cost Tracking Sheet Data
  const costColumns = [
    "Date",
    "Expense Category",
    "Description",
    "Amount",
    "Payment Method",
    "Vendor",
    "Remarks",
  ];

  const costRows = [
    [
      { value: "2024-01-15", readOnly: true, columnType: "date" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "text" as const },
    ],
  ];

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewIssue({
        ...newIssue,
        attachment: e.target.files[0],
      });
    }
  };

  // Calculate delayed days
  const calculateDelayedDays = (startDate: string, finishedDate: string | null): number => {
    if (!finishedDate) return 0;
    const start = new Date(startDate);
    const finish = new Date(finishedDate);
    const diffTime = Math.abs(finish.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newIssue.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!newIssue.startDate) {
      newErrors.startDate = "Start date is required";
    }
    
    if (!newIssue.status) {
      newErrors.status = "Status is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    const delayedDays = calculateDelayedDays(newIssue.startDate, newIssue.finishedDate || null);
    
    const issue: Issue = {
      id: Math.random().toString(36).substr(2, 9),
      description: newIssue.description,
      startDate: newIssue.startDate,
      finishedDate: newIssue.finishedDate || null,
      delayedDays,
      status: newIssue.status,
      actionRequired: newIssue.actionRequired,
      remarks: newIssue.remarks,
      attachment: newIssue.attachment,
      attachmentName: newIssue.attachment ? newIssue.attachment.name : null,
    };
    
    setIssues([...issues, issue]);
    setIsAddIssueModalOpen(false);
    
    // Reset form
    setNewIssue({
      description: "",
      startDate: "",
      finishedDate: "",
      status: "Open",
      actionRequired: "",
      remarks: "",
      attachment: null,
    });
    
    setErrors({});
    
    toast.success("Issue created successfully!");
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewIssue({
      ...newIssue,
      [name]: value,
    });
  };

  // Handle select changes
  const handleSelectChange = (value: "Open" | "In Progress" | "Resolved") => {
    setNewIssue({
      ...newIssue,
      status: value,
    });
  };

  // Handle add issue from dropdown
  const handleAddIssue = () => {
    setIsAddIssueModalOpen(true);
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar 
        userName={user?.Name || "User"} 
        userRole={user?.Role || "supervisor"} 
        projectName={projectName}
        onAddUser={() => alert("Add User functionality is only available for PMAG users")}
        onAddProject={() => alert("Add Project functionality is only available for PMAG users")}
        onAssignProject={() => alert("Assign Project functionality is only available for PMAG users")}
        onAddIssue={() => setIsAddIssueModalOpen(true)}
      />
      
      {/* Add Issue Log Modal - Always available regardless of active tab */}
      <Dialog open={isAddIssueModalOpen} onOpenChange={(open) => {
        setIsAddIssueModalOpen(open);
        // Reset form when dialog is closed
        if (!open) {
          setNewIssue({
            description: "",
            startDate: "",
            finishedDate: "",
            status: "Open",
            actionRequired: "",
            remarks: "",
            attachment: null,
          });
          setErrors({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3 
            }}
          >
            <DialogHeader>
              <DialogTitle>Add New Issue Log</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description of Hindrance *
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={newIssue.description}
                  onChange={handleInputChange}
                  placeholder="Enter description of the hindrance..."
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={newIssue.startDate}
                      onChange={handleInputChange}
                      className={errors.startDate ? "border-red-500" : ""}
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="finishedDate" className="text-sm font-medium">
                    Finished Date
                  </label>
                  <div className="relative">
                    <Input
                      id="finishedDate"
                      name="finishedDate"
                      type="date"
                      value={newIssue.finishedDate}
                      onChange={handleInputChange}
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Issue Status *
                </label>
                <Select value={newIssue.status} onValueChange={handleSelectChange}>
                  <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="actionRequired" className="text-sm font-medium">
                  Action Required
                </label>
                <Textarea
                  id="actionRequired"
                  name="actionRequired"
                  value={newIssue.actionRequired}
                  onChange={handleInputChange}
                  placeholder="Enter required actions..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="remarks" className="text-sm font-medium">
                  Remarks
                </label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  value={newIssue.remarks}
                  onChange={handleInputChange}
                  placeholder="Enter any additional remarks..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="attachment" className="text-sm font-medium">
                  Attachment
                </label>
                <Input
                  id="attachment"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddIssueModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Issue Log</Button>
              </div>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 0.5 
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1 
                className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Welcome, {user?.Name || "Supervisor"}
              </motion.h1>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {projectName ? `Project: ${projectName}` : "Project dashboard for supervisor activities"}
              </motion.p>
              {projectDetails && (
                <motion.div 
                  className="mt-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <p>Plan: {formatDate(projectDetails.PlannedStartDate)} to {formatDate(projectDetails.PlannedFinishDate)}</p>
                  <p>Actual: {formatDate(projectDetails.ActualStartDate) || "Not started"} to {formatDate(projectDetails.ActualFinishDate) || "Not completed"}</p>
                </motion.div>
              )}
            </div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Add Issue Button in Dashboard */}
              <Button onClick={handleAddIssue} className="bg-orange-500 hover:bg-orange-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Add Issue Log
              </Button>
              
              <div className="bg-primary/10 px-4 py-2 rounded-lg">
                <div className="flex items-center">
                  <FileSpreadsheet className="w-5 h-5 text-primary mr-2" />
                  <span className="font-medium">Sheet Submission</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="daily-input" className="flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Daily Input Sheet
              </TabsTrigger>
              <TabsTrigger value="material" className="flex items-center justify-center">
                <Package className="w-4 h-4 mr-2" />
                Material Tracking
              </TabsTrigger>
              <TabsTrigger value="cost" className="flex items-center justify-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Cost Tracking
              </TabsTrigger>
              <TabsTrigger value="issues" className="flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Issues ({issues.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily-input">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  duration: 0.4 
                }}
                className="w-full"
              >
                <Card className="p-2">
                  <ExcelSheet
                    title="Daily Input Sheet"
                    columns={dailyInputColumns}
                    rows={dailyInputRows}
                    onSubmit={() => toast.success("Daily input sheet submitted successfully!")}
                  />
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="material">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  duration: 0.4 
                }}
                className="w-full"
              >
                <Card className="p-2">
                  <ExcelSheet
                    title="Material Tracking Sheet"
                    columns={materialColumns}
                    rows={materialRows}
                    onSubmit={() => toast.success("Material tracking sheet submitted successfully!")}
                  />
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="cost">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  duration: 0.4 
                }}
                className="w-full"
              >
                <Card className="p-2">
                  <ExcelSheet
                    title="Cost Tracking Sheet"
                    columns={costColumns}
                    rows={costRows}
                    onSubmit={() => toast.success("Cost tracking sheet submitted successfully!")}
                  />
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="issues">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  duration: 0.4 
                }}
                className="w-full"
              >
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center">
                      <AlertCircle className="w-6 h-6 mr-2 text-primary" />
                      Issues Tracking
                    </h2>
                    <Button onClick={() => setIsAddIssueModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Issue Log
                    </Button>
                  </div>

                  {issues.length > 0 ? (
                    <ExcelSheet
                      title="Issue Logs"
                      columns={[
                        "Description",
                        "Start Date",
                        "Finished Date",
                        "Delayed Days",
                        "Status",
                        "Action Required",
                        "Remarks",
                        "Attachment"
                      ]}
                      rows={issues.map(issue => [
                        { value: issue.description, readOnly: true, columnType: "text" },
                        { value: issue.startDate, readOnly: true, columnType: "date" },
                        { value: issue.finishedDate || "N/A", readOnly: true, columnType: "text" },
                        { value: issue.delayedDays.toString(), readOnly: true, columnType: "number" },
                        { value: issue.status, readOnly: true, columnType: "dropdown", options: ["Open", "In Progress", "Resolved"] },
                        { value: issue.actionRequired || "N/A", readOnly: true, columnType: "text" },
                        { value: issue.remarks || "N/A", readOnly: true, columnType: "text" },
                        { value: issue.attachmentName || "N/A", readOnly: true, columnType: "text" }
                      ])}
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="mx-auto h-12 w-12 opacity-50" />
                      <h3 className="mt-2 text-lg font-medium">No issues reported</h3>
                      <p className="mt-1">Get started by adding a new issue.</p>
                      <div className="mt-4">
                        <Button onClick={() => setIsAddIssueModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Issue Log
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default SupervisorDashboard;