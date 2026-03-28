import React, { useState, useEffect } from 'react';
import { adminGetJobs } from '../../../services/api';
import './AdminJobs.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetJobs()
      .then((res) => setJobs(res.data))
      .catch(() => setError('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-jobs-page">
      <div className="admin-page-header">
        <h1>All Jobs</h1>
        <span className="count-badge">{jobs.length} total</span>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      {loading ? (
        <div className="admin-loading"><div className="spinner" /></div>
      ) : jobs.length === 0 ? (
        <div className="admin-empty">No jobs found</div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="admin-job-card">
              <div className="job-card-top">
                <div className="job-avatar">{job.company ? job.company.charAt(0).toUpperCase() : 'J'}</div>
                <div>
                  <h3 className="job-card-title">{job.title}</h3>
                  <p className="job-card-company">{job.company}</p>
                </div>
                <span className={`source-badge ${job.source}`}>{job.source === 'admin' ? 'Manual' : 'API'}</span>
              </div>
              {job.location && <p className="job-card-location">📍 {job.location}</p>}
              {job.skills_required && job.skills_required.length > 0 && (
                <div className="job-card-skills">
                  {job.skills_required.slice(0, 5).map((s, i) => (
                    <span key={i} className="skill-tag">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
