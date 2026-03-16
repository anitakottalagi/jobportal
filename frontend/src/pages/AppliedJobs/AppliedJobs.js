import React, { useState, useEffect, useCallback } from 'react';
import { getApplications, deleteApplication } from '../../services/api';
import './AppliedJobs.css';

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getApplications();
      setApplications(res.data);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleDelete = async (id, jobTitle) => {
    if (!window.confirm(`Remove application for "${jobTitle}"?`)) return;
    setDeletingId(id);
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setSuccessMsg('Application removed successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to remove application');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="applied-page">
      <div className="container">
        {/* Header */}
        <div className="applied-header">
          <div>
            <h1 className="applied-title">My Applications</h1>
            <p className="applied-subtitle">
              Track all your job applications in one place
            </p>
          </div>
          <div className="applied-count-badge">
            {applications.length} Application{applications.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        {/* Content */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No applications yet</h3>
            <p>Start applying to jobs to track them here</p>
            <a href="/" className="btn btn-primary">Browse Jobs</a>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app) => (
              <div key={app.id} className="application-card fade-in">
                {/* Left: Company avatar */}
                <div className="app-avatar">
                  {app.company ? app.company.charAt(0).toUpperCase() : '?'}
                </div>

                {/* Center: Job info */}
                <div className="app-info">
                  <h3 className="app-job-title">{app.job_title || 'Unknown Position'}</h3>
                  <p className="app-company">{app.company || 'Unknown Company'}</p>

                  <div className="app-meta">
                    {app.location && (
                      <span className="app-meta-item">📍 {app.location}</span>
                    )}
                    <span className="app-meta-item">📅 Applied {formatDate(app.applied_date)}</span>
                    <span className="app-meta-item">✉️ {app.email}</span>
                  </div>

                  {/* Skills */}
                  {app.skills_required && app.skills_required.length > 0 && (
                    <div className="app-skills">
                      {app.skills_required.slice(0, 4).map((skill, i) => (
                        <span key={i} className="badge badge-skill">{skill}</span>
                      ))}
                    </div>
                  )}

                  {/* Cover note preview */}
                  {app.cover_note && (
                    <p className="app-cover-note">"{app.cover_note.slice(0, 100)}{app.cover_note.length > 100 ? '...' : ''}"</p>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="app-actions">
                  <span className="app-status-badge">Applied</span>
                  {app.resume_link && (
                    <a
                      href={app.resume_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline resume-btn"
                    >
                      📄 Resume
                    </a>
                  )}
                  <button
                    className="btn btn-danger remove-btn"
                    onClick={() => handleDelete(app.id, app.job_title)}
                    disabled={deletingId === app.id}
                  >
                    {deletingId === app.id ? 'Removing...' : '🗑 Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;
