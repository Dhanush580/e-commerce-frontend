import React, { useState, useEffect } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ 
  products, 
  onFilterChange, 
  categories = [],
  selectedCategory = 'all',
  isOpen,
  onToggle 
}) => {
  // Handle category change
  const handleCategoryChange = (cat) => {
    onFilterChange({ ...filters, category: cat });
  };
  const DEFAULT_PRICE_RANGE = [0, 200000];
  const [filters, setFilters] = useState({
    priceRange: [...DEFAULT_PRICE_RANGE],
    inStock: false,
    sortBy: 'name'
  });

  const [priceRange, setPriceRange] = useState([...DEFAULT_PRICE_RANGE]);
  // Remove size filter

  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map(p => Number(p.price)).filter(p => !isNaN(p));
      if (prices.length > 0) {
        const minPrice = Math.max(0, Math.floor(Math.min(...prices)));
        const maxPrice = Math.min(200000, Math.ceil(Math.max(...prices)));
        const nextRange = [minPrice, Math.max(minPrice, maxPrice)];
        setPriceRange(nextRange);
        setFilters(prev => ({
          ...prev,
          priceRange: nextRange,
        }));
        return;
      }
    }
    // Fallback to defaults when no products
    setPriceRange([...DEFAULT_PRICE_RANGE]);
    setFilters(prev => ({
      ...prev,
      priceRange: [...DEFAULT_PRICE_RANGE],
    }));
  }, [products]);

  const handlePriceChange = (index, value) => {
    const next = Array.isArray(filters.priceRange) ? [...filters.priceRange] : [...priceRange];
    const parsed = Number(value);
    const minAllowed = priceRange[0];
    const maxAllowed = priceRange[1];
    if (Number.isNaN(parsed)) {
      next[index] = index === 0 ? minAllowed : maxAllowed;
    } else {
      next[index] = Math.min(Math.max(parsed, minAllowed), maxAllowed);
    }
    // Keep order valid
    if (index === 0 && next[0] > next[1]) {
      next[1] = next[0];
    } else if (index === 1 && next[1] < next[0]) {
      next[0] = next[1];
    }
    const newFilters = { ...filters, priceRange: next };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };



  const handleStockChange = (value) => {
    const newFilters = { ...filters, inStock: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value) => {
    const newFilters = { ...filters, sortBy: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    // Reset to dynamic full range derived from products and default options
    const resetFilters = {
      priceRange: [...priceRange],
      inStock: false,
      sortBy: 'name',
      category: 'all',
    };
    // Keep local state in sync for controlled inputs (except category, which is controlled by parent)
    setFilters(prev => ({
      ...prev,
      priceRange: [...priceRange],
      inStock: false,
      sortBy: 'name',
    }));
    onFilterChange(resetFilters);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="filter-mobile-header">
        <button 
          className="filter-toggle-btn"
          onClick={onToggle}
        >
          <span className="filter-icon">⚙️</span>
          Filters
          {filters.inStock && (
            <span className="filter-count">1</span>
          )}
        </button>
      </div>


      {/* Filter Panel */}
      <div className={`filter-panel ${isOpen ? 'open' : ''}`} style={{background: 'rgba(255,255,255,0.10)', boxShadow: 'none', backdropFilter: 'blur(2px)'}}>
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All
          </button>
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <div className="shop-category-filter" style={{marginBottom: 18}}>
            <h4 className="shop-filter-title">Category</h4>
            <div className="shop-category-list">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`shop-category-btn${selectedCategory === cat ? ' active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort By */}
        <div className="filter-section">
          <h4>Sort By</h4>
          <select 
            value={filters.sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="filter-section">
          <h4>Price Range</h4>
          <div className="price-range-container">
            <div className="price-inputs">
              <div className="price-input-group">
                <label>Min</label>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  className="price-input"
                />
              </div>
              <div className="price-input-group">
                <label>Max</label>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  className="price-input"
                />
              </div>
            </div>
            
            <div className="price-sliders">
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="price-slider min-slider"
              />
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="price-slider max-slider"
              />
            </div>
            
            <div className="price-display">
              {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
            </div>
          </div>
        </div>



        {/* Availability */}
        <div className="filter-section">
          <h4>Availability</h4>
          <div className="availability-options">
            <label className="availability-option">
              <input
                type="radio"
                name="availability"
                checked={!filters.inStock}
                onChange={() => handleStockChange(false)}
              />
              <span>All Products</span>
            </label>
            <label className="availability-option">
              <input
                type="radio"
                name="availability"
                checked={filters.inStock}
                onChange={() => handleStockChange(true)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Mobile Close Button */}
        <div className="filter-mobile-footer">
          <button className="apply-filters-btn" onClick={onToggle}>
            Apply Filters
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && <div className="filter-overlay" onClick={onToggle}></div>}
    </>
  );
};

export default FilterPanel;