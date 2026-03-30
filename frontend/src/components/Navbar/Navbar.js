import React, { useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const history = useHistory();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { path: '/home', label: 'Jobs', icon: '💼' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/applied-jobs', label: 'Applications', icon: '📋' },
  ];

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        <Link to="/home" className="navbar-logo">
          <span className="logo-text">Job<span className="logo-accent">Portal</span></span>
        </Link>

        
        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        
        <div className="navbar-user">
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="user-name">{user.name}</span>
            </div>
          )}
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}
          <button className="mobile-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
