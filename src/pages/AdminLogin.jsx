import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../contexts/AdminContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: ''
  });

  const { isAdmin, setupAdmin, refreshAdminStatus } = useContext(AdminContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in and is admin, redirect to dashboard
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use dedicated admin login endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/admin-login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

  await response.json();
  // Refresh admin status based on cookie and go to dashboard
  await refreshAdminStatus();
  navigate('/admin/dashboard');
      
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    if (setupData.password !== setupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await setupAdmin(setupData.email, setupData.adminKey);
      if (result.success) {
        // Refresh admin status and navigate
        await refreshAdminStatus();
        setShowSetup(false);
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Admin setup failed');
      }
    } catch (err) {
      setError(err.message || 'Admin setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Admin Access</h1>
          <p>Restricted Area - Authorized Personnel Only</p>
        </div>

        {!showSetup ? (
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter admin email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="admin-login-btn">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="admin-setup-link">
              <button 
                type="button" 
                onClick={() => navigate('/admin/register')}
                className="setup-link"
              >
                Don't have an admin account? Register here
              </button>
              <button 
                type="button" 
                onClick={() => setShowSetup(true)}
                className="setup-link"
              >
                First time setup? Create admin account
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSetup} className="admin-setup-form">
            <h2>Admin Setup</h2>
            <p>Create the first admin account for this system</p>

            <div className="form-group">
              <label htmlFor="setup-email">Admin Email</label>
              <input
                type="email"
                id="setup-email"
                value={setupData.email}
                onChange={(e) => setSetupData({...setupData, email: e.target.value})}
                required
                placeholder="Enter admin email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="setup-password">Password</label>
              <input
                type="password"
                id="setup-password"
                value={setupData.password}
                onChange={(e) => setSetupData({...setupData, password: e.target.value})}
                required
                placeholder="Enter password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={setupData.confirmPassword}
                onChange={(e) => setSetupData({...setupData, confirmPassword: e.target.value})}
                required
                placeholder="Confirm password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-key">Admin Setup Key</label>
              <input
                type="password"
                id="admin-key"
                value={setupData.adminKey}
                onChange={(e) => setSetupData({...setupData, adminKey: e.target.value})}
                required
                placeholder="Enter admin setup key"
              />
              <small>Contact system administrator for setup key</small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="setup-buttons">
              <button 
                type="button" 
                onClick={() => setShowSetup(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="setup-btn">
                {loading ? 'Setting up...' : 'Create Admin Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;