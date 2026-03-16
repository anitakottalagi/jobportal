const { pool } = require('../config/db');

const Job = {
  // Get all jobs
  async getAll() {
    const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    return result.rows;
  },

  // Get job by ID
  async getById(id) {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  // Upsert a job (insert or update on conflict)
  async upsert(job) {
    const { id, title, company, location, description, skills_required } = job;
    const result = await pool.query(
      `INSERT INTO jobs (id, title, company, location, description, skills_required)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE
       SET title=$2, company=$3, location=$4, description=$5, skills_required=$6
       RETURNING *`,
      [id, title, company, location, description, skills_required || []]
    );
    return result.rows[0];
  },

  // Bulk upsert jobs
  async bulkUpsert(jobs) {
    const results = [];
    for (const job of jobs) {
      const saved = await Job.upsert(job);
      results.push(saved);
    }
    return results;
  },
};

module.exports = Job;
