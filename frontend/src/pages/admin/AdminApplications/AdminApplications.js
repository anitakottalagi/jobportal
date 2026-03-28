import React, { useState, useEffect } from 'react';
import { adminGetApplications, adminRespondToApplication } from '../../../services/api';
import './AdminApplications.css';

const STATUS_COLORS = {
  pending: { bg: '#fef9c3', color: '#92400e', label: 'Pending' },
  selected: { bg: '#dcfce7', color: '#166534', label: 'Selected' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondModal, setRespondModal] = useState(null); // { app }
  const [form, setForm] = useState({ status: 'selected', admin_response: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await adminGetApplications();
      setApplications(res.data);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const openRespond = (app) => {
    setForm({ status: app.status === 'pending' ? 'selected' : app.status, admin_response: app.admin_response || '' });
    setRespondModal(app);
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminRespondToApplication(respondModal.id, form);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === respondModal.id ? { ...a, status: form.status, admin_response: form.admin_response } : a
        )
      );
      setSuccessMsg('Response sent successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      setRespondModal(null);
    } catch (err) {
      setError('Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="admin-applications-page">
      <div className="admin-page-header">
        <h1>Applications</h1>
        <span className="count-badge">{applications.length} total</span>
      </div>

      {error && <div className="admin-alert error">{error}</div>}
      {successMsg && <div className="admin-alert success">{successMsg}</div>}

      {loading ? (
        <div className="admin-loading"><div className="spinner" /></div>
      ) : applications.length === 0 ? (
        <div className="admin-empty">No applications yet</div>
      ) : (
        <div className="applications-table-wrap">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Job</th>
                <th>Applied</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const s = STATUS_COLORS[app.status] || STATUS_COLORS.pending;
                return (
                  <tr key={app.id}>
                    <td>
                      <div className="applicant-info">
                        <div className="applicant-avatar">{(app.applicant_name || '?').charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="applicant-name">{app.applicant_name || app.name}</div>
                          <div className="applicant-email">{app.applicant_email || app.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="job-title-cell">{app.job_title || 'N/A'}</div>
                      <div className="job-company-cell">{app.company || ''}</div>
                    </td>
                    <td className="date-cell">{formatDate(app.applied_date)}</td>
                    <td>
                      {app.resume_link ? (
                        <a href={app.resume_link} target="_blank" rel="noreferrer" className="resume-link">
                          📄 View
                        </a>
                      ) : <span className="no-resume">—</span>}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                      {app.admin_response && (
                        <div className="response-preview">"{app.admin_response.slice(0, 40)}{app.admin_response.length > 40 ? '...' : ''}"</div>
                      )}
                    </td>
                    <td>
                      <button className="respond-btn" onClick={() => openRespond(app)}>
                        {app.status === 'pending' ? 'Respond' : 'Update'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Respond Modal */}
      {respondModal && (
        <div className="modal-overlay" onClick={() => setRespondModal(null)}>
          <div className="respond-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Respond to Application</h2>
            <p className="modal-applicant">
              <strong>{respondModal.applicant_name || respondModal.name}</strong> — {respondModal.job_title}
            </p>

            <form onSubmit={handleRespond}>
              <div className="form-group">
                <label>Decision</label>
                <div className="status-options">
                  {['selected', 'rejected'].map((s) => (
                    <label key={s} className={`status-option ${form.status === s ? 'chosen' : ''}`}>
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={form.status === s}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      />
                      {s === 'selected' ? '✅ Selected' : '❌ Rejected'}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Message to Applicant</label>
                <textarea
                  rows={4}
                  placeholder="Write a message for the applicant..."
                  value={form.admin_response}
                  onChange={(e) => setForm({ ...form, admin_response: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setRespondModal(null)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
