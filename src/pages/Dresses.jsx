import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import { useProductFilters } from '../hooks/useProductFilters';
import './CategoryPage.css';

const Dresses = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const {
    filteredProducts,
    handleFilterChange,
    getFilterStats,
  } = useProductFilters(products);

  useEffect(() => {
    fetchDresses();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts]);

  const fetchDresses = async () => {
    try {
      setLoading(true);
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/products?category=dresses`);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        throw new Error('Failed to fetch dresses');
      }
    } catch (err) {
      console.error('Error fetching dresses:', err);
      setError('Failed to load dresses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-page">
      {/* Page Header */}
      <section className="category-header">
        <div className="container">
          <h1 className="category-title">Dresses Collection</h1>
          <p className="category-description">
            Explore our stunning collection of dresses, from elegant traditional wear to contemporary 
            styles. Find the perfect dress for every occasion and celebration.
          </p>
        </div>
      </section>

      {/* Products Section with Filters */}
      <section className="category-products">
        <div className="container">
          <div className="products-layout">
            {/* Filter Sidebar */}
            <aside className="filters-sidebar">
              <FilterPanel
                products={products}
                onFilterChange={handleFilterChange}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
              />
            </aside>

            {/* Products Grid */}
            <main className="products-main">
              <div className="results-header">
                <div className="results-info" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',flexWrap:'wrap'}}>
                  <div>
                    <h2 style={{margin:0}}>Showing {getFilterStats().filtered} of {getFilterStats().total} dresses</h2>
                    {getFilterStats().activeFilters > 0 && (
                      <span className="active-filters">
                        {getFilterStats().activeFilters} filter{getFilterStats().activeFilters !== 1 ? 's' : ''} applied
                      </span>
                    )}
                  </div>
                  <button
                    className="filter-toggle-btn"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    aria-label="Open filters"
                  >
                    <span className="filter-icon" aria-hidden>⚙️</span>
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="loading-message">Loading dresses...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p>No dresses match your current filters. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <>
                  <div className="products-grid">
                    {filteredProducts
                      .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                      .map(product => (
                        <ProductCard key={product._id} product={{
                          productId: product.productId,
                          id: product._id,
                          name: product.name,
                          price: product.price,
                          images: product.images || [],
                          image: product.images?.[0] || product.image,
                          inStock: product.inStock,
                          description: product.description,
                        }} />
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

export default Dresses;