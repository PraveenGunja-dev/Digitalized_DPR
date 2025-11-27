// server/routes/activities.js
// Oracle P6 API equivalent routes for activity management
const express = require('express');
const router = express.Router();
const { 
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity
} = require('../controllers/activitiesController');

// All routes require authentication
// Oracle P6 API equivalent endpoints for activities
router.get('/', getActivities);              // Equivalent to GET /activity
router.get('/:id', getActivityById);        // Equivalent to GET /activity/{id}
router.post('/', createActivity);           // Equivalent to POST /activity
router.put('/:id', updateActivity);         // Equivalent to PUT /activity/{id}
router.delete('/:id', deleteActivity);      // Equivalent to DELETE /activity/{id}

// Additional Oracle P6 API endpoints for activities
router.get('/fields', (req, res) => {
  // Equivalent to GET /activity/fields - returns available activity fields
  res.status(200).json({
    message: 'Activity fields - Oracle P6 API equivalent',
    fields: [
      'ObjectId',
      'Name',
      'ProjectId',
      'PlannedStartDate',
      'PlannedFinishDate',
      'ActualStartDate',
      'ActualFinishDate',
      'PercentComplete',
      'Status',
      'WBSId'
    ]
  });
});

module.exports = router;