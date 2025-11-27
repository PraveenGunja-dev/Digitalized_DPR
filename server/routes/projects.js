// server/routes/projects.js
const express = require('express');
const router = express.Router();
const { 
  getUserProjects, 
  getProjectById, 
  createProject, 
  updateProject,
  deleteProject 
} = require('../controllers/projectsController');

// All routes require authentication
// Oracle P6 API equivalent endpoints
router.get('/', getUserProjects);  // Equivalent to GET /project
router.get('/:id', getProjectById);  // Equivalent to GET /project/{id}
router.post('/', createProject);  // Equivalent to POST /project
router.put('/:id', updateProject);  // Equivalent to PUT /project/{id}
router.delete('/:id', deleteProject);  // Equivalent to DELETE /project/{id}

module.exports = router;