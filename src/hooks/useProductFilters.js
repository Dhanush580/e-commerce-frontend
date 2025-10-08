import { useState, useMemo } from 'react';

export const useProductFilters = (products) => {
  const DEFAULT_FILTERS = {
    priceRange: [0, 200000],
    sizes: [],
    inStock: false,
    sortBy: 'name',
  };
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1]
    );

    // Filter by sizes (guard against undefined)
    if (Array.isArray(filters.sizes) && filters.sizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sizes || !Array.isArray(product.sizes)) {
          return false;
        }
        return filters.sizes.some(size => product.sizes.includes(size));
      });
    }

    // Filter by stock
    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock !== false);
    }

    // Helper to get a product's creation time (ms)
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

    // Sort products
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return getCreatedTime(b) - getCreatedTime(a);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters]);

  const handleFilterChange = (newFilters) => {
    // Merge with previous filters to avoid dropping keys like sizes
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Ensure required keys have safe defaults if omitted
      sizes: Array.isArray(newFilters?.sizes) ? newFilters.sizes : (Array.isArray(prev.sizes) ? prev.sizes : []),
      priceRange: Array.isArray(newFilters?.priceRange) && newFilters.priceRange.length === 2
        ? newFilters.priceRange
        : (Array.isArray(prev.priceRange) && prev.priceRange.length === 2 ? prev.priceRange : DEFAULT_FILTERS.priceRange),
    }));
  };

  const getFilterStats = () => {
    const totalProducts = products.length;
    const filteredCount = filteredAndSortedProducts.length;
    const hasSizes = Array.isArray(filters.sizes) && filters.sizes.length > 0;
    const pr0 = Array.isArray(filters.priceRange) ? (filters.priceRange[0] ?? DEFAULT_FILTERS.priceRange[0]) : DEFAULT_FILTERS.priceRange[0];
    const pr1 = Array.isArray(filters.priceRange) ? (filters.priceRange[1] ?? DEFAULT_FILTERS.priceRange[1]) : DEFAULT_FILTERS.priceRange[1];
    const activeFiltersCount = 
      (hasSizes ? 1 : 0) +
      (filters.inStock ? 1 : 0) +
      ((pr0 > DEFAULT_FILTERS.priceRange[0] || pr1 < DEFAULT_FILTERS.priceRange[1]) ? 1 : 0);

    return {
      total: totalProducts,
      filtered: filteredCount,
      activeFilters: activeFiltersCount
    };
  };

  return {
    filteredProducts: filteredAndSortedProducts,
    filters,
    handleFilterChange,
    getFilterStats
  };
};