import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import AppliedJobs from './pages/AppliedJobs/AppliedJobs';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          {/* Public auth routes — no Navbar */}
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          {/* Protected app routes — with Navbar */}
          <Route
            render={() => (
              <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
                <Navbar />
                <main style={{ paddingTop: '70px' }}>
                  <Switch>
                    <PrivateRoute exact path="/" component={Home} />
                    <PrivateRoute path="/profile" component={Profile} />
                    <PrivateRoute path="/applied-jobs" component={AppliedJobs} />
                    <Redirect to="/" />
                  </Switch>
                </main>
              </div>
            )}
          />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
