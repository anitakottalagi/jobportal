const express = require('express');
const router = express.Router();
const { getApplications, createApplication, deleteApplication } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// All application routes require authentication
router.get('/', protect, getApplications);
router.post('/', protect, createApplication);
router.delete('/:id', protect, deleteApplication);

module.exports = router;
