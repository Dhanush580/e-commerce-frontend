import { resolveImageUrl } from '../utils/imageUrl';
import React, { useState, useContext, useEffect } from 'react';
import { AdminContext } from '../contexts/AdminContext';
import AddProduct from '../components/AddProduct';
import EditProduct from '../components/EditProduct';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { dashboardData, loadDashboard, loading, isAdmin, statusLoading } = useContext(AdminContext);
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productStats, setProductStats] = useState(null);
  const [productStatsLoading, setProductStatsLoading] = useState(false);
  const [productsPagination, setProductsPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1, hasNext: false, hasPrev: false });
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPagination, setOrdersPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1, hasNext: false, hasPrev: false });

  useEffect(() => {
    if (isAdmin) {
      loadDashboard();
      loadProductStats();
      loadOrders();
      loadProducts();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts(1, productSearch, productCategory);
      loadProductStats();
    }
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadProducts = async (page = 1, search = '', category = 'all') => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/admin/products?${params.toString()}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setProductsPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1, hasNext: false, hasPrev: false });
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
    setProductsLoading(false);
  };

  const loadProductStats = async () => {
    setProductStatsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/admin/products/stats`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProductStats(data);
      }
    } catch (error) {
      console.error('Error loading product stats:', error);
    }
    setProductStatsLoading(false);
  };

  const loadOrders = async (page = 1) => {
    setOrdersLoading(true);
    try {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}/orders?page=${page}&limit=10`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setOrdersPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1, hasNext: false, hasPrev: false });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders(1);
    }
  }, [activeTab]);

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    loadProductStats();
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.productId !== productId));
        loadProductStats();
        alert('Product deleted successfully');
      } else {
        const errorData = await response.json();
        alert('Failed to delete product: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditProduct(true);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(prev => prev.map(p => 
      p.productId === updatedProduct.productId ? updatedProduct : p
    ));
    loadProductStats();
    setShowEditProduct(false);
    setEditingProduct(null);
  };

  const deliveryOptions = ['Order Placed', 'Out for Delivery', 'Delivered'];
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const handleDeliveryStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/orders/${orderId}/delivery-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: newStatus })
      });
      if (res.ok) {
        await loadOrders();
      } else {
        alert('Failed to update delivery status');
      }
    } catch (err) {
      alert('Error updating delivery status');
    }
    setUpdatingOrderId(null);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`adbp-stat-card adbp-stat-${color}`}>
      <div className="adbp-stat-icon">{icon}</div>
      <div className="adbp-stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  const OrdersList = () => (
    <div className="adbp-orders-section">
      <div className="adbp-section-header">
        <h3>All Orders</h3>
      </div>
      {ordersLoading ? (
        <div className="adbp-loading-spinner">
          <div className="adbp-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <>
          <div className="adbp-orders-table">
            <div className="adbp-table-container">
              <table>
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Address</th>
                    <th>Payment</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Delivery Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{order.userEmail}</td>
                      <td>
                        {order.address.name}<br/>
                        {order.address.doorNo ? order.address.doorNo + ', ' : ''}{order.address.addressLine}{order.address.landmark ? ', ' + order.address.landmark : ''}<br/>
                        {order.address.city}, {order.address.state}, {order.address.country} - {order.address.pincode}<br/>
                        {order.address.phone}
                      </td>
                      <td>
                        {order.payment.method === 'card' ? 'Card' : 'COD'}<br/>
                        Status: {order.payment.status}<br/>
                        {order.payment.razorpayPaymentId && <span>ID: {order.payment.razorpayPaymentId}</span>}
                      </td>
                      <td>
                        <ul>
                          {order.items.map((item, idx) => (
                            <li key={idx}>{item.name} x {item.quantity} - ₹{item.price}</li>
                          ))}
                        </ul>
                      </td>
                      <td>₹{order.total}</td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <select
                          value={order.deliveryStatus || 'Order Placed'}
                          onChange={e => handleDeliveryStatusChange(order._id, e.target.value)}
                          disabled={updatingOrderId === order._id}
                          className="adbp-status-select"
                        >
                          {deliveryOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="adbp-pagination">
            <button 
              disabled={!ordersPagination.hasPrev} 
              onClick={() => loadOrders(ordersPagination.page - 1)}
              className="adbp-pagination-btn"
            >
              ← Previous
            </button>
            <span className="adbp-pagination-info">
              Page {ordersPagination.page} of {ordersPagination.pages}
            </span>
            <button 
              disabled={!ordersPagination.hasNext} 
              onClick={() => loadOrders(ordersPagination.page + 1)}
              className="adbp-pagination-btn"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );

  if (statusLoading || loading) {
    return (
      <div className="adbp-admin-dashboard">
        <div className="adbp-loading-spinner">
          <div className="adbp-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="adbp-admin-dashboard">
      <div className="adbp-dashboard-header">
        <div className="adbp-header-content">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, Administrator</p>
        </div>
        <div className="adbp-header-actions">
          <button 
            className="adbp-refresh-btn" 
            onClick={() => {
              loadDashboard();
              loadOrders();
              loadProducts();
              loadProductStats();
            }}
          >
            <span className="adbp-refresh-icon">🔄</span>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="adbp-dashboard-tabs">
        <button 
          className={`adbp-tab ${activeTab === 'overview' ? 'adbp-tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`adbp-tab ${activeTab === 'products' ? 'adbp-tab-active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🛍️ Products
        </button>
        <button 
          className={`adbp-tab ${activeTab === 'orders' ? 'adbp-tab-active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
      </div>

      <div className="adbp-dashboard-content">
        {activeTab === 'overview' && (
          <div className="adbp-overview-tab">
            <div className="adbp-stats-grid">
              <StatCard
                title="Total Orders"
                value={dashboardData?.totalOrders || 0}
                icon="📦"
                color="primary"
              />
              <StatCard
                title="Total Revenue"
                value={`₹${orders.filter(o => o.payment.status === 'paid' || o.payment.status === 'pending').reduce((sum, o) => sum + (o.total || 0), 0)}`}
                icon="💰"
                color="secondary"
              />
              <StatCard
                title="Total Products"
                value={productStats?.totalProducts || dashboardData?.totalProducts || 0}
                icon="🛍️"
                color="accent"
              />
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="adbp-products-tab">
            <div className="adbp-section-header">
              <h3>Product Management</h3>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="adbp-add-product-btn"
              >
                <span className="adbp-add-icon">+</span>
                Add New Product
              </button>
            </div>

            <div className="adbp-search-filter">
              <div className="adbp-search-box">
                <input
                  type="text"
                  placeholder="Search products by name, ID, category..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') loadProducts(1, e.target.value, productCategory); }}
                />
                <span className="adbp-search-icon">🔍</span>
              </div>
              <select
                value={productCategory}
                onChange={e => { setProductCategory(e.target.value); loadProducts(1, productSearch, e.target.value); }}
                className="adbp-category-select"
              >
                <option value="all">All Categories</option>
                <option value="earrings">Earrings</option>
                <option value="necklaces">Necklaces</option>
                <option value="pendants">Pendants</option>
                <option value="rings">Rings</option>
                <option value="temple-jewellery">Temple Jewellery</option>
                <option value="bangles">Bangles</option>
                <option value="sarees">Sarees</option>
                <option value="dresses">Dresses</option>
              </select>
              <button 
                onClick={() => loadProducts(1, productSearch, productCategory)} 
                className="adbp-search-btn"
              >
                Search
              </button>
            </div>

            {productStatsLoading ? (
              <div className="adbp-loading-spinner">
                <div className="adbp-spinner"></div>
                <p>Loading product stats...</p>
              </div>
            ) : productStats && (
              <div className="adbp-product-stats">
                <div className="adbp-stat-item">
                  <span className="adbp-stat-label">Total Products</span>
                  <span className="adbp-stat-value">{productStats.totalProducts}</span>
                </div>
                <div className="adbp-stat-item">
                  <span className="adbp-stat-label">In Stock</span>
                  <span className="adbp-stat-value adbp-stat-success">{productStats.inStockProducts}</span>
                </div>
                <div className="adbp-stat-item">
                  <span className="adbp-stat-label">Out of Stock</span>
                  <span className="adbp-stat-value adbp-stat-danger">{productStats.outOfStockProducts}</span>
                </div>
              </div>
            )}

            {productsLoading ? (
              <div className="adbp-loading-spinner">
                <div className="adbp-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : (
              <>
                <div className="adbp-products-table">
                  <div className="adbp-table-header">
                    <span>Product ID</span>
                    <span>Product Details</span>
                    <span>Category</span>
                    <span>Price</span>
                    <span>Stock Status</span>
                    <span>Actions</span>
                  </div>
                  <div className="adbp-table-body">
                    {products.length === 0 ? (
                      <div className="adbp-no-data">
                        <p>No products found. Add your first product!</p>
                      </div>
                    ) : (
                      products.map((product) => {
                        let imageUrl = '';
                        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                          imageUrl = resolveImageUrl(product.images[0]);
                        } else if (product.image) {
                          imageUrl = product.image;
                        }
                        return (
                          <div key={product._id} className="adbp-table-row">
                            <div className="adbp-product-id">{product.productId}</div>
                            <div className="adbp-product-info">
                              <div className="adbp-product-image">
                                {imageUrl ? (
                                  <img src={imageUrl} alt={product.name} />
                                ) : (
                                  <div className="adbp-no-image">No Image</div>
                                )}
                              </div>
                              <div className="adbp-product-details">
                                <span className="adbp-product-name">{product.name}</span>
                              </div>
                            </div>
                            <div className="adbp-product-category">
                              <span className="adbp-category-badge">{product.category}</span>
                            </div>
                            <div className="adbp-product-price">₹{product.price}</div>
                            <div className="adbp-product-stock">
                              {product.inStock ? (
                                <span className="adbp-stock-badge adbp-in-stock">In Stock</span>
                              ) : (
                                <span className="adbp-stock-badge adbp-out-of-stock">Out of Stock</span>
                              )}
                            </div>
                            <div className="adbp-product-actions">
                              <button 
                                className="adbp-action-btn adbp-edit-btn" 
                                onClick={() => handleEditProduct(product)}
                              >
                                Edit
                              </button>
                              <button 
                                className="adbp-action-btn adbp-delete-btn" 
                                onClick={() => handleDeleteProduct(product.productId)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="adbp-pagination">
                  <button 
                    disabled={!productsPagination.hasPrev} 
                    onClick={() => loadProducts(productsPagination.page - 1, productSearch, productCategory)}
                    className="adbp-pagination-btn"
                  >
                    ← Previous
                  </button>
                  <span className="adbp-pagination-info">
                    Page {productsPagination.page} of {productsPagination.pages}
                  </span>
                  <button 
                    disabled={!productsPagination.hasNext} 
                    onClick={() => loadProducts(productsPagination.page + 1, productSearch, productCategory)}
                    className="adbp-pagination-btn"
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'orders' && <OrdersList />}
      </div>

      {showAddProduct && (
        <AddProduct 
          onClose={() => setShowAddProduct(false)}
          onProductAdded={handleProductAdded}
        />
      )}

      {showEditProduct && editingProduct && (
        <EditProduct 
          product={editingProduct}
          onClose={() => {
            setShowEditProduct(false);
            setEditingProduct(null);
          }}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
};

export default AdminDashboard;