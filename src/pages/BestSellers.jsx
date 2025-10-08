import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import './CategoryPage.css';
import './BestSellers.css';

const BestSellers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const res = await fetch(`${baseUrl}/products/best-sellers?limit=50`);
        if (!res.ok) throw new Error('Failed to load best sellers');
        const data = await res.json();
        const list = Array.isArray(data.bestSellers) ? data.bestSellers : [];
        // Build combined objects: { product, metrics }
        // Deduplicate by product _id or productId
        const seen = new Set();
        const unique = [];
        for (const entry of list) {
          const p = entry.product;
          const k = String(p?._id || p?.productId || '');
          if (k && !seen.has(k)) {
            seen.add(k);
            unique.push({ product: p, metrics: entry.metrics });
          }
        }
        setItems(unique);
      } catch (err) {
        setError(err.message || 'Failed to load best sellers');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="category-page">
      {/* Header matching accessories pages */}
      <section className="category-header">
        <div className="container">
          <h1 className="category-title">Best Sellers</h1>
          <p className="category-description">Most ordered products, loved by our customers.</p>
        </div>
      </section>

      {/* Products section without filters sidebar */}
      <section className="category-products">
        <div className="container">
          <main className="products-main">
            <div className="results-header">
              <div className="results-info">
                <h2>Showing {loading ? 0 : items.length} best sellers</h2>
              </div>
            </div>

            {loading ? (
              <div className="loading-message">Loading top products...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : items.length === 0 ? (
              <div className="no-products">
                <p>No best sellers yet.</p>
              </div>
              ) : (
              <div className="products-grid bestsellers-grid">
                {items.map((item) => (
                  <div key={(item.product && (item.product._id || item.product.productId)) || Math.random()} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, background: '#092E20', color: '#C2F1DF', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      {item.metrics?.orderCount || item.metrics?.totalQuantity || 0} orders
                    </div>
                    <ProductCard product={item.product} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};

export default BestSellers;
