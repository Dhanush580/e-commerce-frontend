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
  const [mobileDropdown, setMobileDropdown] = useState({ clothing: false, accessories: false });
  const { user, logout, isAuthenticated } = useAuth();
  const { getWishlistCount } = useWishlist();
  const { getCartCount } = useCart();
  const { isAdmin, adminLogout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      // Closing menu: collapse mobile dropdowns
      setMobileDropdown({ clothing: false, accessories: false });
    }
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

  const isMobileView = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && window.matchMedia('(max-width: 968px)').matches;
  };

  const toggleDropdown = (name) => (e) => {
    // Only toggle via click on mobile view; keep hover behavior on desktop
    if (isMobileView()) {
      e.preventDefault();
      e.stopPropagation();
      setMobileDropdown((prev) => {
        const nextState = { clothing: false, accessories: false };
        nextState[name] = !prev[name];
        return nextState;
      });
    }
  };

  // Shared menu links (used in desktop center and mobile dropdown)
  const closeMenuAndCollapse = () => {
    setIsMenuOpen(false);
    setMobileDropdown({ clothing: false, accessories: false });
  };

  const MenuLinks = ({ onNavigate }) => (
    <>
      <Link to="/" className="navbar-link" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>
        <span className="nav-text">Home</span>
      </Link>
      <Link to="/shop" className="navbar-link" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>
        <span className="nav-text">Shop</span>
      </Link>
      <div className={`dropdown ${mobileDropdown.clothing ? 'active' : ''}`}>
        <span className="navbar-link dropdown-trigger" onClick={toggleDropdown('clothing')}>
          <span className="nav-text">Clothing</span>
          <FaChevronDown className="dropdown-icon" />
        </span>
        <div className="dropdown-content">
          <Link to="/sarees" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>Sarees</Link>
          <Link to="/dresses" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>Dresses</Link>
        </div>
      </div>
      <div className={`dropdown ${mobileDropdown.accessories ? 'active' : ''}`}>
        <span className="navbar-link dropdown-trigger" onClick={toggleDropdown('accessories')}>
          <span className="nav-text">Accessories</span>
          <FaChevronDown className="dropdown-icon" />
        </span>
        <div className="dropdown-content">
          <Link to="/earrings" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>Earrings</Link>
          <Link to="/necklaces" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>Necklaces</Link>
          <Link to="/pendants" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>Pendants</Link>
          <Link to="/rings" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>Rings</Link>
          <Link to="/temple-jewellery" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>Temple Jewellery</Link>
          <Link to="/bangles" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>Bangles</Link>
        </div>
      </div>
      <Link to="/best-sellers" className="navbar-link" onClick={() => { closeMenuAndCollapse(); onNavigate && onNavigate(); }}>
        <span className="nav-text">Best Sellers</span>
      </Link>
    </>
  );


  return (
    <>
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo - Left (desktop); will be centered on mobile via CSS */}
        <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
          <FaGem className="logo-icon" />
          <span className="logo-text">RS Collections</span>
        </Link>

        {/* Menu Links - Center (desktop); slides in on mobile */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <MenuLinks />
        </div>
        {/* Mobile menu backdrop (closes menu on tap) */}
        <div
          className={`menu-backdrop ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden
        />

        {/* Icons - Right (desktop) */}
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

        {/* Mobile hamburger (left) */}
        <div className="hamburger" onClick={toggleMenu}>
          {isMenuOpen ? (
            <FaTimes className="hamburger-icon" />
          ) : (
            <FaBars className="hamburger-icon" />
          )}
        </div>

        {/* Mobile-only right actions */}
        <div className="mobile-actions">
          {!isAuthenticated ? (
            <>
              <button className="profile-btn" aria-label="Profile" onClick={handleLoginClick}>
                <FaUser />
              </button>
              <button 
                className="search-btn" 
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <FaSearch />
              </button>
            </>
          ) : (
            <>
              <button 
                className="search-btn" 
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <FaSearch />
              </button>
              <Link to="/wishlist" className="wishlist-btn" aria-label="Wishlist" onClick={() => setIsMenuOpen(false)}>
                <FaHeart />
                {getWishlistCount() > 0 && (
                  <span className="wishlist-count">{getWishlistCount()}</span>
                )}
              </Link>
              <Link to="/cart" className="cart-btn" aria-label="Cart" onClick={() => setIsMenuOpen(false)}>
                <FaShoppingCart />
                {getCartCount() > 0 && (
                  <span className="cart-count">{getCartCount()}</span>
                )}
              </Link>
            </>
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

    {/* Floating Profile Shortcut (bottom-left) when logged in */}
    {isAuthenticated && (
      <Link
        to="/user"
        className={`floating-profile ${isMenuOpen ? 'hidden' : ''}`}
        aria-label="Open Profile"
        onClick={() => setIsMenuOpen(false)}
      >
        <FaUser className="floating-profile-icon" />
        <span className="floating-profile-email">{user?.email || 'Profile'}</span>
      </Link>
    )}

    </>
  );
};

export default Navbar;
