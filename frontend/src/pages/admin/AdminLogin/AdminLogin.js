import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { adminLoginApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const history = useHistory();
  const { adminLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminLoginApi(form);
      adminLogin(res.data.token, res.data.admin);
      history.push('/admin/applications');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-shield">🛡️</span>
          <h1>Admin Portal</h1>
          <p>Sign in to manage jobs and applications</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <p className="back-link" onClick={() => history.push('/')}>
          ← Back to home
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
