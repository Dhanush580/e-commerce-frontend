import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserOrders.css';

const UserOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    // Always fetch latest user info before fetching orders
    const fetchAndSyncUserAndOrders = async () => {
      setLoading(true);
      let userEmail = user?.email;
      try {
        // Try to fetch latest user profile
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const profileRes = await fetch(`${baseUrl}/profile`, { credentials: 'include' });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.user && profileData.user.email) {
            userEmail = profileData.user.email;
          }
        }
      } catch {}
      if (!userEmail) {
        setOrders([]);
        setLoading(false);
        return;
      }
      try {
  const res = await fetch(`${baseUrl}/user-orders/${userEmail}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
      }
      setLoading(false);
    };
    fetchAndSyncUserAndOrders();
  }, [user, isAuthenticated, navigate]);

  // Prevent back/forward cache showing this page after logout
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted && !isAuthenticated) {
        navigate('/', { replace: true });
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [isAuthenticated, navigate]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'delivered' || statusLower === 'completed') return '#10b981';
    if (statusLower === 'shipped') return '#3b82f6';
    if (statusLower === 'processing') return '#f59e0b';
    if (statusLower === 'cancelled' || statusLower === 'failed') return '#ef4444';
    return '#6b7280';
  };

  const getPaymentStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'paid' || statusLower === 'completed') return '#10b981';
    if (statusLower === 'pending') return '#f59e0b';
    if (statusLower === 'failed') return '#ef4444';
    return '#6b7280';
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null;
  const buildProgress = (order) => {
    const status = order.deliveryStatus || 'Order Placed';
    const ts = order.deliveryTimestamps || {};
    return [
      { key: 'Order Placed', active: true, completed: true, at: fmt(ts.placedAt || order.createdAt) },
      { key: 'Out for Delivery', active: status === 'Out for Delivery' || status === 'Delivered', completed: status === 'Out for Delivery' || status === 'Delivered', at: fmt(ts.outForDeliveryAt) },
      { key: 'Delivered', active: status === 'Delivered', completed: status === 'Delivered', at: fmt(ts.deliveredAt) },
    ];
  };

  const getStepIcon = (key, completed) => {
    switch (key) {
      case 'Order Placed':
        return '🧾';
      case 'Out for Delivery':
        return '🚚';
      case 'Delivered':
        return completed ? '✅' : '📦';
      default:
        return '•';
    }
  };

  return (
    <div className="uop-container">
      <div className="uop-content">
        <div className="uop-header">
          <h1 className="uop-title">Your Orders</h1>
          <p className="uop-subtitle">Track and manage your purchases</p>
        </div>

        {loading ? (
          <div className="uop-loading">
            <div className="uop-spinner"></div>
            <p className="uop-loading-text">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="uop-empty">
            <div className="uop-empty-icon">📦</div>
            <h3 className="uop-empty-title">No orders yet</h3>
            <p className="uop-empty-text">Your orders will appear here once you make a purchase</p>
            <button 
              className="uop-empty-btn"
              onClick={() => navigate('/')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="uop-orders-grid">
            {orders.map((order) => (
              <div className="uop-order-card" key={order._id}>
                <div className="uop-order-header">
                  <div className="uop-order-meta">
                    <span className="uop-order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="uop-order-id">Order #{order._id}</span>
                  </div>
                  <div className="uop-order-total">₹{order.total}</div>
                </div>

                <div className="uop-order-status-section">
                  {/* Three-step delivery progress */}
                  <div className="uop-progress">
                    {buildProgress(order).map((step, idx) => (
                      <div key={step.key} className={`uop-progress-step ${step.completed ? 'completed' : ''}`}>
                        <div className="uop-progress-icon" aria-hidden>
                          {getStepIcon(step.key, step.completed)}
                        </div>
                        <div className="uop-progress-label">{step.key}</div>
                        <div className="uop-progress-time">{step.at || '—'}</div>
                        {idx < 2 && <div className="uop-progress-line" />}
                      </div>
                    ))}
                  </div>

                  {/* Payment info remains */}
                  <div className="uop-status-item">
                    <span className="uop-status-label">Payment:</span>
                    <div className="uop-payment-info">
                      <span className="uop-payment-method">
                        {order.payment?.method === 'card' ? '💳 Card' : '💰 Cash on Delivery'}
                      </span>
                      <span 
                        className="uop-payment-status"
                        style={{ color: getPaymentStatusColor(order.payment?.status) }}
                      >
                        {order.payment?.status ? 
                          order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1) 
                          : 'Pending'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="uop-order-items">
                  <h4 className="uop-items-title">Items ({order.items.length})</h4>
                  <div className="uop-items-list">
                    {order.items.map((item, idx) => (
                      <div className="uop-item" key={idx}>
                        <span className="uop-item-name">{item.name}</span>
                        <div className="uop-item-details">
                          <span className="uop-item-quantity">x{item.quantity}</span>
                          <span className="uop-item-price">₹{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;