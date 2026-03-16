const express = require('express');
const router = express.Router();
const { getJobs, getJobById, fetchJobsFromAPI } = require('../controllers/jobController');

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/fetch-from-api', fetchJobsFromAPI);

module.exports = router;
