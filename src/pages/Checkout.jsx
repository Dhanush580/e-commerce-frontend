import React, { useState } from 'react';
import { loadRazorpayScript } from '../utils/RazorpayLoader';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './Checkout.css';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const [editMode, setEditMode] = useState(() => !user?.address);
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Prevent back/forward cache showing this page after logout
  React.useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted && !isAuthenticated) {
        navigate('/', { replace: true });
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [isAuthenticated, navigate]);

  // Address state (single address object)
  const [address, setAddress] = useState(() => {
    if (user?.address) {
      return {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.mobile || '',
        addressLine1: user.address.addressLine1 || '',
        addressLine2: user.address.addressLine2 || '',
        addressLine: user.address.addressLine || '',
        doorNo: user.address.doorNo || '',
        landmark: user.address.landmark || '',
        pincode: (user.address.pincode !== undefined && user.address.pincode !== null) ? user.address.pincode : (user.address.postalCode || ''),
        city: user.address.city || '',
        state: user.address.state || '',
        country: user.address.country || ''
      };
    }
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.mobile || '',
      addressLine1: '',
      addressLine2: '',
      addressLine: '',
      doorNo: '',
      landmark: '',
      pincode: '',
      city: '',
      state: '',
      country: ''
    };
  });
  
  // Update address state if user or user.address changes
  React.useEffect(() => {
    if (user?.address) {
      setAddress({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.mobile || '',
        ...user.address
      });
    }
  }, [user]);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [orderError, setOrderError] = useState('');

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value,
      addressLine: name === 'addressLine1' || name === 'addressLine2'
        ? [name === 'addressLine1' ? value : prev.addressLine1 || '', name === 'addressLine2' ? value : prev.addressLine2 || ''].filter(Boolean).join(', ')
        : [prev.addressLine1 || '', prev.addressLine2 || ''].filter(Boolean).join(', ')
    }));
  };

  const validate = () => {
    const errs = {};
    if (!address.name) errs.name = 'Name required';
    if (!address.email) errs.email = 'Email required';
    if (!address.phone) errs.phone = 'Phone required';
    if (!address.doorNo) errs.doorNo = 'Door No required';
    if (!address.landmark) errs.landmark = 'Landmark required';
    if (!address.pincode) errs.pincode = 'Pincode required';
    if (!address.addressLine) errs.addressLine = 'Address required';
    if (!address.city) errs.city = 'City required';
    if (!address.state) errs.state = 'State required';
    if (!address.country) errs.country = 'Country required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOrderError('');
    try {
      const backendAddress = {
        name: address.name,
        email: address.email,
        phone: address.phone,
        doorNo: address.doorNo,
        landmark: address.landmark,
        pincode: address.pincode,
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        addressLine: [address.addressLine1, address.addressLine2].filter(Boolean).join(', '),
        city: address.city,
        state: address.state,
        country: address.country
      };
      
      const errs = {};
      if (!backendAddress.name) errs.name = 'Name required';
      if (!backendAddress.email) errs.email = 'Email required';
      if (!backendAddress.phone) errs.phone = 'Phone required';
      if (!backendAddress.doorNo) errs.doorNo = 'Door No required';
      if (!backendAddress.landmark) errs.landmark = 'Landmark required';
      if (!backendAddress.pincode) errs.pincode = 'Pincode required';
      if (!backendAddress.addressLine1) errs.addressLine1 = 'Address Line 1 required';
      if (!backendAddress.addressLine) errs.addressLine = 'Address required';
      if (!backendAddress.city) errs.city = 'City required';
      if (!backendAddress.state) errs.state = 'State required';
      if (!backendAddress.country) errs.country = 'Country required';
      setErrors(errs);
      
      if (Object.keys(errs).length > 0) {
        setOrderError('Please fill all required address fields.');
        console.error('Order validation failed. backendAddress:', backendAddress, 'errs:', errs);
        return;
      }
      
      setLoading(true);
      
      const baseUrl = import.meta.env.VITE_API_URL || '';
      if (saveAddress) {
        try {
          await fetch(`${baseUrl}/profile/address`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              ...backendAddress
            })
          });
        } catch (err) {
          // Ignore address save errors
        }
      }

      const placeOrder = async (paymentStatus, razorpayPaymentId = null) => {
        try {
          const orderRes = await fetch(`${baseUrl}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: user?.email || backendAddress.email,
              address: backendAddress,
              payment: {
                method: paymentMethod,
                status: paymentStatus,
                razorpayPaymentId
              },
              items: cartItems,
              total: getCartTotal()
            })
          });
          if (!orderRes.ok) throw new Error('Order not saved');
          const data = await orderRes.json();
          await clearCart();
          setLoading(false);
          navigate('/order-confirmation', { state: { order: data.order } });
        } catch (err) {
          setLoading(false);
          let msg = 'Order placement failed. Please contact support.';
          if (err.response && err.response.errors) {
            msg = err.response.errors.map(e => e.msg).join(', ');
          } else if (err.message) {
            msg = err.message;
          }
          setOrderError(msg);
        }
      };

      if (paymentMethod === 'card') {
        const res = await loadRazorpayScript();
        if (!res) {
          setLoading(false);
          setOrderError('Razorpay SDK failed to load.');
          return;
        }
        const options = {
          key: 'rzp_test_RLpLrHsemzs7ZF',
          amount: getCartTotal() * 100,
          currency: 'INR',
          name: 'RS Collections',
          description: 'Order Payment',
          handler: function (response) {
            placeOrder('paid', response.razorpay_payment_id);
          },
          prefill: {
            name: backendAddress.name,
            email: backendAddress.email,
            contact: backendAddress.phone
          },
          notes: {
            address: `${backendAddress.addressLine}, ${backendAddress.city}, ${backendAddress.state}, ${backendAddress.country}, ${backendAddress.pincode}`
          },
          theme: {
            color: '#0a7d4d'
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setOrderError('Payment failed or was cancelled. Please try again.');
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        placeOrder('pending');
      }
    } catch (err) {
      setLoading(false);
      setOrderError('Order failed: ' + (err?.message || 'Unknown error'));
      console.error('Order placement error:', err);
    }
  };

  return (
    <div className="cp-container">
      <div className="cp-content">
        <div className="cp-header">
          <h1 className="cp-title">Checkout</h1>
          <div className="cp-stepper">
            <div className="cp-step cp-step-active">
              <div className="cp-step-number">1</div>
              <span>Shipping</span>
            </div>
            <div className="cp-step-divider"></div>
            <div className="cp-step">
              <div className="cp-step-number">2</div>
              <span>Payment</span>
            </div>
            <div className="cp-step-divider"></div>
            <div className="cp-step">
              <div className="cp-step-number">3</div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="cp-loading-overlay">
            <div className="cp-loading-spinner"></div>
            <p className="cp-loading-text">Processing your order...</p>
          </div>
        )}

        {!loading && (cartItems.length === 0 ? (
          <div className="cp-empty-state">
            <div className="cp-empty-icon">🛒</div>
            <h2 className="cp-empty-title">Your cart is empty</h2>
            <p className="cp-empty-description">Add some items to your cart to continue shopping</p>
            <button 
              className="cp-empty-btn"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cp-main-content">
            <div className="cp-order-summary">
              <h2 className="cp-section-title">Order Summary</h2>
              <div className="cp-items-list">
                {cartItems.map(item => (
                  <div className="cp-item" key={item.id}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="cp-item-image" 
                    />
                    <div className="cp-item-details">
                      <h3 className="cp-item-name">{item.name}</h3>
                      <div className="cp-item-meta">
                        <span className="cp-item-quantity">Qty: {item.quantity}</span>
                        <span className="cp-item-price">₹{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cp-total-section">
                <div className="cp-total-line">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <div className="cp-total-line">
                  <span>Shipping</span>
                  <span className="cp-free-shipping">FREE</span>
                </div>
                <div className="cp-total-final">
                  <span>Total</span>
                  <span className="cp-total-amount">₹{getCartTotal()}</span>
                </div>
              </div>
            </div>

            <form className="cp-checkout-form" onSubmit={handlePlaceOrder}>
              <div className="cp-form-section">
                <h2 className="cp-section-title">Shipping Information</h2>
                
                <div className="cp-user-info">
                  <div className="cp-info-item">
                    <span className="cp-info-label">Name:</span>
                    <span className="cp-info-value">{user?.name || '-'}</span>
                  </div>
                  <div className="cp-info-item">
                    <span className="cp-info-label">Email:</span>
                    <span className="cp-info-value">{user?.email || '-'}</span>
                  </div>
                  <div className="cp-info-item">
                    <span className="cp-info-label">Mobile:</span>
                    <span className="cp-info-value">{user?.mobile || '-'}</span>
                  </div>
                </div>

                {user?.address && !editMode ? (
                  <div className="cp-address-display">
                    <div className="cp-address-header">
                      <h3>Saved Address</h3>
                      <button 
                        type="button" 
                        className="cp-edit-btn"
                        onClick={() => setEditMode(true)}
                      >
                        Edit
                      </button>
                    </div>
                    <div className="cp-address-details">
                      <p><strong>{user.address.doorNo || '-'}</strong>, {user.address.landmark || '-'}</p>
                      <p>{[user.address.addressLine1, user.address.addressLine2]
                        .filter(Boolean)
                        .join(', ') || user.address.addressLine || '-'}</p>
                      <p>{user.address.city || '-'}, {user.address.state || '-'} - {user.address.pincode || user.address.postalCode || '-'}</p>
                      <p>{user.address.country || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="cp-address-form">
                    <div className="cp-form-grid">
                      <div className="cp-form-group">
                        <label className="cp-label">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={address.name}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Enter your full name"
                        />
                        {errors.name && <span className="cp-error">{errors.name}</span>}
                      </div>

                      <div className="cp-form-group">
                        <label className="cp-label">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={address.email}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Enter your email"
                        />
                        {errors.email && <span className="cp-error">{errors.email}</span>}
                      </div>

                      <div className="cp-form-group">
                        <label className="cp-label">Phone *</label>
                        <input
                          type="text"
                          name="phone"
                          value={address.phone}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && <span className="cp-error">{errors.phone}</span>}
                      </div>

                      <div className="cp-form-group">
                        <label className="cp-label">Door No *</label>
                        <input
                          type="text"
                          name="doorNo"
                          value={address.doorNo}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Door/Flat number"
                        />
                        {errors.doorNo && <span className="cp-error">{errors.doorNo}</span>}
                      </div>

                      <div className="cp-form-group">
                        <label className="cp-label">Landmark *</label>
                        <input
                          type="text"
                          name="landmark"
                          value={address.landmark}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Nearby landmark"
                        />
                        {errors.landmark && <span className="cp-error">{errors.landmark}</span>}
                      </div>

                      <div className="cp-form-group">
                        <label className="cp-label">Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={address.pincode}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Enter pincode"
                        />
                        {errors.pincode && <span className="cp-error">{errors.pincode}</span>}
                      </div>

                      <div className="cp-form-group cp-full-width">
                        <label className="cp-label">Address Line 1 *</label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={address.addressLine1}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Street address, area, colony"
                        />
                        {errors.addressLine && <span className="cp-error">{errors.addressLine}</span>}
                      </div>

                      <div className="cp-form-group cp-full-width">
                        <label className="cp-label">Address Line 2</label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={address.addressLine2}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Apartment, suite, unit (optional)"
                        />
                      </div>

                      <div className="cp-form-group">
                        <label className="cp-label">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={address.city}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Enter city"
                        />
                        {errors.city && <span className="cp-error">{errors.city}</span>}
                      </div>

                      <div className="cp-form-group">
                        <label className="cp-label">State *</label>
                        <input
                          type="text"
                          name="state"
                          value={address.state}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Enter state"
                        />
                        {errors.state && <span className="cp-error">{errors.state}</span>}
                      </div>

                      <div className="cp-form-group cp-full-width">
                        <label className="cp-label">Country *</label>
                        <input
                          type="text"
                          name="country"
                          value={address.country}
                          onChange={handleAddressChange}
                          className="cp-input"
                          placeholder="Enter country"
                        />
                        {errors.country && <span className="cp-error">{errors.country}</span>}
                      </div>
                    </div>

                    <div className="cp-save-address">
                      <label className="cp-checkbox-label">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={e => setSaveAddress(e.target.checked)}
                          className="cp-checkbox"
                        />
                        <span className="cp-checkbox-custom"></span>
                        Save this address for future orders
                      </label>
                    </div>

                    {user?.address && (
                      <div className="cp-form-actions">
                        <button 
                          type="button" 
                          className="cp-cancel-btn"
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="cp-form-section">
                <h2 className="cp-section-title">Payment Method</h2>
                <div className="cp-payment-options">
                  <label className="cp-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="cp-radio"
                    />
                    <div className="cp-payment-content">
                      <div className="cp-payment-icon">💳</div>
                      <div className="cp-payment-info">
                        <span className="cp-payment-title">Credit/Debit Card</span>
                        <span className="cp-payment-desc">Secure payment via Razorpay</span>
                      </div>
                    </div>
                  </label>

                  <label className="cp-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="cp-radio"
                    />
                    <div className="cp-payment-content">
                      <div className="cp-payment-icon">💰</div>
                      <div className="cp-payment-info">
                        <span className="cp-payment-title">Cash on Delivery</span>
                        <span className="cp-payment-desc">Pay when you receive your order</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {orderError && (
                <div className="cp-order-error">
                  <div className="cp-error-icon">⚠️</div>
                  <span>{orderError}</span>
                </div>
              )}

              <button
                className="cp-place-order-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="cp-btn-spinner"></div>
                    Processing...
                  </>
                ) : (
                  `Place Order - ₹${getCartTotal()}`
                )}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Checkout;