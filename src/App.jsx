import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CartProvider } from './contexts/CartContext';
import { AdminProvider } from './contexts/AdminContext';
import WhatsAppFloatButton from './components/WhatsAppFloatButton';
import { useAuth } from './contexts/AuthContext';
import React, { useState } from 'react';
import './App.css';


import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SearchResults from './pages/SearchResults';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Earrings from './pages/Earrings';
import Necklaces from './pages/Necklaces';
import Pendants from './pages/Pendants';
import Rings from './pages/Rings';
import TempleJewellery from './pages/TempleJewellery';
import Bangles from './pages/Bangles';
import Sarees from './pages/Sarees';
import Dresses from './pages/Dresses';
import BestSellers from './pages/BestSellers';
import UserOrders from './pages/UserOrders';
import UserPage from './pages/UserPage';
import Shop from './pages/Shop';




function AppRoutes() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  // Provide a global function to open login modal
  window.openLoginModal = () => setShowLoginModal(true);
  window.closeLoginModal = () => setShowLoginModal(false);
  return (
    <>
      <Router>
        <Routes>
          {/* Admin Routes - No Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } 
          />
          {/* Regular Routes - With Navbar */}
          <Route path="/*" element={
            <>
              <Navbar />
              <div className="app">
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:productId" element={<ProductDetails />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/earrings" element={<Earrings />} />
                  <Route path="/necklaces" element={<Necklaces />} />
                  <Route path="/pendants" element={<Pendants />} />
                  <Route path="/rings" element={<Rings />} />
                  <Route path="/temple-jewellery" element={<TempleJewellery />} />
                  <Route path="/bangles" element={<Bangles />} />
                  <Route path="/sarees" element={<Sarees />} />
                  <Route path="/dresses" element={<Dresses />} />
                  <Route path="/best-sellers" element={<BestSellers />} />
                  <Route path="/my-orders" element={<UserOrders />} />
                  <Route path="/user" element={<UserPage openLoginModal={window.openLoginModal} />} />
                </Routes>
              </div>
              <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
              {/* WhatsApp Floating Button - show on all non-admin routes */}
              <WhatsAppFloatButton phoneNumber="919063620258" />
            </>
          } />
        </Routes>
      </Router>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <WishlistProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </WishlistProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
