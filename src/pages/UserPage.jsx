import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './UserPage.css';

const UserPage = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_URL || '';

  // Show login modal if not authenticated
  React.useEffect(() => {
    if (!user && typeof window.openLoginModal === 'function') {
      window.openLoginModal();
    }
  }, [user]);

  // Prevent viewing this page when not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted && !isAuthenticated) {
        navigate('/', { replace: true });
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [isAuthenticated, navigate]);

  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const emptyAddress = { doorNo: '', addressLine1: '', addressLine2: '', landmark: '', pincode: '', city: '', state: '', country: '' };
  const [address, setAddress] = useState({ ...emptyAddress });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to fetch and sync full user profile
  const fetchAndSyncProfile = React.useCallback(() => {
  fetch(`${baseUrl}/profile`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setName(data.user.name || '');
          setMobile(data.user.mobile || '');
          setAddress({
            doorNo: data.user.address?.doorNo || '',
            addressLine1: data.user.address?.addressLine1 || '',
            addressLine2: data.user.address?.addressLine2 || '',
            landmark: data.user.address?.landmark || '',
            pincode: data.user.address?.pincode || '',
            city: data.user.address?.city || '',
            state: data.user.address?.state || '',
            country: data.user.address?.country || ''
          });
          login(data.user);
        }
      });
  }, [login]);

  // Fetch on mount
  React.useEffect(() => {
    fetchAndSyncProfile();
    // eslint-disable-next-line
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Validate address fields
    const requiredFields = ['doorNo', 'addressLine1', 'city', 'state', 'pincode', 'country'];
    for (let field of requiredFields) {
      if (!address[field]) {
        setError('Please fill all required address fields.');
        setLoading(false);
        return;
      }
    }
    try {
      // Save name and mobile
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res1 = await fetch(`${baseUrl}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, mobile })
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error || 'Failed to update profile');
      // Save address
      const res2 = await fetch(`${baseUrl}/profile/address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...address })
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error || 'Failed to update address');
      fetchAndSyncProfile();
      setShowEdit(false);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Orders state for dashboard
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  React.useEffect(() => {
    if (!user?.email) return;
    setOrdersLoading(true);
  fetch(`${baseUrl}/user-orders/${user.email}`)
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .finally(() => setOrdersLoading(false));
  }, [user?.email]);

  return (
    <div className="upp-container">
      {/* Header Section */}
      <div className="upp-header">
        <div className="upp-header-content">
          <h1 className="upp-header-title">My Account</h1>
          <p className="upp-header-subtitle">Manage your profile and orders</p>
        </div>
      </div>

      <div className="upp-main-wrapper">
        {/* Sidebar Navigation */}
        <div className="upp-sidebar-section">
          <div className="upp-sidebar">
            <div className="upp-user-info">
              <div className="upp-user-avatar">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="upp-user-details">
                <h3 className="upp-user-name">{user?.name || 'User'}</h3>
                <p className="upp-user-email">{user?.email}</p>
              </div>
            </div>

            <nav className="upp-nav-menu">
              <Link to="/dashboard" className="upp-nav-item upp-nav-active">
                <span>Dashboard</span>
              </Link>
              <Link to="/my-orders" className="upp-nav-item">
                <span>Orders</span>
              </Link>
              <Link to="/wishlist" className="upp-nav-item">
                <span>Wishlist</span>
              </Link>
              <Link to="/cart" className="upp-nav-item">
                <span>Cart</span>
              </Link>
              <button className="upp-nav-item upp-nav-logout" onClick={handleLogout}>
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="upp-content-section">
          {/* Welcome Card */}
          <div className="upp-welcome-card">
            <div className="upp-welcome-content">
              <h2>Welcome back, {user?.name || 'User'}!</h2>
              <p>Here's your account overview</p>
            </div>
            <div className="upp-welcome-action">
              <span className="upp-logout-text" onClick={handleLogout}>
                Not {user?.name || 'User'}? Log out
              </span>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="upp-card">
            <div className="upp-card-header">
              <h3 className="upp-card-title">Recent Order</h3>
            </div>
            <div className="upp-card-content">
              {ordersLoading ? (
                <div className="upp-loading">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="upp-empty-state">
                  <p>You haven't placed any orders yet.</p>
                  <button 
                    className="upp-btn upp-btn-primary"
                    onClick={() => navigate('/')}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="upp-orders-content">
                  <div className="upp-order-card">
                    {(() => {
                      const order = orders[0];
                      if (!order) return null;
                      return (
                        <div key={order._id}>
                          <div className="upp-order-header">
                            <div className="upp-order-info">
                              <span className="upp-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                              <span className="upp-order-total">₹{order.total}</span>
                            </div>
                            <div className="upp-order-status">
                              Status: <span>{order.deliveryStatus || 'Order Placed'}</span>
                            </div>
                          </div>
                          <div className="upp-order-details">
                            <div className="upp-payment-info">
                              <span>Payment: {order.payment?.method === 'card' ? 'Card' : 'Cash on Delivery'}</span>
                              <span>Status: {order.payment?.status ? order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1) : '-'}</span>
                            </div>
                            <div className="upp-order-items">
                              <ul>
                                {order.items.map((item, idx) => (
                                  <li key={idx}>{item.name} x {item.quantity} - ₹{item.price}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <button 
                    className="upp-btn upp-btn-secondary"
                    onClick={() => navigate('/my-orders')}
                  >
                    View All Orders
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="upp-card">
            <div className="upp-card-header">
              <h3 className="upp-card-title">Account Details</h3>
              <button 
                className="upp-btn upp-btn-edit"
                onClick={() => setShowEdit(!showEdit)}
              >
                {showEdit ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="upp-card-content">
              <div className="upp-details-grid">
                <div className="upp-detail-row">
                  <label className="upp-detail-label">Name</label>
                  <div className="upp-detail-value">
                    {showEdit ? (
                      <input 
                        className="upp-input"
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Your name"
                      />
                    ) : (
                      <span>{user?.name || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="upp-detail-row">
                  <label className="upp-detail-label">Email</label>
                  <div className="upp-detail-value">
                    <a href={`mailto:${user?.email}`} className="upp-email-link">
                      {user?.email || 'Not provided'}
                    </a>
                  </div>
                </div>

                <div className="upp-detail-row">
                  <label className="upp-detail-label">Mobile</label>
                  <div className="upp-detail-value">
                    {showEdit ? (
                      <input 
                        className="upp-input"
                        value={mobile} 
                        onChange={e => setMobile(e.target.value)} 
                        placeholder="Your mobile"
                      />
                    ) : (
                      <span>{user?.mobile || 'Not provided'}</span>
                    )}
                  </div>
                </div>

                <div className="upp-detail-row upp-detail-full">
                  <label className="upp-detail-label">Address</label>
                  <div className="upp-detail-value">
                    {showEdit ? (
                      <div className="upp-address-form">
                        <div className="upp-form-grid">
                          <input 
                            className="upp-input"
                            name="doorNo" 
                            value={address.doorNo} 
                            onChange={handleAddressChange} 
                            placeholder="Door No*"
                            required
                          />
                          <input 
                            className="upp-input"
                            name="addressLine1" 
                            value={address.addressLine1} 
                            onChange={handleAddressChange} 
                            placeholder="Address Line 1*"
                            required
                          />
                          <input 
                            className="upp-input"
                            name="addressLine2" 
                            value={address.addressLine2} 
                            onChange={handleAddressChange} 
                            placeholder="Address Line 2"
                          />
                          <input 
                            className="upp-input"
                            name="landmark" 
                            value={address.landmark} 
                            onChange={handleAddressChange} 
                            placeholder="Landmark"
                          />
                          <input 
                            className="upp-input"
                            name="pincode" 
                            value={address.pincode} 
                            onChange={handleAddressChange} 
                            placeholder="Pincode*"
                            required
                          />
                          <input 
                            className="upp-input"
                            name="city" 
                            value={address.city} 
                            onChange={handleAddressChange} 
                            placeholder="City*"
                            required
                          />
                          <input 
                            className="upp-input"
                            name="state" 
                            value={address.state} 
                            onChange={handleAddressChange} 
                            placeholder="State*"
                            required
                          />
                          <input 
                            className="upp-input"
                            name="country" 
                            value={address.country} 
                            onChange={handleAddressChange} 
                            placeholder="Country*"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      address.doorNo || address.addressLine1 ? (
                        <div className="upp-address-display">
                          {address.doorNo && <span>{address.doorNo}, </span>}
                          {address.addressLine1}
                          {address.addressLine2 && <span>, {address.addressLine2}</span>}
                          {address.landmark && <span>, {address.landmark}</span>}
                          <br />
                          {address.city && <span>{address.city}, </span>}
                          {address.state && <span>{address.state}, </span>}
                          {address.country && <span>{address.country} - </span>}
                          {address.pincode && <span>{address.pincode}</span>}
                        </div>
                      ) : (
                        <span className="upp-no-address">No address added</span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {showEdit && (
                <div className="upp-actions">
                  <button 
                    className="upp-btn upp-btn-primary upp-btn-save"
                    onClick={handleProfileSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  {error && <div className="upp-error-message">{error}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;