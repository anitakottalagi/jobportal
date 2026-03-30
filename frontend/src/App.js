import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';
import Navbar from './components/Navbar/Navbar';
import AdminNavbar from './components/AdminNavbar/AdminNavbar';

import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import AppliedJobs from './pages/AppliedJobs/AppliedJobs';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Landing from './pages/Landing/Landing';

import AdminLogin from './pages/admin/AdminLogin/AdminLogin';
import AdminApplications from './pages/admin/AdminApplications/AdminApplications';
import AddJob from './pages/admin/AddJob/AddJob';
import AdminJobs from './pages/admin/AdminJobs/AdminJobs';


const AdminLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
    <AdminNavbar />
    <main style={{ paddingTop: '64px' }}>{children}</main>
  </div>
);


const UserLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
    <Navbar />
    <main style={{ paddingTop: '70px' }}>{children}</main>
  </div>
);

const RootRedirect = () => {
  const { isAuthenticated, isAdminAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAdminAuthenticated) return <Redirect to="/admin/applications" />;
  if (isAuthenticated) return <Redirect to="/home" />;
  return <Landing />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          
          <Route exact path="/" component={RootRedirect} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/admin/login" component={AdminLogin} />

          
          <AdminRoute
            path="/admin"
            component={() => (
              <AdminLayout>
                <Switch>
                  <AdminRoute exact path="/admin/applications" component={AdminApplications} />
                  <AdminRoute exact path="/admin/add-job" component={AddJob} />
                  <AdminRoute exact path="/admin/jobs" component={AdminJobs} />
                  <Redirect to="/admin/applications" />
                </Switch>
              </AdminLayout>
            )}
          />

          
          <Route
            render={() => (
              <UserLayout>
                <Switch>
                  <PrivateRoute exact path="/home" component={Home} />
                  <PrivateRoute path="/profile" component={Profile} />
                  <PrivateRoute path="/applied-jobs" component={AppliedJobs} />
                  <Redirect to="/" />
                </Switch>
              </UserLayout>
            )}
          />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
