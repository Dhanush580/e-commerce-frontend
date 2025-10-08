import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingWishlistItem, setPendingWishlistItem] = useState(null);
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

  // Load wishlist from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWishlist();
      handlePendingWishlistItem();
    } else {
      // Clear wishlist when user logs out
      setWishlistItems([]);
    }
  }, [user, isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/wishlist');
      setWishlistItems(data.wishlist || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePendingWishlistItem = () => {
    // Handle pending wishlist item (added before login)
    const pendingItem = localStorage.getItem('pendingWishlistItem');
    if (pendingItem) {
      try {
        const item = JSON.parse(pendingItem);
        addToWishlist(item);
        localStorage.removeItem('pendingWishlistItem');
      } catch (error) {
        console.error('Error adding pending wishlist item:', error);
      }
    }
  };

  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      // Store the product to be added after login
      localStorage.setItem('pendingWishlistItem', JSON.stringify(product));
      setPendingWishlistItem(product);
      return false; // Indicates user needs to login
    }

    try {
      await apiCall('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ product }),
      });

      // Add to local state immediately for better UX
      setWishlistItems(prev => [...prev, product]);
      
      return true;
    } catch (error) {
      if (error.message === 'Item already in wishlist') {
        // Item already exists, this is not really an error
        return true;
      }
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      await apiCall(`/wishlist/${productId}`, {
        method: 'DELETE',
      });

      // Remove from local state immediately for better UX
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      // Delete all items one by one (since we don't have a clear all endpoint)
      await Promise.all(
        wishlistItems.map(item => 
          apiCall(`/wishlist/${item.id}`, { method: 'DELETE' })
        )
      );

      setWishlistItems([]);
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const contextValue = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    pendingWishlistItem
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;