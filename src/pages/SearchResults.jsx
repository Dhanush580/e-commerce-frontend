import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaSort } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import { useProductFilters } from '../hooks/useProductFilters';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    
    if (query.trim()) {
      performSearch(query);
    } else {
      setSearchResults([]);
      setNoResults(false);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    try {
      setIsLoading(true);
      setNoResults(false);
      
      // Search across all products
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/products`);
      if (response.ok) {
        const data = await response.json();
        const allProducts = data.products || [];
        
        // Filter products based on search query
        const filteredProducts = allProducts.filter(product => {
          const searchTerm = query.toLowerCase();
          return (
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm) ||
            product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        });
        
        setSearchResults(filteredProducts);
        setNoResults(filteredProducts.length === 0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = (newQuery) => {
    if (newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNewSearch(searchQuery);
    }
  };

  // Use filters hook for search results
  const {
    filteredProducts,
    filters,
    handleFilterChange,
  } = useProductFilters(searchResults);

  const resultCount = filteredProducts.length;

  return (
    <div className="search-results">
      <div className="search-header">
        <div className="container">
          <div className="search-bar">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-btn"
                  onClick={() => {
                    setSearchQuery('');
                    navigate('/search');
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button 
              className="search-button"
              onClick={() => handleNewSearch(searchQuery)}
            >
              Search
            </button>
          </div>

          {searchQuery && (
            <div className="search-info">
              <h1>Search Results for "{searchQuery}"</h1>
              <p className="result-count">
                {isLoading ? 'Searching...' : `${resultCount} product${resultCount !== 1 ? 's' : ''} found`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="search-content">
        <div className="container">
          {searchQuery && searchResults.length > 0 && (
            <div className="search-controls">
              <button 
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                Filters
                {Object.values(filters).some(filter => 
                  Array.isArray(filter) ? filter.length > 0 : filter
                ) && <span className="filter-badge">!</span>}
              </button>
              
              <div className="sort-controls">
                <FaSort />
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                  className="sort-select"
                >
                  <option value="name">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          )}

          <div className={`search-layout ${showFilters ? 'with-filters' : ''}`}>
            {/* Filter Sidebar */}
            {showFilters && searchResults.length > 0 && (
              <div className="filter-sidebar">
                <FilterPanel
                  products={searchResults}
                  onFilterChange={handleFilterChange}
                  isOpen={showFilters}
                  onToggle={() => setShowFilters(!showFilters)}
                />
              </div>
            )}

            {/* Search Results */}
            <div className="results-section">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Searching products...</p>
                </div>
              ) : noResults ? (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>We couldn't find any products matching "{searchQuery}"</p>
                  <div className="suggestions">
                    <h4>Try:</h4>
                    <ul>
                      <li>Check your spelling</li>
                      <li>Use different keywords</li>
                      <li>Search for a broader category</li>
                      <li>Browse our categories instead</li>
                    </ul>
                  </div>
                  <button 
                    className="browse-categories-btn"
                    onClick={() => navigate('/')}
                  >
                    Browse Categories
                  </button>
                </div>
              ) : !searchQuery ? (
                <div className="search-placeholder">
                  <div className="search-placeholder-icon">🔍</div>
                  <h3>Search our collection</h3>
                  <p>Enter a search term to find products, categories, and more</p>
                  <div className="popular-searches">
                    <h4>Popular searches:</h4>
                    <div className="search-tags">
                      {['rings', 'necklaces', 'earrings', 'gold', 'silver', 'sarees'].map(tag => (
                        <button 
                          key={tag}
                          className="search-tag"
                          onClick={() => handleNewSearch(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product._id || product.productId}
                      product={product}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;