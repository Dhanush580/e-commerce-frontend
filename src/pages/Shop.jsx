
import React, { useEffect, useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import './CategoryPage.css';


const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 200000],
    category: 'all',
    inStock: false,
    sortBy: 'name',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${baseUrl}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data.products || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    // Ensure baseline categories are always present even if not in the first page of results
    const baseline = ['rings','necklaces','earrings','pendants','temple-jewellery','bangles','sarees','dresses'];
    const cats = products.map(p => p.category).filter(Boolean);
    const merged = Array.from(new Set([...baseline, ...cats]));
    return ['all', ...merged];
  }, [products]);

  // Filter logic
  const filteredProducts = useMemo(() => {
    const list = products.filter(p => {
      const inPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
      const inCategory = filters.category === 'all' || p.category === filters.category;
      const inStockOk = filters.inStock ? p.inStock !== false : true;
      return inPrice && inCategory && inStockOk;
    });
    const sortBy = filters.sortBy || 'name';
    const getCreatedTime = (p) => {
      if (p?.createdAt) {
        const t = new Date(p.createdAt).getTime();
        if (!Number.isNaN(t)) return t;
      }
      const id = p?._id || p?.id || '';
      if (typeof id === 'string' && id.length === 24) {
        const tsHex = id.slice(0, 8);
        const seconds = parseInt(tsHex, 16);
        if (!Number.isNaN(seconds)) return seconds * 1000;
      }
      return 0;
    };
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'newest':
          return getCreatedTime(b) - getCreatedTime(a);
        default:
          return 0;
      }
    });
  }, [products, filters]);

  // Reset to page 1 when filters or product list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, products]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Derive price bounds for active filter indicator (to match category pages UX)
  const priceBounds = useMemo(() => {
    const prices = products.map(p => Number(p.price)).filter(n => !Number.isNaN(n));
    if (prices.length === 0) return [0, 200000];
    const min = Math.max(0, Math.floor(Math.min(...prices)));
    const max = Math.min(200000, Math.ceil(Math.max(...prices)));
    return [min, Math.max(min, max)];
  }, [products]);

  const activeFilters = useMemo(() => {
    // Keep logic simple to avoid miscount before user interacts with price sliders
    let count = 0;
    if (filters.inStock) count++;
    if (filters.category && filters.category !== 'all') count++;
    return count;
  }, [filters]);

  return (
    <div className="category-page">
      {/* Header - match category pages */}
      <section className="category-header">
        <div className="container">
          <h1 className="category-title">Shop All Products</h1>
          <p className="category-description">
            Explore our entire collection across all categories. Use filters to quickly find exactly what you love.
          </p>
        </div>
      </section>

      {/* Products + Filters - match category pages layout */}
      <section className="category-products">
        <div className="container">
          <div className="products-layout">
            {/* Filters Sidebar */}
            <aside className="filters-sidebar">
              <FilterPanel
                products={products}
                onFilterChange={f => setFilters(fl => ({
                  ...fl,
                  priceRange: Array.isArray(f.priceRange) ? f.priceRange : fl.priceRange,
                  category: f.category ?? fl.category,
                  inStock: typeof f.inStock === 'boolean' ? f.inStock : fl.inStock,
                  sortBy: f.sortBy || fl.sortBy,
                }))}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(o => !o)}
                categories={categories}
                selectedCategory={filters.category}
              />
            </aside>

            {/* Products Main */}
            <main className="products-main">
              <div className="results-header">
                <div className="results-info" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',flexWrap:'wrap'}}>
                  <div>
                    <h2 style={{margin:0}}>Showing {filteredProducts.length} of {products.length} products</h2>
                    {activeFilters > 0 && (
                      <span className="active-filters">{activeFilters} filter{activeFilters !== 1 ? 's' : ''} applied</span>
                    )}
                  </div>
                  <button
                    className="filter-toggle-btn"
                    onClick={() => setIsFilterOpen(o => !o)}
                    aria-label="Open filters"
                  >
                    <span className="filter-icon" aria-hidden>⚙️</span>
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading-message">Loading products...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p>No products match your current filters. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <>
                  <div className="products-grid">
                    {paginatedProducts.map(product => (
                      <ProductCard key={product._id || product.id} product={product} />
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredProducts.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
