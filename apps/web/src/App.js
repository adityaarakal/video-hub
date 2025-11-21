import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Channel from './pages/Channel';
import Login from './pages/Login';
import Register from './pages/Register';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <Router>
            <div className="app">
              <KeyboardShortcuts />
              <Header />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/channel/:channelId" element={<Channel />} />
              </Routes>
            </div>
          </Router>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

