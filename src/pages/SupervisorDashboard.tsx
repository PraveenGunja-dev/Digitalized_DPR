import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, Package, DollarSign, CheckCircle } from "lucide-react";
import { useState } from "react";
import { ExcelSheet } from "@/components/ExcelSheet";

const SupervisorDashboard = () => {
  const location = useLocation();
  const { role, project } = location.state || { role: "Supervisor", project: { name: "Project" } };
  const [activeTab, setActiveTab] = useState("daily-input");

  const handleSubmit = () => {
    // Handle submission - callback managed by ExcelSheet component
  };

  // Daily Input Sheet Data - Excel format
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
      { value: "2024-01-15", readOnly: true },
      { value: "Morning", readOnly: true },
      { value: "ACT-001", readOnly: true },
      { value: "Concrete Foundation Work", readOnly: true },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "MT", readOnly: true },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
    ],
    [
      { value: "2024-01-15", readOnly: true },
      { value: "Morning", readOnly: true },
      { value: "ACT-002", readOnly: true },
      { value: "Steel Framework Installation", readOnly: true },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "MT", readOnly: true },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
    ],
    [
      { value: "2024-01-15", readOnly: true },
      { value: "Afternoon", readOnly: true },
      { value: "ACT-003", readOnly: true },
      { value: "Electrical Wiring - Phase 1", readOnly: true },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "Units", readOnly: true },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
    ],
    [
      { value: "2024-01-15", readOnly: true },
      { value: "Afternoon", readOnly: true },
      { value: "ACT-004", readOnly: true },
      { value: "Masonry Work - Block A", readOnly: true },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "SQM", readOnly: true },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
    ],
    [
      { value: "2024-01-15", readOnly: true },
      { value: "Evening", readOnly: true },
      { value: "ACT-005", readOnly: true },
      { value: "Site Preparation & Cleaning", readOnly: true },
      { value: "", readOnly: false, columnType: "text" as const },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "Hours", readOnly: true },
      { value: "", readOnly: false, columnType: "number" as const },
      { value: "", readOnly: false, columnType: "text" as const },
    ],
  ];

  // Resources Sheet Data
  const resourcesColumns = [
    "Resource ID",
    "Resource Name",
    "Type",
    "Available Qty",
    "Allocated Qty",
    "Utilization %",
    "Status",
  ];

  const resourcesRows = [
    [
      { value: "RES-001", readOnly: true },
      { value: "Labor - Skilled Mason", readOnly: true },
      { value: "Human Resource", readOnly: true },
      { value: "45", readOnly: true },
      { value: "38", readOnly: false, columnType: "number" as const },
      { value: "84%", readOnly: true },
      { value: "Active", readOnly: true },
    ],
    [
      { value: "RES-002", readOnly: true },
      { value: "Excavator - CAT 320", readOnly: true },
      { value: "Equipment", readOnly: true },
      { value: "5", readOnly: true },
      { value: "4", readOnly: false, columnType: "number" as const },
      { value: "80%", readOnly: true },
      { value: "Active", readOnly: true },
    ],
    [
      { value: "RES-003", readOnly: true },
      { value: "Cement - Grade 53", readOnly: true },
      { value: "Material", readOnly: true },
      { value: "500", readOnly: true },
      { value: "320", readOnly: false, columnType: "number" as const },
      { value: "64%", readOnly: true },
      { value: "Available", readOnly: true },
    ],
    [
      { value: "RES-004", readOnly: true },
      { value: "Steel Bars - TMT", readOnly: true },
      { value: "Material", readOnly: true },
      { value: "250", readOnly: true },
      { value: "185", readOnly: false, columnType: "number" as const },
      { value: "74%", readOnly: true },
      { value: "Available", readOnly: true },
    ],
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName="John Supervisor" userRole={role} projectName={project.name} />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Supervisor Dashboard
          </h1>
          <p className="text-muted-foreground">Manage daily operations and data entry</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-effect">
              <TabsTrigger value="daily-input" className="space-x-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Daily Input</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="space-x-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
              <TabsTrigger value="boq" className="space-x-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">BOQ Data</span>
              </TabsTrigger>
              <TabsTrigger value="approvals" className="space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Approvals</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily-input" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ExcelSheet
                  title="Daily Input Sheet - January 15, 2024"
                  columns={dailyInputColumns}
                  rows={dailyInputRows}
                  onSubmit={handleSubmit}
                />
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Excel Tips:</strong> Use <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs">Tab</kbd> to move right, 
                    <kbd className="px-2 py-1 bg-white border border-blue-300 rounded text-xs ml-1">Enter</kbd> to move down. 
                    Gray cells are auto-filled from P6 and read-only.
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ExcelSheet
                  title="Resource Allocation - January 15, 2024"
                  columns={resourcesColumns}
                  rows={resourcesRows}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="boq" className="mt-6">
              <Card className="p-6 glass-effect">
                <h2 className="text-2xl font-bold mb-4">BOQ Data Overview</h2>
                <p className="text-muted-foreground mb-4">Bill of Quantities tracking and updates</p>
                <div className="space-y-3">
                  {[
                    { item: "Concrete Works", planned: "2500 m³", actual: "1890 m³", variance: "-24%" },
                    { item: "Steel Framework", planned: "450 MT", actual: "398 MT", variance: "-12%" },
                    { item: "Electrical Fittings", planned: "1200 Units", actual: "1245 Units", variance: "+4%" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-muted-foreground">Planned: {item.planned} | Actual: {item.actual}</p>
                      </div>
                      <span className={`font-bold ${item.variance.startsWith('+') ? 'text-green-600' : 'text-orange-600'}`}>
                        {item.variance}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="approvals" className="mt-6">
              <Card className="p-6 glass-effect">
                <h2 className="text-2xl font-bold mb-4">Approval Status</h2>
                <div className="space-y-3">
                  {[
                    { sheet: "Daily Sheet - 14 Jan", status: "Approved", date: "15 Jan 2024" },
                    { sheet: "Daily Sheet - 13 Jan", status: "Pending", date: "14 Jan 2024" },
                    { sheet: "Daily Sheet - 12 Jan", status: "Revision Required", date: "13 Jan 2024" },
                  ].map((approval, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-lg border border-border hover:border-primary transition-colors">
                      <div>
                        <p className="font-medium">{approval.sheet}</p>
                        <p className="text-sm text-muted-foreground">{approval.date}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          approval.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : approval.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {approval.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
