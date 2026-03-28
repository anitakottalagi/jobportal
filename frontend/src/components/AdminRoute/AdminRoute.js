import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ component: Component, ...rest }) => {
  const { isAdminAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <Route
      {...rest}
      render={(props) =>
        isAdminAuthenticated ? <Component {...props} /> : <Redirect to="/admin/login" />
      }
    />
  );
};

export default AdminRoute;
