const { pool } = require('../config/db');

const UserProfile = {
  // Get profile by user_id (auth-scoped)
  async getByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },

  // Legacy: get first profile (used by job matching on server startup)
  async get() {
    const result = await pool.query('SELECT * FROM user_profiles ORDER BY id ASC LIMIT 1');
    return result.rows[0] || null;
  },

  // Create profile linked to a user (upsert — safe to call even if profile exists)
  async create(data) {
    const { user_id, name, email, education, skills, experience, resume_link, location } = data;
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, name, email, education, skills, experience, resume_link, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE
         SET name=$2, email=$3, education=$4, skills=$5, experience=$6,
             resume_link=$7, location=$8, updated_at=NOW()
       RETURNING *`,
      [user_id, name, email, education, skills || [], experience, resume_link, location]
    );
    return result.rows[0];
  },

  // Update profile — scoped to user_id for security
  async update(id, userId, data) {
    const { name, email, education, skills, experience, resume_link, location } = data;
    const result = await pool.query(
      `UPDATE user_profiles
       SET name=$1, email=$2, education=$3, skills=$4, experience=$5,
           resume_link=$6, location=$7, updated_at=NOW()
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [name, email, education, skills || [], experience, resume_link, location, id, userId]
    );
    return result.rows[0] || null;
  },
};

module.exports = UserProfile;
