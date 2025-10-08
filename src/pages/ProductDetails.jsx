import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import './ProductDetails.css';
import { resolveImageUrl } from '../utils/imageUrl';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart, isInCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/products/${productId}`);
      const data = await response.json();
      
      if (data.product) {
        setProduct(data.product);
        if (data.product.sizes && data.product.sizes.length > 0) {
          setSelectedSize(data.product.sizes[0]);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/products?category=${product.category}`);
      const data = await response.json();
      
      if (data.products) {
        const related = data.products
          .filter(p => p.productId !== productId)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }

    const productIdentifier = product.productId || product.id || product._id;
    const cartItem = {
      ...product,
      id: productIdentifier,
      image: product.image || product.images?.[0] || '',
      selectedSize,
      quantity
    };

    addToCart(cartItem);
    alert('Product added to cart!');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }

    const productIdentifier = product.productId || product.id || product._id;
    // Check if same product with same size is already in cart
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const existing = cartItems.find(item => item.id === productIdentifier && item.selectedSize === selectedSize);
    const cartItem = {
      ...product,
      id: productIdentifier,
      image: product.image || product.images?.[0] || '',
      selectedSize,
      quantity
    };

    // Use addToCart from context, which will update quantity if already present
    addToCart(cartItem, quantity);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const productIdentifier = product.productId || product.id || product._id;
    const wishlisted = isInWishlist(productIdentifier);
    if (wishlisted) {
      removeFromWishlist(productIdentifier);
    } else {
      const wishlistProduct = {
        ...product, 
        id: productIdentifier,
        image: product.image || product.images?.[0] || ''
      };
      addToWishlist(wishlistProduct);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getImageUrl = (product) => resolveImageUrl(product);

  if (loading) {
    return (
      <div className="pde-container">
        <div className="pde-loading">
          <div className="pde-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pde-container">
        <div className="pde-error">
          <h2>Product Not Found</h2>
          <p>{error || 'The product you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="pde-back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.productId || product.id || product._id);

  // Cart logic
  const productIdentifier = product.productId || product.id || product._id;
  const inCart = isInCart(productIdentifier);

  const handleCartButton = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (inCart) {
      removeFromCart(productIdentifier);
    } else {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        alert('Please select a size');
        return;
      }
      const cartItem = {
        ...product,
        id: productIdentifier,
        image: product.image || product.images?.[0] || '',
        selectedSize,
        quantity
      };
      addToCart(cartItem);
    }
  };

  return (
    <div className="pde-container">
      <div className="pde-main">
        <div className="pde-image-section">
          <div className="pde-main-image">
            <img src={getImageUrl(product)} alt={product.name} />
          </div>
        </div>
        <div className="pde-details-section">
          <h1 className="pde-product-title">{product.name}</h1>
          <div className="pde-description">
            <p>{product.description}</p>
          </div>
          {product.sizes && product.sizes.length > 0 && (
            <div className="pde-size-section">
              <h3>Size</h3>
              <div className="pde-size-options">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`pde-size-btn ${selectedSize === size ? 'pde-size-selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="pde-quantity-section">
            <h3>Quantity</h3>
            <div className="pde-quantity-controls">
              <button 
                className="pde-qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="pde-qty-value">{quantity}</span>
              <button 
                className="pde-qty-btn"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
          </div>
          <div className="pde-action-buttons">
            <button 
              className="pde-buy-now-btn"
              onClick={handleBuyNow}
              disabled={!product.inStock}
            >
              Buy Now
            </button>
            <button 
              className="pde-add-cart-btn"
              onClick={handleCartButton}
              disabled={!product.inStock}
            >
              {inCart ? 'Remove from Cart' : 'Add to Cart'}
            </button>
            <button 
              className={`pde-wishlist-btn ${wishlisted ? 'pde-wishlisted' : ''}`}
              onClick={handleWishlistToggle}
            >
              {wishlisted ? '❤️ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;