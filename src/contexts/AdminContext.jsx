import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // data loading (dashboard/users/products)
  const [statusLoading, setStatusLoading] = useState(true); // admin session status loading
  const [isAdmin, setIsAdmin] = useState(undefined); // undefined = unknown/loading
  const [pagination, setPagination] = useState(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Check admin session using admin cookie by pinging an admin-only endpoint
  const refreshAdminStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await fetch(`${baseUrl}/admin/dashboard`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setIsAdmin(true);
        setDashboardData(data?.analytics || null);
      } else {
        setIsAdmin(false);
        setDashboardData(null);
      }
    } catch (e) {
      setIsAdmin(false);
      setDashboardData(null);
    } finally {
      setStatusLoading(false);
    }
  };

  // API helper function
  const adminApiCall = async (url, options = {}) => {
    const response = await fetch(`${baseUrl}${url}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  };

  // Load dashboard data
  const loadDashboard = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      const data = await adminApiCall('/admin/dashboard');
      setDashboardData(data.analytics);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load users with pagination
  const loadUsers = async (page = 1, limit = 20) => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      const data = await adminApiCall(`/admin/users?page=${page}&limit=${limit}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (email, role) => {
    if (!isAdmin) return false;
    
    try {
      await adminApiCall(`/admin/users/${email}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.email === email ? { ...user, role } : user
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  };

  // Get user details
  const getUserDetails = async (email) => {
    if (!isAdmin) return null;
    
    try {
      const data = await adminApiCall(`/admin/users/${email}/details`);
      return data;
    } catch (error) {
      console.error('Error getting user details:', error);
      return null;
    }
  };

  // Delete user
  const deleteUser = async (email) => {
    if (!isAdmin) return false;
    
    try {
      await adminApiCall(`/admin/users/${email}`, {
        method: 'DELETE',
      });
      
      // Remove from local state
      setUsers(prev => prev.filter(user => user.email !== email));
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  // Setup admin (for initial admin creation)
  const setupAdmin = async (email, adminKey) => {
    try {
      const response = await fetch(`${baseUrl}/admin/setup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, adminKey }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Setup failed' }));
        throw new Error(error.error || 'Setup failed');
      }

      const data = await response.json();
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error setting up admin:', error);
      return { success: false, error: error.message };
    }
  };

  // Load dashboard data when admin user is authenticated
  useEffect(() => {
    // On mount, or when admin status might change, check server-side
    refreshAdminStatus();
  }, []);

  // Admin logout
  const adminLogout = async () => {
    try {
      await fetch(baseUrl + '/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // ignore network errors
    }
    setIsAdmin(false);
    setDashboardData(null);
    setUsers([]);
    setPagination(null);
  };

  const contextValue = {
    isAdmin,
    statusLoading,
    dashboardData,
    users,
    pagination,
    loading,
    refreshAdminStatus,
    loadDashboard,
    loadUsers,
    updateUserRole,
    getUserDetails,
    deleteUser,
    setupAdmin,
    adminLogout
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export { AdminContext };
export default AdminContext;