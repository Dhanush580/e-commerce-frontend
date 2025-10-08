import React, { useState } from 'react';
import { FaShoppingCart, FaArrowLeft, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import './Cart.css';
import { resolveImageUrl } from '../utils/imageUrl';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cartItems, getCartTotal, removeFromCart, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  const openLoginModal = () => {
    try {
      if (typeof window !== 'undefined') {
        if (typeof window.openLoginModal === 'function') {
          window.openLoginModal();
          return;
        }
        // Fallback: trigger event for Navbar listener
        window.dispatchEvent(new CustomEvent('open-login-modal'));
      }
    } catch (e) {
      // As a last resort, navigate to the login page
      navigate('/login');
    }
  };

  const handleBuyNow = () => {
    navigate('/checkout');
  };

  const inc = async (item) => {
    if (updatingId) return;
    setUpdatingId(item.id);
    try {
      await updateQuantity(item.id, (item.quantity || 1) + 1);
    } finally {
      setUpdatingId(null);
    }
  };

  const dec = async (item) => {
    if (updatingId) return;
    if ((item.quantity || 1) <= 1) return;
    setUpdatingId(item.id);
    try {
      await updateQuantity(item.id, item.quantity - 1);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="wp-cart-container">
      <div className="wp-cart-header">
        <h1 className="wp-cart-title">Your Shopping Cart</h1>
        <p className="wp-cart-subtitle">Review your selected jewelry pieces</p>
      </div>

      {!isAuthenticated ? (
        <div className="wp-cart-empty-state">
          <div className="wp-cart-empty-icon">
            <FaShoppingCart />
          </div>
          <h2>Please Login to View Your Cart</h2>
          <p>Sign in to access your cart and continue shopping</p>
          <div className="wp-cart-empty-actions">
            <button 
              className="wp-btn-primary"
              onClick={openLoginModal}
            >
              Login to Continue
            </button>
            <button 
              className="wp-btn-secondary"
              onClick={() => navigate('/')}
            >
              <FaArrowLeft />
              Back to Home
            </button>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="wp-cart-empty-state">
          <div className="wp-cart-empty-icon">
            <FaShoppingCart />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Discover our beautiful jewelry collection</p>
          <div className="wp-cart-empty-actions">
              <button 
                className="wp-btn-primary"
                onClick={() => navigate('/shop')}
            >
              Start Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="wp-cart-content">
          <div className="wp-cart-items">
            {cartItems.map(item => (
              <div className="wp-cart-item" key={item.id}>
                <div className="wp-cart-item-image-container">
                  <img 
                    src={resolveImageUrl(item)} 
                    alt={item.name} 
                    className="wp-cart-item-image"
                  />
                </div>
                
                <div className="wp-cart-item-details">
                  <h3 className="wp-cart-item-name">{item.name}</h3>
                  <p className="wp-cart-item-price">₹{item.price}</p>
                  
                  <div className="wp-cart-item-controls">
                    <div className="wp-quantity-control">
                      <button
                        className={`wp-qty-btn ${(item.quantity || 1) <= 1 ? 'wp-qty-btn-disabled' : ''}`}
                        onClick={() => dec(item)}
                        disabled={updatingId === item.id || (item.quantity || 1) <= 1}
                      >
                        <FaMinus />
                      </button>
                      <span className="wp-qty-value">{item.quantity}</span>
                      <button
                        className="wp-qty-btn"
                        onClick={() => inc(item)}
                        disabled={updatingId === item.id}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    
                    <button 
                      className="wp-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FaTrash />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="wp-cart-summary">
            <div className="wp-cart-total">
              <span>Total Amount:</span>
              <span className="wp-cart-total-price">₹{getCartTotal()}</span>
            </div>
            
            <div className="wp-cart-actions">
              <button 
                className="wp-btn-secondary"
                onClick={() => navigate('/shop')}
              >
                <FaArrowLeft />
                Continue Shopping
              </button>
              <button 
                className="wp-btn-primary wp-btn-buy"
                onClick={handleBuyNow}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;