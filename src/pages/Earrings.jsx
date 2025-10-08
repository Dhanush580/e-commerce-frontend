import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import { useProductFilters } from '../hooks/useProductFilters';
import './CategoryPage.css';
import SubcategoryCircles from '../components/SubcategoryCircles';

const Earrings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    filteredProducts,
    handleFilterChange,
    getFilterStats,
  } = useProductFilters(products);

  useEffect(() => {
    fetchEarrings();
  }, [subCategory]);

  const fetchEarrings = async () => {
    try {
      setLoading(true);
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const url = new URL(`${baseUrl}/products`);
  url.searchParams.set('category', 'earrings');
  if (subCategory) url.searchParams.set('subCategory', subCategory);
  const response = await fetch(url.toString());
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        throw new Error('Failed to fetch earrings');
      }
    } catch (err) {
      console.error('Error fetching earrings:', err);
      setError('Failed to load earrings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-page">
      {/* Page Header */}
      <section className="category-header">
        <div className="container">
          <h1 className="category-title">Earrings Collection</h1>
          <p className="category-description">
            Discover our exquisite collection of earrings, from elegant studs to statement chandeliers. 
            Each piece is crafted with precision and designed to complement your unique style.
          </p>
        </div>
      </section>

      {/* Subcategories Circles below banner */}
      <div className="container">
        <SubcategoryCircles
          value={subCategory}
          onChange={setSubCategory}
          items={[
            { value: '', label: 'All', image: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=300&h=300&fit=crop' },
            { value: 'victorian', label: 'Victorian', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc9e?w=300&h=300&fit=crop' },
            { value: 'cz-stone', label: 'CZ Stone', image: 'https://images.unsplash.com/photo-1609252506608-54d469b236d6?w=300&h=300&fit=crop' },
            { value: 'silver', label: 'Silver', image: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=300&h=300&fit=crop' },
            { value: 'gold-plated', label: 'Gold Plated', image: 'https://images.unsplash.com/photo-1611599538832-43a5f7b9a24a?w=300&h=300&fit=crop' },
          ]}
        />
      </div>

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
              {/* Subcategory chips replaced by circles (above) */}

              {/* Results Header */}
              <div className="results-header">
                <div className="results-info">
                  <h2>
                    Showing {getFilterStats().filtered} of {getFilterStats().total} earrings
                  </h2>
                  {getFilterStats().activeFilters > 0 && (
                    <span className="active-filters">
                      {getFilterStats().activeFilters} filter{getFilterStats().activeFilters !== 1 ? 's' : ''} applied
                    </span>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="loading-message">Loading earrings...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p>No earrings match your current filters. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => (
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
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Earrings;