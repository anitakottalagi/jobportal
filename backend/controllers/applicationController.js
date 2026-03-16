const Application = require('../models/Application');

// GET /applications — get applications for the logged-in user
const getApplications = async (req, res) => {
  try {
    const applications = await Application.getByUserId(req.userId);
    res.json(applications);
  } catch (err) {
    console.error('getApplications error:', err.message);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// POST /applications — submit a new application
const createApplication = async (req, res) => {
  try {
    const { job_id, name, email, resume_link, cover_note } = req.body;

    if (!job_id || !name || !email)
      return res.status(400).json({ message: 'job_id, name, and email are required' });

    // Prevent duplicate applications
    const existing = await Application.findByJobAndUser(job_id, req.userId);
    if (existing)
      return res.status(409).json({ message: 'You have already applied for this job' });

    const application = await Application.create({
      user_id: req.userId,
      job_id, name, email, resume_link, cover_note,
    });

    res.status(201).json(application);
  } catch (err) {
    console.error('createApplication error:', err.message);
    res.status(500).json({ message: 'Server error submitting application' });
  }
};

// DELETE /applications/:id — remove an application (only owner can delete)
const deleteApplication = async (req, res) => {
  try {
    const deleted = await Application.deleteByIdAndUser(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Application removed successfully' });
  } catch (err) {
    console.error('deleteApplication error:', err.message);
    res.status(500).json({ message: 'Server error deleting application' });
  }
};

module.exports = { getApplications, createApplication, deleteApplication };
