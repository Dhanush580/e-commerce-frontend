import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AdminContext } from '../contexts/AdminContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAdmin, statusLoading } = useContext(AdminContext);
  const location = useLocation();

  // Show loading while checking admin status
  const shouldShowLoading = statusLoading || isAdmin === undefined;

  // Show loading while checking authentication (only if we don't have user data)
  if (shouldShowLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e1e5e9',
          borderLeft: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Checking admin access...</p>
      </div>
    );
  }

  // If not logged in as admin, redirect to admin login
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If user is admin, render the protected content immediately
  return children;
};

export default AdminProtectedRoute;