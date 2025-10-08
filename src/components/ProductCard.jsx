import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaShoppingBag, FaEye, FaRegHeart, FaStar } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import './ProductCard.css';
import { resolveImageUrl } from '../utils/imageUrl';
import WarningDialog from './WarningDialog';
import ProductQuickViewDialog from './ProductQuickViewDialog';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Carousel state for multiple images
  const imagesRaw = Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const images = imagesRaw.map((u) => resolveImageUrl(u));
  const [currentImage, setCurrentImage] = useState(0);
  const intervalRef = useRef(null);

  // Only advance image after 5s hover
  const hoverTimeout = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    hoverTimeout.current = setTimeout(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearTimeout(hoverTimeout.current);
  }, [isHovered, currentImage, images.length]);

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



  const { addToCart, removeFromCart, isInCart, updateQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Quick View dialog state
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Always pass a normalized product object with a unique id
  const getNormalizedProduct = () => {
    const id = product._id || product.productId || product.id;
    return {
      ...product,
      id,
      image: product.image || (Array.isArray(product.images) && product.images[0]) || '',
    };
  };

  const navigate = useNavigate();


  const normalized = getNormalizedProduct();
  const inWishlist = isInWishlist(normalized.id);
  const inCart = isInCart(normalized.id);


  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setDialogMessage('Please login to add items to your wishlist.');
      setDialogOpen(true);
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    if (inWishlist) {
      removeFromWishlist(normalized.id);
    } else {
      addToWishlist(normalized);
    }
  };


  const handleCartClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setDialogMessage('Please login to add items to your cart.');
      setDialogOpen(true);
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    if (inCart) {
      removeFromCart(normalized.id);
    } else {
      addToCart(normalized);
    }
  };


  return (
    <>
      <div className="product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); clearTimeout(hoverTimeout.current); }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="product-image" style={{ position: 'relative' }}>
          {images.length > 0 && (
            <img
              src={images[currentImage]}
              alt={product.name || 'Product'}
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          )}
          {/* Carousel controls */}
          {images.length > 1 && (
            <>
              <button
                className="carousel-control left"
                aria-label="Previous image"
                onClick={goToPrev}
                style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 2 }}
              >&lt;</button>
              <button
                className="carousel-control right"
                aria-label="Next image"
                onClick={goToNext}
                style={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 2 }}
              >&gt;</button>
              {/* Dots */}
              <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                {images.map((_, idx) => (
                  <span key={idx} style={{ width: 8, height: 8, borderRadius: '50%', background: idx === currentImage ? '#fff' : 'rgba(255,255,255,0.5)', display: 'inline-block' }} />
                ))}
              </div>
            </>
          )}
          {/* Sale Badge */}
          {product.onSale && (
            <div className="sale-badge">Sale</div>
          )}
          <div className="icon-container">
            <button
              className={`icon-btn heart${inWishlist ? ' added' : ''}`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleWishlistClick}
            >
              {inWishlist ? <FaHeart className="icon-svg" /> : <FaRegHeart className="icon-svg" />}
              <span className="icon-label">
                {inWishlist ? 'Added to wishlist' : 'Add to wishlist'}
              </span>
            </button>
            <button
              className={`icon-btn bag${inCart ? ' added' : ''}`}
              aria-label={inCart ? 'Remove from cart' : 'Add to cart'}
              onClick={handleCartClick}
            >
              <FaShoppingBag className="icon-svg" />
              <span className="icon-label">
                {inCart ? 'Added to cart' : 'Add to Cart'}
              </span>
            </button>
            <button className="icon-btn eye" aria-label="Quick view" onClick={(e) => { e.stopPropagation(); setQuickViewOpen(true); }}>
              <FaEye className="icon-svg" />
              <span className="icon-label">Quick View</span>
            </button>
          </div>
        </div>

        <div className="product-details">
          <h3 className="product-title">{product.name || 'Product Name'}</h3>
          {/* Rating */}
          {product.rating && (
            <div className="product-rating">
              <FaStar className="star-icon" />
              <span>{product.rating}</span>
            </div>
          )}
          <div className="price-container">
            <span className="price">₹{product.price != null ? product.price : '--'}</span>
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice}</span>
            )}
          </div>
        </div>
      </div>
      <WarningDialog open={dialogOpen} message={dialogMessage} onClose={() => setDialogOpen(false)} />
      <ProductQuickViewDialog
        open={quickViewOpen}
        product={getNormalizedProduct()}
        onClose={() => setQuickViewOpen(false)}
        onBuyNow={async (prod, quantity) => {
          if (!isAuthenticated) {
            setDialogMessage('Please login to buy now.');
            setDialogOpen(true);
            window.dispatchEvent(new CustomEvent('open-login-modal'));
            return;
          }
          const id = prod._id || prod.productId || prod.id;
          let success = false;
          if (isInCart(id)) {
            // Set the quantity directly
            success = await updateQuantity(id, quantity);
          } else {
            success = await addToCart(prod, quantity);
          }
          if (success) {
            navigate('/checkout');
          } else {
            setDialogMessage('Failed to add to cart. Please try again.');
            setDialogOpen(true);
          }
        }}
        onAddToCart={(prod, quantity) => {
          if (!isAuthenticated) {
            setDialogMessage('Please login to add items to your cart.');
            setDialogOpen(true);
            window.dispatchEvent(new CustomEvent('open-login-modal'));
            return;
          }
          const id = prod._id || prod.productId || prod.id;
          if (isInCart(id)) {
            removeFromCart(id);
          } else {
            addToCart(prod, quantity);
          }
        }}
        onWishlistToggle={(prod) => {
          if (!isAuthenticated) {
            setDialogMessage('Please login to add items to your wishlist.');
            setDialogOpen(true);
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
        inCart={inCart}
        wishlisted={inWishlist}
      />
    </>
  );
};

export default ProductCard;