import React, { useState, useEffect } from 'react';
import ProfileProgress from '../../components/ProfileProgress/ProfileProgress';
import { getProfile, createProfile, updateProfile } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', education: '', skills: '',
    experience: '', resume_link: '', location: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  // Load profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        populateForm(res.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Failed to load profile');
        }
        // 404 means no profile yet — show create form
        setEditing(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const populateForm = (data) => {
    setForm({
      name: data.name || '',
      email: data.email || '',
      education: data.education || '',
      skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '',
      experience: data.experience || '',
      resume_link: data.resume_link || '',
      location: data.location || '',
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
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

    setSaving(true);
    setError('');
    setSuccess('');

    // Parse skills from comma-separated string
    const payload = {
      ...form,
      skills: form.skills
        ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    try {
      let res;
      if (profile) {
        res = await updateProfile(profile.id, payload);
      } else {
        res = await createProfile(payload);
      }
      setProfile(res.data);
      populateForm(res.data);
      setEditing(false);
      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    populateForm(profile);
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    if (profile) {
      populateForm(profile);
      setEditing(false);
    }
    setErrors({});
    setError('');
  };

  // Build profile-like object from form for progress bar preview
  const previewProfile = editing
    ? {
        ...form,
        skills: form.skills ? form.skills.split(',').filter((s) => s.trim()) : [],
      }
    : profile;

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Left: Progress + Info */}
          <div className="profile-sidebar">
            <ProfileProgress profile={previewProfile} />

            {/* Profile summary card (view mode) */}
            {profile && !editing && (
              <div className="profile-summary card">
                <div className="profile-avatar">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                </div>
                <h2 className="profile-name">{profile.name}</h2>
                <p className="profile-email">{profile.email}</p>
                {profile.location && (
                  <p className="profile-location">📍 {profile.location}</p>
                )}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="profile-skills-preview">
                    {profile.skills.slice(0, 6).map((skill, i) => (
                      <span key={i} className="badge badge-skill">{skill}</span>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary edit-btn" onClick={handleEdit}>
                  ✏️ Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="profile-main">
            <div className="profile-form-card card">
              <div className="form-card-header">
                <h2 className="form-card-title">
                  {profile ? (editing ? 'Edit Profile' : 'Your Profile') : 'Create Profile'}
                </h2>
                <p className="form-card-subtitle">
                  {editing
                    ? 'Update your professional information'
                    : 'Your professional information'}
                </p>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`form-input ${errors.name ? 'input-error' : ''}`}
                        placeholder="John Doe"
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
                        placeholder="john@example.com"
                      />
                      {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Bangalore, India"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Education</label>
                      <input
                        type="text"
                        name="education"
                        value={form.education}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="B.Tech Computer Science, IIT Delhi"
                      />
                    </div>

                    <div className="form-group form-full">
                      <label className="form-label">
                        Skills
                        <span className="label-hint"> (comma separated)</span>
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={form.skills}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="React, Node.js, PostgreSQL, Docker"
                      />
                    </div>

                    <div className="form-group form-full">
                      <label className="form-label">Work Experience</label>
                      <textarea
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="3 years at TechCorp as Frontend Developer..."
                        rows={3}
                      />
                    </div>

                    <div className="form-group form-full">
                      <label className="form-label">Resume Link</label>
                      <input
                        type="url"
                        name="resume_link"
                        value={form.resume_link}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="https://drive.google.com/your-resume"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    {profile && (
                      <button type="button" className="btn btn-outline" onClick={handleCancel}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                    </button>
                  </div>
                </form>
              ) : (
                /* View mode */
                <div className="profile-view">
                  {[
                    { label: 'Education', value: profile?.education, icon: '🎓' },
                    { label: 'Experience', value: profile?.experience, icon: '💼' },
                    { label: 'Resume', value: profile?.resume_link, icon: '📄', isLink: true },
                  ].map(({ label, value, icon, isLink }) =>
                    value ? (
                      <div key={label} className="view-field">
                        <span className="view-icon">{icon}</span>
                        <div>
                          <p className="view-label">{label}</p>
                          {isLink ? (
                            <a href={value} target="_blank" rel="noreferrer" className="view-link">
                              {value}
                            </a>
                          ) : (
                            <p className="view-value">{value}</p>
                          )}
                        </div>
                      </div>
                    ) : null
                  )}

                  {profile?.skills?.length > 0 && (
                    <div className="view-field">
                      <span className="view-icon">⚡</span>
                      <div>
                        <p className="view-label">Skills</p>
                        <div className="skills-list">
                          {profile.skills.map((skill, i) => (
                            <span key={i} className="badge badge-skill">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
