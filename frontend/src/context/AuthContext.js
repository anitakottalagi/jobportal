import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      setUser(JSON.parse(stored));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    
    const adminToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminUser');
    if (adminToken && storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }

    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const adminLogin = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, login, logout, loading,
        isAuthenticated: !!user,
        admin, adminLogin, adminLogout,
        isAdminAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
