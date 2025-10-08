import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import './Login.css';

export default function Login() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { login, isAuthenticated } = useAuth();
  const { addToWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = localStorage.getItem('redirectPath') || '/';
      localStorage.removeItem('redirectPath');
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handlePostLoginActions = () => {
    // Handle pending wishlist item
    const pendingWishlistItem = localStorage.getItem('pendingWishlistItem');
    if (pendingWishlistItem) {
      try {
        const product = JSON.parse(pendingWishlistItem);
        addToWishlist(product);
        localStorage.removeItem('pendingWishlistItem');
      } catch (error) {
        console.error('Error adding pending wishlist item:', error);
      }
    }

    // Handle pending cart item
    const pendingCartItem = localStorage.getItem('pendingCartItem');
    if (pendingCartItem) {
      try {
        const product = JSON.parse(pendingCartItem);
        addToCart(product);
        localStorage.removeItem('pendingCartItem');
      } catch (error) {
        console.error('Error adding pending cart item:', error);
      }
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
      // Try to send OTP via backend
      await post('/auth/request-otp', { email }); 
      setStep('otp'); 
      setMessage('OTP sent to your email.'); 
    }
    catch (err) { 
      if (err && err.message && err.message.includes('Valid email')) {
        setMessage('Please enter a valid email address.');
      } else {
        setStep('otp'); 
        setMessage('Demo mode: Use code "123456" to login.'); 
      }
    }
    finally { 
      setLoading(false); 
    }
  };
  const verifyOtp = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setMessage('');
    
    try { 
      // Try backend verification first
      const r = await post('/auth/verify-otp', { email, code }); 
      
      // Use the authentication context to login
      login({ email: r.user.email, ...r.user });
      
      // Handle pending items after login
      handlePostLoginActions();
      
      setMessage(`Welcome, ${r.user.email}`); 
      setStep('done');
      
      // Redirect to previous page or home after a short delay
      setTimeout(() => {
        const redirectPath = localStorage.getItem('redirectPath') || '/';
        localStorage.removeItem('redirectPath');
        navigate(redirectPath, { replace: true });
      }, 1500);
    }
    catch (err) { 
      if (err && err.message && err.message.includes('Email and code')) {
        setMessage('Please enter both email and OTP code.');
      } else if (err && err.message && err.message.includes('Valid email')) {
        setMessage('Please enter a valid email address.');
      } else {
        // Demo mode fallback - accept "123456" as valid OTP
        if (code === '123456') {
          login({ email, name: email.split('@')[0] });
          handlePostLoginActions();
          setMessage(`Welcome, ${email}`); 
          setStep('done');
          setTimeout(() => {
            const redirectPath = localStorage.getItem('redirectPath') || '/';
            localStorage.removeItem('redirectPath');
            navigate(redirectPath, { replace: true });
          }, 1500);
        } else {
          setMessage('Invalid OTP. Use "123456" for demo or check your email.'); 
        }
      }
    }
    finally { 
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

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Login</h2>
        {step === 'email' && (
          <form onSubmit={requestOtp} className="login-form">
            <label>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required />
            <button disabled={loading}>{loading ? (
              <span className="login-spinner"></span> ) : 'Send OTP'}</button>
          </form>
        )}
        {step === 'otp' && (
          <form onSubmit={verifyOtp} className="login-form">
            <label>Enter OTP sent to {email}</label>
            <input type="text" value={code} onChange={(e)=>setCode(e.target.value)} placeholder="6-digit code" required />
            <div className="row">
              <button disabled={loading}>{loading ? (
                <span className="login-spinner"></span> ) : 'Verify'}</button>
              <button type="button" className="secondary" onClick={resend} disabled={loading || resendCooldown > 0}>
                {resendCooldown > 0 ? `Resend (${resendCooldown})` : 'Resend'}
              </button>
            </div>
          </form>
        )}
        {step === 'done' && (
          <div className="login-form"><p className="hint">You are logged in.</p></div>
        )}
        {message && <p className="hint">{message}</p>}
      </div>
    </div>
  );
}
