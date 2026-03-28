import React, { useState } from 'react';
import { adminAddJob } from '../../../services/api';
import './AddJob.css';

const AddJob = () => {
  const [form, setForm] = useState({
    title: '', company: '', location: '', description: '', skills_required: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await adminAddJob(form);
      setSuccess('Job posted successfully!');
      setForm({ title: '', company: '', location: '', description: '', skills_required: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-job-page">
      <div className="add-job-card">
        <div className="add-job-header">
          <h1>Post a New Job</h1>
          <p>Fill in the details to add a job listing</p>
        </div>

        {error && <div className="add-job-alert error">{error}</div>}
        {success && <div className="add-job-alert success">{success}</div>}

        <form onSubmit={handleSubmit} className="add-job-form">
          <div className="form-row">
            <div className="form-group">
              <label>Job Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                required
              />
            </div>
            <div className="form-group">
              <label>Company *</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore, Remote"
            />
          </div>

          <div className="form-group">
            <label>Skills Required</label>
            <input
              name="skills_required"
              value={form.skills_required}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, PostgreSQL (comma separated)"
            />
          </div>

          <div className="form-group">
            <label>Job Description</label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, requirements..."
            />
          </div>

          <button type="submit" className="add-job-btn" disabled={loading}>
            {loading ? 'Posting...' : '➕ Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
