import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, ArrowLeft, Tag, Paintbrush, MessageSquare, Bell, Menu, X, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

import logoImg from '../../assets/logo.png';

const BRANDING_API = (import.meta.env.VITE_API_URL || '/api') + '/branding';

const AdminLayout = () => {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();

    const [branding, setBranding] = useState({ appNamePart1: 'Flexi', appNamePart2: 'Commerce' });
    const [unreadCount, setUnreadCount] = useState(0);
    const [queriesList, setQueriesList] = useState([]);
    const [toast, setToast] = useState({ show: false, title: '', message: '' });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await fetch(API_URL + '/branding');
                if (res.ok) {
                    const data = await res.json();
                    setBranding((prev) => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error('Failed to fetch branding in AdminLayout:', err);
            }
        };
        fetchBranding();
    }, []);

    const fetchQueries = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/contact`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const unread = data.filter(q => q.status === 'new');
                setUnreadCount(unread.length);

                setQueriesList(prev => {
                    // Check for newly arrived queries to trigger desktop notifications
                    if (prev.length > 0 && data.length > prev.length) {
                        const added = data.filter(q => !prev.some(p => p._id === q._id));
                        if (added.length > 0) {
                            const latest = added[0];
                            setToast({
                                show: true,
                                title: 'New Customer Query!',
                                message: `From ${latest.name}: "${latest.subject}"`
                            });
                            setTimeout(() => setToast({ show: false, title: '', message: '' }), 6000);
                        }
                    }
                    return data;
                });
            }
        } catch (err) {
            console.error('Failed to fetch queries in AdminLayout:', err);
        }
    };

    useEffect(() => {
        fetchQueries();
        const interval = setInterval(fetchQueries, 10000);
        return () => clearInterval(interval);
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const sidebarLinks = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { path: '/admin/categories', label: 'Categories', icon: Tag },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/admin/manage-delivery', label: 'Manage Delivery', icon: Truck },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/queries', label: 'Customer Queries', icon: MessageSquare },
        { path: '/admin/customization', label: 'Customization', icon: Paintbrush },
    ];

    return (
        <div className="admin-layout">
            {/* Mobile Top Bar */}
            <div className="admin-mobile-topbar">
                <button className="admin-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                    <Menu size={22} />
                </button>
                <div className="admin-mobile-brand">
                    <span className="logo-flexi">{branding.appNamePart1 || 'Flexi'}</span>
                    <span className="logo-commerce">{branding.appNamePart2 || 'Commerce'}</span>
                </div>
                {unreadCount > 0 && (
                    <span className="admin-mobile-badge">{unreadCount}</span>
                )}
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`admin-sidebar${sidebarOpen ? ' sidebar-mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="admin-brand-container">
                        <div className="navbar-logo-circle-container">
                            <img src={branding.logoUrl || logoImg} alt="Brand Logo" className="navbar-logo-circle" />
                        </div>
                        <div className="admin-brand-text">
                            <span className="logo-flexi">{branding.appNamePart1 || 'Flexi'}</span>
                            <span className="logo-commerce">{branding.appNamePart2 || 'Commerce'}</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {sidebarLinks.map((link) => {
                        const IconComp = link.icon;
                        const isQueriesLink = link.path === '/admin/queries';
                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.end}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <IconComp size={20} />
                                <span>{link.label}</span>
                                {isQueriesLink && unreadCount > 0 && (
                                    <span className="sidebar-badge">{unreadCount}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-link" onClick={() => { navigate('/'); setSidebarOpen(false); }}>
                        <ArrowLeft size={20} />
                        <span>Back to Store</span>
                    </button>
                    <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">{user?.name?.charAt(0) || 'A'}</div>
                        <div>
                            <p className="sidebar-user-name">{user?.name || 'Admin'}</p>
                            <p className="sidebar-user-email">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>

            {/* Notification Toast */}
            {toast.show && (
                <div 
                    className="admin-notification-toast" 
                    onClick={() => {
                        navigate('/admin/queries');
                        setToast({ show: false, title: '', message: '' });
                    }}
                >
                    <div className="toast-icon-wrapper">
                        <Bell size={18} />
                    </div>
                    <div className="toast-body">
                        <h4>{toast.title}</h4>
                        <p>{toast.message}</p>
                    </div>
                    <button 
                        className="toast-close-btn" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setToast({ show: false, title: '', message: '' });
                        }}
                    >
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
