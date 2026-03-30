import React from 'react';
import { useHistory } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const history = useHistory();

  return (
    <div className="landing-page">
      <div className="landing-card">
        <div className="landing-logo">
          <span className="logo-text">Job<span className="logo-accent">Portal</span></span>
        </div>
        <h1 className="landing-title">Welcome Back</h1>
        <p className="landing-subtitle">Choose how you want to continue</p>

        <div className="landing-buttons">
          <button className="landing-btn user-btn" onClick={() => history.push('/login')}>
            <div>
              <div className="btn-label">Login as User</div>
              <div className="btn-desc">Browse jobs and track applications</div>
            </div>
          </button>
        </div>

        <p className="landing-register">
          New user?{' '}
          <span className="landing-link" onClick={() => history.push('/register')}>
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
};

export default Landing;
