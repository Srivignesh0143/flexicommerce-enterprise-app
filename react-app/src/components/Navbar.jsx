import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import './Navbar.css';

const BRANDING_API = (import.meta.env.VITE_API_URL || '/api') + '/branding';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { cartCount } = useCart();
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [branding, setBranding] = useState({
        appNamePart1: 'Flexi',
        appNamePart2: 'Commerce',
        navbarHomeLabel: 'Home',
        navbarProductsLabel: 'Products',
        navbarOrdersLabel: 'My Orders',
        navbarContactLabel: 'Contact',
        logoUrl: '',
    });

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await fetch(BRANDING_API);
                if (res.ok) {
                    const data = await res.json();
                    setBranding((prev) => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error('Failed to fetch branding in Navbar:', err);
            }
        };
        fetchBranding();
    }, []);

    const navLinks = [
        { path: '/', label: branding.navbarHomeLabel || 'Home' },
        { path: '/products', label: branding.navbarProductsLabel || 'Products' },
        ...(user && !isAdmin ? [{ path: '/my-orders', label: branding.navbarOrdersLabel || 'My Orders' }] : []),
        { path: '/contact', label: branding.navbarContactLabel || 'Contact' },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    // Hide navbar on admin and delivery pages
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery')) return null;

    return (
        <header className="navbar">
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="navbar-logo-circle-container">
                        <img src={branding.logoUrl || logoImg} alt="Brand Logo" className="navbar-logo-circle" />
                    </div>
                    <div>
                        <span className="logo-flexi">{branding.appNamePart1 || 'Flexi'}</span>
                        <span className="logo-commerce">{branding.appNamePart2 || 'Commerce'}</span>
                    </div>
                </Link>

                <nav className={`navbar-nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
                    <ul className="nav-links">
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link
                                    to={link.path}
                                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="nav-actions-mobile">
                        {user ? (
                            <>
                                {!isAdmin && (
                                    <Link to="/my-orders" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                                        <Package size={16} /> My Orders
                                    </Link>
                                )}
                                {isAdmin && (
                                    <Link to="/admin" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                                        <LayoutDashboard size={16} /> Dashboard
                                    </Link>
                                )}
                                <button className="btn btn-secondary" onClick={handleLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                                    Sign In
                                </Link>
                                <Link to="/signup" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                <div className="navbar-actions">
                    <Link to="/cart" className="cart-icon-wrapper" aria-label="Shopping Cart">
                        <ShoppingCart size={22} strokeWidth={2} />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>

                    {user ? (
                        <>
                            {!isAdmin && (
                                <Link to="/my-orders" className="btn btn-secondary btn-nav">
                                    <Package size={16} /> My Orders
                                </Link>
                            )}
                            {isAdmin && (
                                <Link to="/admin" className="btn btn-primary btn-nav">
                                    <LayoutDashboard size={16} /> Dashboard
                                </Link>
                            )}
                            <div className="user-menu">
                                <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
                                <button className="btn btn-secondary btn-nav" onClick={handleLogout}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-nav">
                                <User size={16} /> Sign In
                            </Link>
                            <Link to="/signup" className="btn btn-primary btn-nav">
                                Sign Up
                            </Link>
                        </>
                    )}

                    <button
                        className="menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && <div className="nav-overlay" onClick={() => setMobileMenuOpen(false)} />}
        </header>
    );
};

export default Navbar;
