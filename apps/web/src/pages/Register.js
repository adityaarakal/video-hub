import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { User, Lock, Mail } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const { success: showSuccess, error: showError, warning: showWarning } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showError('Passwords do not match', 4000);
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters', 4000);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.register({ username, email, password });
      if (response.user && response.token) {
        // Initialize default playlists
        try {
          await api.request('/playlists/initialize', {
            method: 'POST',
            body: JSON.stringify({ userId: response.user.id })
          });
        } catch (err) {
          console.error('Failed to initialize playlists:', err);
        }

        login(response.user);
        showSuccess('Account created successfully! Welcome to VideoHub!', 3000);
        navigate('/');
      }
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.', 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join VideoHub today</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <User size={20} className="auth-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="auth-input-group">
            <Mail size={20} className="auth-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="auth-input-group">
            <Lock size={20} className="auth-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div className="auth-input-group">
            <Lock size={20} className="auth-icon" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;

