import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './ProductQuickViewDialog.css';
import { resolveImageUrl } from '../utils/imageUrl';

const ProductQuickViewDialog = ({ open, product, onClose, onBuyNow, onAddToCart, onWishlistToggle, inCart, wishlisted }) => {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const imagesRaw = Array.isArray(product?.images) && product.images.length > 0 ? product.images : (product?.image ? [product.image] : []);
  const images = imagesRaw.map((u) => resolveImageUrl(u));
  const [currentImage, setCurrentImage] = useState(0);
  const hoverTimeout = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Auto-rotate images on hover
  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    hoverTimeout.current = setTimeout(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearTimeout(hoverTimeout.current);
  }, [isHovered, currentImage, images.length]);

  // Keyboard controls for zoom overlay
  useEffect(() => {
    if (!zoomOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setZoomOpen(false);
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomOpen, images.length]);

  const goToPrev = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    clearTimeout(hoverTimeout.current);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
    clearTimeout(hoverTimeout.current);
  };

  // Prevent background scroll when dialog is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || !product) return null;

  return createPortal(
    <div className="pqvb-backdrop" onClick={onClose}>
      <div className="pqvb-dialog" onClick={e => e.stopPropagation()}>
        <button className="pqvb-close-btn" onClick={onClose} aria-label="Close quick view">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="pqvb-main">
          {/* Image Section */}
          <div className="pqvb-image-section">
            <div 
              className="pqvb-image-container"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => { setIsHovered(false); clearTimeout(hoverTimeout.current); }}
            >
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImage]}
                    alt={product.name || 'Product'}
                    className="pqvb-main-image"
                    onClick={(e) => { e.stopPropagation(); setZoomOpen(true); }}
                  />
                  <div className="pqvb-image-overlay">
                    <button className="pqvb-zoom-btn" onClick={(e) => { e.stopPropagation(); setZoomOpen(true); }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="pqvb-no-image">No Image Available</div>
              )}
              
              {/* Carousel Controls */}
              {images.length > 1 && (
                <>
                  <button className="pqvb-carousel-btn pqvb-prev-btn" onClick={goToPrev} aria-label="Previous image">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button className="pqvb-carousel-btn pqvb-next-btn" onClick={goToNext} aria-label="Next image">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  
                  {/* Dots Indicator */}
                  <div className="pqvb-dots-indicator">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        className={`pqvb-dot ${idx === currentImage ? 'pqvb-dot-active' : ''}`}
                        onClick={() => setCurrentImage(idx)}
                        aria-label={`View image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="pqvb-details-section">
            <div className="pqvb-header">
              <h1 className="pqvb-title">{product.name}</h1>
              <div className="pqvb-price">₹{product.price?.toLocaleString()}</div>
            </div>

            <p className="pqvb-description">{product.description}</p>

            {!product.inStock && (
              <div className="pqvb-out-of-stock">Out of Stock</div>
            )}

            <div className="pqvb-quantity-section">
              <label className="pqvb-quantity-label">Quantity</label>
              <div className="pqvb-quantity-controls">
                <button 
                  className="pqvb-quantity-btn" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  disabled={quantity <= 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <span className="pqvb-quantity-value">{quantity}</span>
                <button 
                  className="pqvb-quantity-btn" 
                  onClick={() => setQuantity(quantity + 1)} 
                  disabled={quantity >= 10}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="pqvb-action-buttons">
              <button 
                className="pqvb-buy-now-btn" 
                onClick={async () => { await onBuyNow(product, quantity); }} 
                disabled={!product.inStock}
              >
                Buy Now
              </button>
              <button
                className={`pqvb-add-cart-btn ${inCart ? 'pqvb-in-cart' : ''}`}
                onClick={async () => {
                  try {
                    const wasInCart = !!inCart;
                    const res = await Promise.resolve(onAddToCart(product, quantity));
                    if (!wasInCart) {
                      onClose?.();
                      navigate('/cart');
                    }
                    return res;
                  } catch (e) {
                    // stay in place on error
                  }
                }}
                disabled={!product.inStock}
              >
                {inCart ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Added to Cart
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
              <button 
                className={`pqvb-wishlist-btn ${wishlisted ? 'pqvb-wishlisted' : ''}`} 
                onClick={() => onWishlistToggle(product)}
              >
                {wishlisted ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    Wishlisted
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Add to Wishlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Zoom Overlay */}
        {zoomOpen && (
          <div className="pqvb-zoom-overlay" onClick={() => setZoomOpen(false)}>
            <div className="pqvb-zoom-content" onClick={(e) => e.stopPropagation()}>
              <button className="pqvb-zoom-close" onClick={() => setZoomOpen(false)} aria-label="Close enlarged image">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              
              {images.length > 1 && (
                <>
                  <button className="pqvb-zoom-nav pqvb-zoom-prev" onClick={(e) => { e.stopPropagation(); setCurrentImage((prev) => (prev - 1 + images.length) % images.length); }} aria-label="Previous image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button className="pqvb-zoom-nav pqvb-zoom-next" onClick={(e) => { e.stopPropagation(); setCurrentImage((prev) => (prev + 1) % images.length); }} aria-label="Next image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </>
              )}
              
              <img className="pqvb-zoom-image" src={images[currentImage]} alt={product.name || 'Product enlarged'} />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ProductQuickViewDialog;