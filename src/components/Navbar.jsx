import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import { useAdmin } from '../contexts/AdminContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAdmin } from '../contexts/AdminContext';
import { 
  FaGem, 
  FaSearch, 
  FaShoppingCart, 
  FaHeart,
  FaUser, 
  FaBars, 
  FaTimes,
  FaChevronDown,
  FaSignOutAlt,
  FaCog,
  FaBoxOpen
} from 'react-icons/fa';
import SearchModal from './SearchModal';
import LoginModal from './LoginModal';
import Login from '../pages/Login';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { getWishlistCount } = useWishlist();
  const { getCartCount } = useCart();
  const { isAdmin, adminLogout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  // Listen for custom event to open login modal (from ProductCard)
  React.useEffect(() => {
    const openLogin = () => setIsLoginOpen(true);
    window.addEventListener('open-login-modal', openLogin);
    return () => window.removeEventListener('open-login-modal', openLogin);
  }, []);

  const handleLoginClick = () => {
    // Store current location for redirect after login
    if (location.pathname !== '/login') {
      localStorage.setItem('redirectPath', location.pathname + location.search);
    }
    setIsMenuOpen(false);
    setIsLoginOpen(true);
  };


  const handleLogout = () => {
    if (isAdmin) {
      adminLogout();
    } else {
      logout();
      // Redirect to home and replace history entry to prevent back navigation to protected pages
      navigate('/', { replace: true });
    }
    setShowUserMenu(false);
    setIsMenuOpen(false);
  };



  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo - Left */}
        <Link to="/" className="navbar-logo">
          <FaGem className="logo-icon" />
          <span className="logo-text">RS Collections</span>
        </Link>

        {/* Menu Links - Center */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}> 
          <Link to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/shop" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
            Shop
          </Link>
          <div className="dropdown">
            <span className="navbar-link dropdown-trigger">
              Clothing
              <FaChevronDown className="dropdown-icon" />
            </span>
            <div className="dropdown-content">
              <Link to="/sarees" onClick={() => setIsMenuOpen(false)}>Sarees</Link>
              <Link to="/dresses" onClick={() => setIsMenuOpen(false)}>Dresses</Link>
            </div>
          </div>
          <div className="dropdown">
            <span className="navbar-link dropdown-trigger">
              Accessories
              <FaChevronDown className="dropdown-icon" />
            </span>
            <div className="dropdown-content">
              <Link to="/earrings" onClick={() => setIsMenuOpen(false)}>Earrings</Link>
              <Link to="/necklaces" onClick={() => setIsMenuOpen(false)}>Necklaces</Link>
              <Link to="/pendants" onClick={() => setIsMenuOpen(false)}>Pendants</Link>
              <Link to="/rings" onClick={() => setIsMenuOpen(false)}>Rings</Link>
              <Link to="/temple-jewellery" onClick={() => setIsMenuOpen(false)}>Temple Jewellery</Link>
              <Link to="/bangles" onClick={() => setIsMenuOpen(false)}>Bangles</Link>
            </div>
          </div>
          <Link to="/best-sellers" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
            Best Sellers
          </Link>
        </div>

        {/* Icons - Right */}
        <div className="navbar-actions">
          <div className="action-buttons">
            <button 
              className="search-btn" 
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <FaSearch />
            </button>
            <Link to="/wishlist" className="wishlist-btn" aria-label="Wishlist">
              <FaHeart />
              {getWishlistCount() > 0 && (
                <span className="wishlist-count">{getWishlistCount()}</span>
              )}
            </Link>
            <Link to="/cart" className="cart-btn" aria-label="Cart">
              <FaShoppingCart />
              {getCartCount() > 0 && (
                <span className="cart-count">{getCartCount()}</span>
              )}
            </Link>
            {/* Profile Icon Only */}
            {isAuthenticated ? (
              <Link to="/user" className="profile-btn" aria-label="Profile">
                <FaUser />
              </Link>
            ) : (
              <button className="profile-btn" aria-label="Profile" onClick={handleLoginClick}>
                <FaUser />
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu hamburger */}
        <div className="hamburger" onClick={toggleMenu}>
          {isMenuOpen ? (
            <FaTimes className="hamburger-icon" />
          ) : (
            <FaBars className="hamburger-icon" />
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <Login />
      </LoginModal>
    </nav>
  );
};

export default Navbar;
