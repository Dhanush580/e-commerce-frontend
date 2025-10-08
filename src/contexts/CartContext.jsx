import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // API helper function
  const apiCall = async (url, options = {}) => {
    const response = await fetch(`${baseUrl}${url}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  };

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCart();
      handlePendingCartItem();
    } else {
      // Clear cart when user logs out
      setCartItems([]);
    }
  }, [user, isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/cart');
      setCartItems(data.cart || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePendingCartItem = () => {
    // Handle pending cart item (added before login)
    const pendingItem = localStorage.getItem('pendingCartItem');
    if (pendingItem) {
      try {
        const item = JSON.parse(pendingItem);
        addToCart(item);
        localStorage.removeItem('pendingCartItem');
      } catch (error) {
        console.error('Error adding pending cart item:', error);
      }
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      // Store the product to be added after login
      localStorage.setItem('pendingCartItem', JSON.stringify(product));
      return false; // Indicates user needs to login
    }

    try {
      await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify({ product, quantity }),
      });

      // Update local state for better UX
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        setCartItems(prev => prev.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        // Add new item
        setCartItems(prev => [...prev, { ...product, quantity }]);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      await apiCall(`/cart/${productId}`, {
        method: 'DELETE',
      });

      // Remove from local state immediately for better UX
      setCartItems(prev => prev.filter(item => item.id !== productId));
      
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) {
      return false;
    }

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    try {
      await apiCall(`/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });

      // Update local state immediately for better UX
      setCartItems(prev => prev.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return false;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      await apiCall('/cart', {
        method: 'DELETE',
      });

      setCartItems([]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  // Return number of unique products in cart
  const getCartCount = () => {
    return cartItems.length;
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const contextValue = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;