import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import { FaHeart, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import './Cart.css';
import './WishlistGrid.css';

const Wishlist = () => {
  const { isAuthenticated, user } = useAuth();
  const { wishlistItems, getWishlistCount } = useWishlist();
  const navigate = useNavigate();

  const openLoginModal = () => {
    try {
      if (typeof window !== 'undefined') {
        if (typeof window.openLoginModal === 'function') {
          window.openLoginModal();
          return;
        }
        window.dispatchEvent(new CustomEvent('open-login-modal'));
      }
    } catch (e) {
      navigate('/login');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="wp-cart-container">
        <div className="wp-cart-header">
          <h1 className="wp-cart-title">Your Wishlist</h1>
          <p className="wp-cart-subtitle">Sign in to view your saved items</p>
        </div>
        <div className="wp-cart-empty-state">
          <div className="wp-cart-empty-icon">
            <FaHeart />
          </div>
          <h2>Please Login to View Your Wishlist</h2>
          <p>Sign in to save your favorite items and access them from any device.</p>
          <div className="wp-cart-empty-actions">
            <button className="wp-btn-primary" onClick={openLoginModal}>Login to Continue</button>
            <button className="wp-btn-secondary" onClick={() => navigate('/') }>
              <FaArrowLeft />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="wp-cart-container">
        <div className="wp-cart-header">
          <h1 className="wp-cart-title">Your Wishlist</h1>
          <p className="wp-cart-subtitle">Saved items awaiting your next move</p>
        </div>
        <div className="wp-cart-empty-state">
          <div className="wp-cart-empty-icon">
            <FaHeart />
          </div>
          <h2>Your Wishlist is Empty</h2>
          <p>Discover amazing products and add them to your wishlist for later!</p>
          <div className="wp-cart-empty-actions">
            <button className="wp-btn-primary" onClick={() => navigate('/shop') }>
              <FaShoppingBag />
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-cart-container">
      <div className="wp-cart-header">
        <h1 className="wp-cart-title">Your Wishlist</h1>
        <p className="wp-cart-subtitle">{getWishlistCount()} {getWishlistCount() === 1 ? 'item' : 'items'} saved for later</p>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map(item => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>

      <div style={{ marginTop: 'var(--wp-spacing-lg)' }}>
        <button className="wp-btn-secondary" onClick={() => navigate('/shop') }>
          <FaArrowLeft />
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Wishlist;