import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VideoUpload from './pages/VideoUpload';
import VideoList from './pages/VideoList';
import './App.css';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('cms_token') || null;
  });

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('cms_user', JSON.stringify(userData));
    localStorage.setItem('cms_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cms_user');
    localStorage.removeItem('cms_token');
  };

  const PrivateRoute = ({ children }) => {
    if (!user || !token) {
      return <Navigate to="/login" />;
    }
    // Check if user is admin
    if (user.role !== 'admin') {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              user && token ? <Navigate to="/dashboard" /> : <Login onLogin={login} />
            } 
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard user={user} onLogout={logout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <VideoUpload user={user} onLogout={logout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/videos"
            element={
              <PrivateRoute>
                <VideoList user={user} onLogout={logout} />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

