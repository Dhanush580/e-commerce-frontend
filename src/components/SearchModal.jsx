import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaHistory, FaGem, FaShoppingBag } from 'react-icons/fa';
import './SearchModal.css';
import ProductQuickViewDialog from './ProductQuickViewDialog';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { resolveImageUrl } from '../utils/imageUrl';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart, removeFromCart, isInCart, updateQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const normalizeProduct = (p) => {
    if (!p) return p;
    const id = p._id || p.productId || p.id;
    const img = p.image || (Array.isArray(p.images) ? p.images[0] : undefined);
    return { ...p, id, image: img };
  };

  const categories = [
    { name: 'Rings', path: '/rings', icon: <FaGem /> },
    { name: 'Necklaces', path: '/necklaces', icon: <FaGem /> },
    { name: 'Earrings', path: '/earrings', icon: <FaGem /> },
    { name: 'Bangles', path: '/bangles', icon: <FaGem /> },
    { name: 'Pendants', path: '/pendants', icon: <FaGem /> },
    { name: 'Temple Jewellery', path: '/temple-jewellery', icon: <FaGem /> },
    { name: 'Sarees', path: '/sarees', icon: <FaShoppingBag /> },
    { name: 'Dresses', path: '/dresses', icon: <FaShoppingBag /> }
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch all products when modal opens
  useEffect(() => {
    if (isOpen && allProducts.length === 0) {
      fetchAllProducts();
    }
  }, [isOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle search suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      generateSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, allProducts]);

  const fetchAllProducts = async () => {
    try {
      setIsLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/products`);
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = (query) => {
    const lowerQuery = query.toLowerCase();
    const suggestions = [];

    // Category suggestions
    const matchingCategories = categories.filter(cat =>
      cat.name.toLowerCase().includes(lowerQuery)
    );
    
    matchingCategories.forEach(cat => {
      suggestions.push({
        type: 'category',
        text: cat.name,
        path: cat.path,
        icon: cat.icon,
        subtitle: 'Category'
      });
    });

    // Product suggestions
    const matchingProducts = allProducts
      .filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);

    matchingProducts.forEach(product => {
      const image = resolveImageUrl(product);
      suggestions.push({
        type: 'product',
        text: product.name,
        path: `/product/${product.productId}`,
        icon: <FaShoppingBag />,
        subtitle: `₹${product.price} • ${product.category}`,
        image,
        product
      });
    });

    setSuggestions(suggestions.slice(0, 10));
  };

  const saveRecentSearch = (searchTerm) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (searchTerm = searchQuery) => {
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm.trim());
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    saveRecentSearch(suggestion.text);
    if (suggestion.type === 'product' && suggestion.product) {
      // Open Quick View for the product, close the search modal
      const normalized = normalizeProduct(suggestion.product);
      setSelectedProduct(normalized);
      setQuickViewOpen(true);
      // Keep search modal open so Quick View can render reliably above it
      return;
    }
    // Default behavior for categories
    navigate(suggestion.path);
    onClose();
    setSearchQuery('');
  };

  const handleRecentSearchClick = (search) => {
    // Populate the input and show suggestions; do not navigate or close modal
    setSearchQuery(search);
    // focus input so user can continue editing/press Enter if they want full results
    setTimeout(() => {
      try { searchInputRef.current?.focus(); } catch {}
    }, 0);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
  <div className={`svb-search-overlay ${quickViewOpen ? 'svb-overlay-disabled' : ''}`} onClick={onClose}></div>
      <div className="svb-search-modal">
        <div className="svb-search-header">
          <div className="svb-search-input-container">
            <FaSearch className="svb-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="svb-search-input"
            />
            {searchQuery && (
              <button 
                className="svb-clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button className="svb-close-search-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="svb-search-content">
          {isLoading ? (
            <div className="svb-search-loading">
              <div className="svb-loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : searchQuery.trim() ? (
            <div className="svb-search-suggestions">
              <h3>Suggestions</h3>
              {suggestions.length > 0 ? (
                <div className="svb-suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`svb-suggestion-item svb-${suggestion.type}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.image ? (
                        <img src={suggestion.image} alt="" className="svb-suggestion-image" />
                      ) : (
                        <div className="svb-suggestion-icon">{suggestion.icon}</div>
                      )}
                      <div className="svb-suggestion-content">
                        <div className="svb-suggestion-title">{suggestion.text}</div>
                        <div className="svb-suggestion-subtitle">{suggestion.subtitle}</div>
                      </div>
                      {suggestion.type === 'category' && <FaGem className="svb-category-tag" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="svb-no-suggestions">
                  <p>No results found for "{searchQuery}"</p>
                  <button onClick={() => handleSearch()} className="svb-search-anyway-btn">
                    Search anyway
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="svb-search-default">
              {recentSearches.length > 0 && (
                <div className="svb-search-section">
                  <div className="svb-section-header">
                    <h3><FaHistory /> Recent Searches</h3>
                    <button onClick={clearRecentSearches} className="svb-clear-btn">
                      Clear all
                    </button>
                  </div>
                  <div className="svb-recent-searches">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="svb-recent-item"
                        onClick={() => handleRecentSearchClick(search)}
                      >
                        <FaHistory className="svb-recent-icon" />
                        <span>{search}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentSearches.length === 0 && (
                <div className="svb-search-placeholder">
                  <div className="svb-search-placeholder-content">
                    <FaSearch className="svb-search-placeholder-icon" />
                    <h3>Search our collection</h3>
                    <p>Find beautiful jewelry, sarees, and fashion accessories</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Quick View - opens above search modal */}
      <ProductQuickViewDialog
        open={quickViewOpen}
        product={selectedProduct}
        onClose={() => { setQuickViewOpen(false); }}
        onBuyNow={async (prod, quantity) => {
          if (!isAuthenticated) {
            window.dispatchEvent(new CustomEvent('open-login-modal'));
            return;
          }
          const id = prod._id || prod.productId || prod.id;
          let success = false;
          if (isInCart(id)) {
            success = await updateQuantity(id, quantity);
          } else {
            success = await addToCart(prod, quantity);
          }
          if (success) {
            setQuickViewOpen(false);
            onClose?.();
            navigate('/checkout');
          }
        }}
        onAddToCart={async (prod, quantity) => {
          if (!isAuthenticated) {
            window.dispatchEvent(new CustomEvent('open-login-modal'));
            return;
          }
          const id = prod._id || prod.productId || prod.id;
          const wasIn = isInCart(id);
          if (wasIn) {
            await removeFromCart(id);
          } else {
            const ok = await addToCart(prod, quantity);
            if (ok) {
              // Close Quick View and Search modal, then go to cart
              setQuickViewOpen(false);
              onClose?.();
              navigate('/cart');
            }
          }
        }}
        onWishlistToggle={(prod) => {
          if (!isAuthenticated) {
            window.dispatchEvent(new CustomEvent('open-login-modal'));
            return;
          }
          const id = prod._id || prod.productId || prod.id;
          if (isInWishlist(id)) {
            removeFromWishlist(id);
          } else {
            addToWishlist(prod);
          }
        }}
        inCart={selectedProduct ? isInCart(selectedProduct._id || selectedProduct.productId || selectedProduct.id) : false}
        wishlisted={selectedProduct ? isInWishlist(selectedProduct._id || selectedProduct.productId || selectedProduct.id) : false}
      />
    </>
  );
};

export default SearchModal;