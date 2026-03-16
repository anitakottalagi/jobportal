const express = require('express');
const router = express.Router();
const { getProfile, createProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// All profile routes require authentication
router.get('/', protect, getProfile);
router.post('/', protect, createProfile);
router.put('/:id', protect, updateProfile);

module.exports = router;
