const UserProfile = require('../models/UserProfile');

// GET /profile — fetch profile for the logged-in user
const getProfile = async (req, res) => {
  try {
    const profile = await UserProfile.getByUserId(req.userId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('getProfile error:', err.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// POST /profile — create profile for the logged-in user
const createProfile = async (req, res) => {
  try {
    const { name, email, education, skills, experience, resume_link, location } = req.body;

    if (!name || !email)
      return res.status(400).json({ message: 'Name and email are required' });

    const parsedSkills = Array.isArray(skills)
      ? skills
      : skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const profile = await UserProfile.create({
      user_id: req.userId,
      name, email, education,
      skills: parsedSkills,
      experience, resume_link, location,
    });

    res.status(201).json(profile);
  } catch (err) {
    console.error('createProfile error:', err.message, err.detail || '');
    // Duplicate profile for this user
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Profile already exists for this account' });
    }
    res.status(500).json({ message: err.message || 'Server error creating profile' });
  }
};

// PUT /profile/:id — update profile for the logged-in user
const updateProfile = async (req, res) => {
  try {
    const { name, email, education, skills, experience, resume_link, location } = req.body;

    if (!name || !email)
      return res.status(400).json({ message: 'Name and email are required' });

    const parsedSkills = Array.isArray(skills)
      ? skills
      : skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const updated = await UserProfile.update(req.params.id, req.userId, {
      name, email, education,
      skills: parsedSkills,
      experience, resume_link, location,
    });

    if (!updated) return res.status(404).json({ message: 'Profile not found' });
    res.json(updated);
  } catch (err) {
    console.error('updateProfile error:', err.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = { getProfile, createProfile, updateProfile };
