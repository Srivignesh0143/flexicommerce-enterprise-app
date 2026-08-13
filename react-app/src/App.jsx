import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCustomization from './pages/admin/AdminCustomization';
import AdminQueries from './pages/admin/AdminQueries';
import AdminManageDelivery from './pages/admin/AdminManageDelivery';
import DeliveryLayout from './pages/delivery/DeliveryLayout';
import DeliveryOrders from './pages/delivery/DeliveryOrders';
import './App.css';
import logoImg from './assets/logo.png';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="page-loader">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

const DeliveryRoute = ({ children }) => {
  const { user, loading, isDelivery, isAdmin } = useAuth();
  if (loading) return <div className="page-loader">Loading...</div>;
  if (!user || (!isDelivery && !isAdmin)) return <Navigate to="/login" replace />;
  return children;
};

import { useState, useEffect } from 'react';

const BRANDING_API = (import.meta.env.VITE_API_URL || '/api') + '/branding';

function AppContent() {
  const { loading } = useAuth();
  const [loadingBranding, setLoadingBranding] = useState(true);
  const [branding, setBranding] = useState({});
  const [showLoader, setShowLoader] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch(BRANDING_API);
        if (res.ok) {
          const b = await res.json();
          setBranding(b);
          const r = document.documentElement;
          if (b.colorPrimary) {
            r.style.setProperty('--primary-600', b.colorPrimary);
            r.style.setProperty('--primary-700', b.colorPrimary);
          }
          if (b.colorSecondary) {
            r.style.setProperty('--brand-secondary', b.colorSecondary);
          }
          if (b.colorAccent) {
            r.style.setProperty('--brand-accent', b.colorAccent);
          }
          if (b.fontBody) {
            document.body.style.fontFamily = `'${b.fontBody}', sans-serif`;
          }
          if (b.fontSizeBase) {
            document.documentElement.style.fontSize = b.fontSizeBase;
          }
          if (b.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = b.faviconUrl;
          }
        }
      } catch (err) {
        console.error('Failed to fetch global branding:', err);
      } finally {
        setLoadingBranding(false);
      }
    };
    fetchBranding();
  }, []);

  useEffect(() => {
    if (!loading && !loadingBranding) {
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const removeTimer = setTimeout(() => {
          setShowLoader(false);
        }, 500);
        return () => clearTimeout(removeTimer);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, loadingBranding]);

  return (
    <>
      {showLoader && (
        <div className={`page-loader-wrapper ${isFadingOut ? 'fade-out' : ''}`}>
          <div className="loader-ring-container">
            <div className="loader-ring-outer">
              <svg className="loader-svg" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                {/* Background track ring */}
                <circle cx="50" cy="50" r="46" stroke="rgba(226, 232, 240, 0.5)" strokeWidth="3" fill="none" />
                {/* Rotating loader ring */}
                <circle cx="50" cy="50" r="46" stroke="url(#loader-grad)" strokeWidth="4" fill="none"
                  strokeLinecap="round" strokeDasharray="289" strokeDashoffset="75" className="loader-svg-circle" />
              </svg>
              <div className="loader-ring-inner">
                <img src={branding.logoUrl || logoImg} alt="Brand Logo" className="loader-ring-logo" />
              </div>
            </div>
            <div className="loader-text-label">LOADING...</div>
          </div>
        </div>
      )}
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="manage-delivery" element={<AdminManageDelivery />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="queries" element={<AdminQueries />} />
            <Route path="customization" element={<AdminCustomization />} />
          </Route>
          <Route path="/delivery" element={<DeliveryRoute><DeliveryLayout /></DeliveryRoute>}>
            <Route index element={<DeliveryOrders />} />
          </Route>
        </Routes>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
