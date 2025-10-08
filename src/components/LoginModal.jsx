import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { FaGem } from 'react-icons/fa';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setCode('');
      setLoading(false);
      setMessage('');
      setResendCooldown(0);
    }
  }, [isOpen]);
  const { login, isAuthenticated } = useAuth();
  const { addToWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      setTimeout(() => {
        onClose();
      }, 800);
    }
  }, [isAuthenticated, isOpen, onClose]);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handlePostLoginActions = () => {
    const pendingWishlistItem = localStorage.getItem('pendingWishlistItem');
    if (pendingWishlistItem) {
      try {
        const product = JSON.parse(pendingWishlistItem);
        addToWishlist(product);
        localStorage.removeItem('pendingWishlistItem');
      } catch (error) {}
    }
    const pendingCartItem = localStorage.getItem('pendingCartItem');
    if (pendingCartItem) {
      try {
        const product = JSON.parse(pendingCartItem);
        addToCart(product);
        localStorage.removeItem('pendingCartItem');
      } catch (error) {}
    }
  };

  const post = async (path, body) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await post('/auth/request-otp', { email });
      setStep('otp');
      setMessage('OTP sent to your email.');
    } catch (err) {
      if (err && err.message && err.message.includes('Valid email')) {
        setMessage('Please enter a valid email address.');
      } else {
        setStep('otp');
        setMessage('Demo mode: Use code "123456" to login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const r = await post('/auth/verify-otp', { email, code });
      login({ email: r.user.email, ...r.user });
      handlePostLoginActions();
      setMessage(`Welcome, ${r.user.email}`);
      setStep('done');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      if (err && err.message && err.message.includes('Email and code')) {
        setMessage('Please enter both email and OTP code.');
      } else if (err && err.message && err.message.includes('Valid email')) {
        setMessage('Please enter a valid email address.');
      } else {
        setMessage('Invalid OTP. Please check your email for the correct code.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resend = async () => {
    setLoading(true); setMessage('');
    try {
      await post('/auth/resend-otp', { email });
      setMessage('OTP resent.');
      setResendCooldown(30);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="ld-modal-overlay" onClick={onClose}></div>
      <div className="ld-modal">
        <button className="ld-modal-close-btn" onClick={onClose} aria-label="Close dialog">
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="ld-modal-banner">
          <FaGem className="ld-modal-logo" />
          <span className="ld-modal-brand">RS Collections</span>
          <p className="ld-modal-tagline">Discover Elegance in Every Piece</p>
        </div>
        <div className="ld-modal-content">
          <div className="ld-login-form">
            {step === 'email' && (
              <div className="ld-login-header">
                <h2 className="ld-login-title">Login</h2>
                <p className="ld-login-subtitle">Enter your details to continue</p>
              </div>
            )}
            <div className="ld-login-form-body">
              {step === 'email' && (
                <form onSubmit={requestOtp} className="ld-login-form-inner">
                  <div className="ld-input-group">
                    <label className="ld-input-label">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="you@example.com" 
                      required 
                      autoFocus 
                      className="ld-input-field"
                    />
                  </div>
                  <button disabled={loading} className="ld-login-btn primary">
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              )}
              {step === 'otp' && (
                <form onSubmit={verifyOtp} className="ld-login-form-inner">
                  <div className="ld-input-group">
                    <label className="ld-input-label">Enter OTP</label>
                    <input 
                      type="text" 
                      value={code} 
                      onChange={e => setCode(e.target.value)} 
                      placeholder="Enter 6-digit code" 
                      required 
                      className="ld-input-field"
                      maxLength="6"
                    />
                    <div className="ld-otp-row">
                      {/* OTP status message (success or error) */}
                      {message && (message.toLowerCase().includes('otp sent') || message.toLowerCase().includes('resent')) && (
                        <span className="ld-otp-status-success">{message}</span>
                      )}
                      {message && message.toLowerCase().includes('invalid otp') && (
                        <span className="ld-otp-status-error">{message}</span>
                      )}
                      {/* Always show resend OTP */}
                      <span 
                        className={`ld-otp-resend-text${(loading || resendCooldown > 0) ? ' disabled' : ''}`}
                        onClick={(!loading && resendCooldown === 0) ? resend : undefined}
                        tabIndex={(loading || resendCooldown > 0) ? -1 : 0}
                        role="button"
                        aria-disabled={loading || resendCooldown > 0}
                      >
                        {loading ? 'Sending...' : (resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP')}
                      </span>
                    </div>
                  </div>
                  <div className="ld-button-group">
                    <button disabled={loading} className="ld-login-btn primary">
                      Verify OTP
                    </button>
                  </div>
                </form>
              )}
              {step === 'done' && (
                <div className="ld-login-success">
                  <div className="ld-success-icon">✓</div>
                  <p className="ld-success-message">Login Successful!</p>
                  <p className="ld-success-subtext">Redirecting...</p>
                </div>
              )}
              {/* Only show message box for non-OTP steps */}
              {message && step !== 'otp' && (
                <div className={`ld-message ${message.includes('Welcome') || message.includes('Successful') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;