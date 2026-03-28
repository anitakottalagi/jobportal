import React, { useState, useEffect } from 'react';
import './ApplyModal.css';


const ApplyModal = ({ job, profile, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    resume_link: '',
    cover_note: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  
  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        resume_link: profile.resume_link || '',
      }));
    }
  }, [profile]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.resume_link.trim()) errs.resume_link = 'Resume link is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({ ...form, job_id: job.id });
      onClose();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal-container fade-in">
        
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Apply for Position</h2>
            <p className="modal-subtitle">
              <span className="modal-job-title">{job.title}</span> at {job.company}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        
        <form onSubmit={handleSubmit} className="modal-form">
          {submitError && <div className="error-message">{submitError}</div>}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Your full name"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="your@email.com"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Resume Link *</label>
            <input
              type="url"
              name="resume_link"
              value={form.resume_link}
              onChange={handleChange}
              className={`form-input ${errors.resume_link ? 'input-error' : ''}`}
              placeholder="https://drive.google.com/your-resume"
            />
            {errors.resume_link && <span className="field-error">{errors.resume_link}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Cover Note</label>
            <textarea
              name="cover_note"
              value={form.cover_note}
              onChange={handleChange}
              className="form-input"
              placeholder="Tell the employer why you're a great fit..."
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
