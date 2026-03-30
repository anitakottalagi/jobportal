import React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const location = useLocation();
  const history = useHistory();
  const { admin, adminLogout } = useAuth();

  const links = [
    { path: '/admin/applications', label: 'Applications', icon: '📋' },
    { path: '/admin/jobs', label: 'All Jobs', icon: '💼' },
    { path: '/admin/add-job', label: 'Add Job', icon: '➕' },
  ];

  const handleLogout = () => {
    adminLogout();
    history.push('/admin/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-container">
        <Link to="/admin/applications" className="admin-logo">
          <span>Admin<span className="logo-accent">Panel</span></span>
        </Link>

        <ul className="admin-nav-links">
          {links.map((l) => (
            <li key={l.path}>
              <Link
                to={l.path}
                className={`admin-nav-link ${location.pathname === l.path ? 'active' : ''}`}
              >
                <span>{l.icon}</span> {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
