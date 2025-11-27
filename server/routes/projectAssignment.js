// server/routes/projectAssignment.js
const express = require('express');
const router = express.Router();
const { 
  assignProjectToSupervisor,
  getAssignedProjects,
  getProjectSupervisors,
  unassignProjectFromSupervisor
} = require('../controllers/projectAssignmentController');

// Oracle P6 API equivalent endpoints for project assignments
// In Oracle P6, this would typically be handled through resource assignments or project team management

// Assign a project to a supervisor (Oracle P6 equivalent might be adding a team member)
router.post('/assign', assignProjectToSupervisor);

// Unassign a project from a supervisor (Oracle P6 equivalent might be removing a team member)
router.post('/unassign', unassignProjectFromSupervisor);

// Get supervisors for a project (Oracle P6 equivalent might be getting project team members)
router.get('/project/:projectId/supervisors', getProjectSupervisors);

// Get assigned projects for a supervisor (Oracle P6 equivalent might be getting projects for a resource)
router.get('/assigned', getAssignedProjects);

// Additional Oracle P6 equivalent endpoints that could be implemented
router.get('/resources', (req, res) => {
  // Placeholder for getting project resources
  res.status(200).json([]);
});

router.post('/resources', (req, res) => {
  // Placeholder for assigning resources to projects
  res.status(201).json({ message: 'Resource assignment not implemented yet' });
});

module.exports = router;