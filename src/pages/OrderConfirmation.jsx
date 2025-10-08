import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const order = location.state?.order;

  React.useEffect(() => {
    if (!isAuthenticated || !order) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, order, navigate]);

  // Prevent back/forward cache showing this page after logout
  React.useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted && (!isAuthenticated || !order)) {
        navigate('/', { replace: true });
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [isAuthenticated, order, navigate]);

  if (!order) {
    return null;
  }

  return (
    <div className="ocp-container">
      <div className="ocp-card">
        {/* Success Header */}
        <div className="ocp-success-header">
          <div className="ocp-success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="ocp-title">Order Confirmed!</h1>
          <p className="ocp-subtitle">Thank you for your purchase</p>
        </div>

        {/* Order Details */}
        <div className="ocp-order-details">
          <div className="ocp-detail-section">
            <h2 className="ocp-section-title">Order Information</h2>
            <div className="ocp-detail-grid">
              <div className="ocp-detail-item">
                <span className="ocp-detail-label">Order ID</span>
                <span className="ocp-detail-value">{order._id}</span>
              </div>
              <div className="ocp-detail-item">
                <span className="ocp-detail-label">Payment Method</span>
                <span className="ocp-detail-value">
                  {order.payment.method === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                </span>
              </div>
              <div className="ocp-detail-item">
                <span className="ocp-detail-label">Payment Status</span>
                <span className={`ocp-status ocp-status-${order.payment.status.toLowerCase()}`}>
                  {order.payment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="ocp-detail-section">
            <h2 className="ocp-section-title">Shipping Address</h2>
            <div className="ocp-address-card">
              <p className="ocp-address-name">{order.address.name}</p>
              <p className="ocp-address-email">{order.address.email}</p>
              <p className="ocp-address-phone">{order.address.phone}</p>
              <p className="ocp-address-full">
                {order.address.doorNo ? order.address.doorNo + ', ' : ''}
                {order.address.addressLine}
                {order.address.landmark ? ', ' + order.address.landmark : ''}
                <br />
                {order.address.city}, {order.address.state}
                <br />
                {order.address.country} - {order.address.pincode}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="ocp-detail-section">
            <h2 className="ocp-section-title">Order Items</h2>
            <div className="ocp-items-list">
              {order.items.map((item, idx) => (
                <div key={idx} className="ocp-item-card">
                  <div className="ocp-item-info">
                    <span className="ocp-item-name">{item.name}</span>
                    <span className="ocp-item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <span className="ocp-item-price">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="ocp-total-section">
            <div className="ocp-total-row">
              <span className="ocp-total-label">Total Amount</span>
              <span className="ocp-total-amount">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          className="ocp-home-button"
          onClick={() => navigate('/')}
        >
          Continue Shopping
          <svg className="ocp-button-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;