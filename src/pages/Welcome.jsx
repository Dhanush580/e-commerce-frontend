import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';
import ProductCard from '../components/ProductCard';

const JewelryLandingPage = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const categoriesRef = useRef(null);
  const [products, setProducts] = useState({
    earrings: [],
    necklaces: [],
    pendants: [],
    rings: [],
    templeJewellery: [],
    bangles: [],
    sarees: []
  });
  const [popularByCategory, setPopularByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState([]);
  const newArrivalsRef = useRef(null);
  const popularRefs = useRef({});

  // Categories scroll functions
  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = 300; // Scroll by 300px
      const currentScroll = categoriesRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      categoriesRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/products`);
      const data = await response.json();
      
      if (data.products) {
        const organizedProducts = {
          earrings: [],
          necklaces: [],
          pendants: [],
          rings: [],
          templeJewellery: [],
          bangles: [],
          sarees: []
        };
        
        data.products.forEach(product => {
          const category = product.category?.toLowerCase();
          if (category && organizedProducts.hasOwnProperty(category)) {
            organizedProducts[category].push(product);
          } else if (category === 'temple jewellery' || category === 'templejewellery') {
            organizedProducts.templeJewellery.push(product);
          }
        });
        
        setProducts(organizedProducts);
      }
      // Fetch latest 15 products for New Arrivals
      try {
        const recentRes = await fetch(`${baseUrl}/products?page=1&limit=15`);
        const recentData = await recentRes.json();
        if (recentData && Array.isArray(recentData.products)) {
          setNewArrivals(recentData.products);
        }
      } catch (e) {
        console.error('Error fetching new arrivals:', e);
      }

      // Fetch weekly popular by category (top 10 by orders in current week)
      try {
        const popRes = await fetch(`${baseUrl}/products/popular-weekly-by-category?limit=10`);
        const popData = await popRes.json();
        if (popData && popData.byCategory) {
          // Normalize keys to lowercase hyphenated to match our mapping
          const normalized = Object.fromEntries(
            Object.entries(popData.byCategory).map(([k, v]) => [
              String(k).toLowerCase().trim().replace(/\s+/g, '-'),
              v,
            ])
          );
          setPopularByCategory(normalized);
        }
      } catch (e) {
        console.error('Error fetching popular by category:', e);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reviews array
  const reviews = [
    { id: 1, name: 'Priya Sharma', review: 'The quality is exceptional and the designs are stunning. My necklace arrived perfectly packaged.' },
    { id: 2, name: 'Anjali Patel', review: 'I love my new earrings! They look even better in person than in the photos. Fast shipping too!' },
    { id: 3, name: 'Rahul Verma', review: 'Bought a ring for my wife\'s birthday. She absolutely loved it! Great customer service.' },
    { id: 4, name: 'Sneha Reddy', review: 'The temple jewellery collection is amazing. Authentic designs with modern comfort.' }
  ];

  const slideImages = [
    'https://5.imimg.com/data5/TG/DN/MY-37294786/designer-artificial-jewellery-500x500.jpg',
    'https://5.imimg.com/data5/TG/DN/MY-37294786/designer-artificial-jewellery-500x500.jpg',
    'https://5.imimg.com/data5/TG/DN/MY-37294786/designer-artificial-jewellery-500x500.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slideImages.length]);

  const nextSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
  };

  const prevSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex - 1 + slideImages.length) % slideImages.length);
  };

  // New Arrivals scroller
  const scrollNewArrivals = (direction) => {
    if (newArrivalsRef.current) {
      const wrapper = newArrivalsRef.current;
      const item = wrapper.querySelector('.product-card');
      const step = item ? item.getBoundingClientRect().width + 16 : 260; // card width + gap
      const target = direction === 'left' ? wrapper.scrollLeft - step : wrapper.scrollLeft + step;
      wrapper.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  // Popular scroller (same behavior as New Arrivals)
  const scrollPopular = (key, direction) => {
    const wrapper = popularRefs.current?.[key];
    if (wrapper) {
      const item = wrapper.querySelector('.product-card');
      const step = item ? item.getBoundingClientRect().width + 16 : 260;
      const target = direction === 'left' ? wrapper.scrollLeft - step : wrapper.scrollLeft + step;
      wrapper.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  // Map API categories to display labels and order
  const popularCategoryOrder = [
    { key: 'sarees', label: 'Sarees' },
    { key: 'necklaces', label: 'Necklaces' },
    { key: 'earrings', label: 'Earrings' },
    { key: 'pendants', label: 'Pendants' },
    { key: 'rings', label: 'Rings' },
    { key: 'temple-jewellery', label: 'Temple Jewellery' },
    { key: 'bangles', label: 'Bangles' },
    { key: 'dresses', label: 'Dresses' },
  ];
  // Include any extra categories returned by API that aren't in the predefined order
  const extraCategories = Object.keys(popularByCategory || {})
    .filter((k) => !popularCategoryOrder.find((o) => o.key === k))
    .map((k) => ({ key: k, label: k.charAt(0).toUpperCase() + k.slice(1) }));
  const categoriesToRender = [...popularCategoryOrder, ...extraCategories];

  return (
    <div className="wp-jewelry-landing">
      {/* Announcement Bar (between navbar and first banner) */}
      <section className="wp-announcement">
        <div className="wp-announcement-viewport" aria-label="Store announcement">
          <div className="wp-announcement-track">
            <div className="wp-announcement-seq">
              <span className="wp-announcement-text">welcom to RS collections! enjoy free shipping, and special deals</span>
              <span className="wp-announcement-sep">•</span>
            </div>
            <span className="wp-announcement-gap" aria-hidden="true"></span>
            <div className="wp-announcement-seq" aria-hidden="true">
              <span className="wp-announcement-text">welcom to RS collections! enjoy free shipping, and special deals</span>
              <span className="wp-announcement-sep">•</span>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Banner */}
      <section className="wp-welcome-banner">
        <div className="wp-banner-container">
          {/* Text Content */}
          <div className="wp-banner-content">
            <h1>RS Collection Jewellery</h1>
            <p>Discover luxury jewellery crafted to perfection, designed for your special moments.</p>
            <div className="wp-banner-cta">
              <Link to="/shop" className="wp-cta-button">Shop Now</Link>
            </div>
          </div>
          
          {/* Three Polygon Shapes - ALWAYS 2x2 Grid Structure */}
          <div className="wp-banner-images">
            <div className="wp-image-shape wp-polygon-shape wp-shape-1">
              <img src="https://www.karagiri.com/cdn/shop/files/HDLM-385-PINK-1.jpg?v=1701165334" alt="Elegant Jewelry Collection" />
            </div>
            <div className="wp-image-shape wp-polygon-shape wp-shape-2">
              <img src="https://images.meesho.com/images/products/398839106/2lrfd_512.webp?width=512" alt="Gold Jewelry Collection" />
            </div>
            <div className="wp-image-shape wp-polygon-shape wp-shape-3">
              <img src="https://www.eradesign.ca/cdn/shop/products/ERADESIGN-ROSE-RG-RING-5_3024x3024.jpg?v=1609980257" alt="Diamond Jewelry Collection" />
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="wp-categories-section" id="categories">
        <div className="wp-container">
          <h2 className="wp-section-title">Top Categories</h2>
          <div className="wp-categories-container">
            <button 
              className="wp-categories-nav wp-categories-nav-left"
              onClick={() => scrollCategories('left')}
              aria-label="Scroll categories left"
            >
              &#8249;
            </button>
            <div className="wp-categories-wrapper" ref={categoriesRef}>
              <div className="wp-categories-grid">
                <Link to="/earrings" className="wp-category-card" aria-label="Browse Earrings">
                  <img src="https://www.theshoppingtree.in/cdn/shop/products/IMG_20230420_170930.jpg?v=1682058120" alt="Earrings" />
                  <h3>Earrings</h3>
                </Link>
                <Link to="/necklaces" className="wp-category-card" aria-label="Browse Necklaces">
                  <img src="https://m.media-amazon.com/images/I/61xUQIASFkL.UY1100.jpg" alt="Necklaces" />
                  <h3>Necklace</h3>
                </Link>
                <Link to="/pendants" className="wp-category-card" aria-label="Browse Pendants">
                  <img src="https://www.chidambaramgoldcovering.com/image/cache/catalog/ChidambaramGoldCovering/pendants/smdr2402-new-oval-diamond-black-stone-small-pendant-chain-shop-online-1-850x1000.jpg" alt="Pendants" />
                  <h3>Pendant</h3>
                </Link>
                <Link to="/rings" className="wp-category-card" aria-label="Browse Rings">
                  <img src="https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dwd2f041fe/images/hi-res/51M5B1FGYAA00_1.jpg?sw=480&sh=480" alt="Rings" />
                  <h3>Ring</h3>
                </Link>
                <Link to="/temple-jewellery" className="wp-category-card" aria-label="Browse Temple Jewellery">
                  <img src="https://images.jdmagicbox.com/quickquotes/images_main/traditional-temple-jewellery-with-neck-piece-and-earrings-2222963667-uzpiinpc.jpg" alt="Temple Jewellery" />
                  <h3>Temple Jewellery</h3>
                </Link>
                <Link to="/bangles" className="wp-category-card" aria-label="Browse Bangles">
                  <img src="https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/16547274/2025/3/27/4175d68d-0eb8-48ad-8910-090d83ad8ca51743082097710-Rubans-Set-of-2-18K-Gold-Plated-Ruby-Red-Studded-Geru-Polish-1.jpg" alt="Bangles" />
                  <h3>Bangle</h3>
                </Link>
                <Link to="/sarees" className="wp-category-card" aria-label="Browse Sarees">
                  <img src="https://www.karagiri.com/cdn/shop/files/HDLM-385-PINK-1.jpg?v=1701165334" alt="Sarees" />
                  <h3>Sarees</h3>
                </Link>
                <Link to="/dresses" className="wp-category-card" aria-label="Browse Dresses">
                  <img src="https://m.media-amazon.com/images/I/71xPqdCEcrL.UY1100.jpg" alt="Dresses" />
                  <h3>Dresses</h3>
                </Link>
              </div>
            </div>
            <button 
              className="wp-categories-nav wp-categories-nav-right"
              onClick={() => scrollCategories('right')}
              aria-label="Scroll categories right"
            >
              &#8250;
            </button>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="wp-new-arrivals-section">
        <div className="wp-container">
          <h2 className="wp-section-title" style={{ marginBottom: 12 }}>New Arrivals</h2>
          {loading ? (
            <div className="wp-loading-message">
              <div className="wp-spinner"></div>
              Loading new arrivals...
            </div>
          ) : (
            <div className="wp-na-scroller">
              <button className="wp-na-nav-btn left" onClick={() => scrollNewArrivals('left')} aria-label="Scroll new arrivals left">&#8249;</button>
              <div className="wp-new-arrivals-wrapper" ref={newArrivalsRef}>
                <div className="wp-new-arrivals-row">
                  {newArrivals.map(p => (
                    <div key={p.productId || p._id} className="wp-na-card">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
              <button className="wp-na-nav-btn right" onClick={() => scrollNewArrivals('right')} aria-label="Scroll new arrivals right">&#8250;</button>
            </div>
          )}
        </div>
      </section>

      {/* Popular This Week - top 10 per category by orders */}
      <section className="wp-popular-section">
        <div className="wp-container">
          <h2 className="wp-section-title">Popular This Week</h2>
          {loading ? (
            <div className="wp-loading-message">
              <div className="wp-spinner"></div>
              Loading products...
            </div>
          ) : (
            <>
              {categoriesToRender.map(({ key, label }) => {
                const items = Array.isArray(popularByCategory[key]) ? popularByCategory[key] : [];
                if (!items.length) return null;
                // Each category gets its own scroller
                return (
                  <div key={key} className="wp-category-products">
                    <h3 className="wp-category-title">{label}</h3>
                    <div className="wp-na-scroller">
                      <button className="wp-na-nav-btn left" onClick={() => scrollPopular(key, 'left')} aria-label={`Scroll ${label} left`}>&#8249;</button>
                      <div
                        className="wp-new-arrivals-wrapper"
                        ref={(el) => {
                          if (el) {
                            popularRefs.current[key] = el;
                          }
                        }}
                      >
                        <div className="wp-new-arrivals-row">
                          {items.map((entry) => {
                            const p = entry.product || entry; // fallback if structure differs
                            return (
                              <div key={p.productId || p._id} className="wp-na-card">
                                <ProductCard product={p} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <button className="wp-na-nav-btn right" onClick={() => scrollPopular(key, 'right')} aria-label={`Scroll ${label} right`}>&#8250;</button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>

      {/* Customer Reviews - Marquee Style */}
      <section className="wp-reviews-section">
        <div className="wp-container">
          <h2 className="wp-section-title">Customer Reviews</h2>
          <div className="wp-reviews-marquee-container">
            <div className="wp-reviews-marquee-blocks">
              {[...reviews, ...reviews].map((review, idx) => (
                <div key={idx} className="wp-review-marquee-block">
                  <p>"{review.review}"</p>
                  <h4>- {review.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="wp-why-choose-us">
        <div className="wp-container">
          <h2 className="wp-section-title">Why Choose Us</h2>
          <div className="wp-features-grid">
            <div className="wp-feature-card">
              <div className="wp-feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>Free shipping in 7 working days</p>
            </div>
            <div className="wp-feature-card">
              <div className="wp-feature-icon">🔄</div>
              <h3>Return & Exchange</h3>
              <p>Return & exchange in 7 working days</p>
            </div>
            <div className="wp-feature-card">
              <div className="wp-feature-icon">💬</div>
              <h3>24/7 Support</h3>
              <p>We support 24*7 amazing services</p>
            </div>
            <div className="wp-feature-card">
              <div className="wp-feature-icon">💰</div>
              <h3>Save Money</h3>
              <p>Save money with instant discount</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="wp-footer">
        <div className="wp-container">
          <p>&copy; 2023 RS collection jewellery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default JewelryLandingPage;
