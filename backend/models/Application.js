const { pool } = require('../config/db');

const Application = {
  // Get all applications for a specific user with job details
  async getByUserId(userId) {
    const result = await pool.query(
      `SELECT a.*, j.title AS job_title, j.company, j.location, j.description, j.skills_required
       FROM applications a
       LEFT JOIN jobs j ON a.job_id = j.id
       WHERE a.user_id = $1
       ORDER BY a.applied_date DESC`,
      [userId]
    );
    return result.rows;
  },

  // Create a new application
  async create(data) {
    const { user_id, job_id, name, email, resume_link, cover_note } = data;
    const result = await pool.query(
      `INSERT INTO applications (user_id, job_id, name, email, resume_link, cover_note)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, job_id, name, email, resume_link, cover_note]
    );
    return result.rows[0];
  },

  // Check if user already applied to this job
  async findByJobAndUser(job_id, user_id) {
    const result = await pool.query(
      'SELECT * FROM applications WHERE job_id = $1 AND user_id = $2',
      [job_id, user_id]
    );
    return result.rows[0] || null;
  },

  // Delete application — only if it belongs to the user
  async deleteByIdAndUser(id, userId) {
    const result = await pool.query(
      'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0] || null;
  },
};

module.exports = Application;
