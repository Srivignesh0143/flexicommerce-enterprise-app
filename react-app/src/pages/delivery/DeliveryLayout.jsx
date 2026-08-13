import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, LogOut, Menu, X, Truck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DeliveryLayout.css';
import logoImg from '../../assets/logo.png';

const DeliveryLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initial = user?.name?.charAt(0)?.toUpperCase() || 'D';

    return (
        <div className="dl-layout">
            {/* Mobile Top Bar */}
            <div className="dl-topbar">
                <button className="dl-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                    <Menu size={22} />
                </button>
                <div className="dl-topbar-brand">
                    <Truck size={20} className="dl-topbar-icon" />
                    <span>Delivery Portal</span>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && <div className="dl-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`dl-sidebar${sidebarOpen ? ' dl-sidebar-open' : ''}`}>
                {/* Header */}
                <div className="dl-sidebar-header">
                    <div className="dl-brand">
                        <img src={logoImg} alt="Logo" className="dl-brand-logo" />
                        <div className="dl-brand-text">
                            <span className="dl-brand-title">Delivery Portal</span>
                            <span className="dl-brand-sub">Partner Dashboard</span>
                        </div>
                    </div>
                    <button className="dl-close-btn" onClick={() => setSidebarOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                {/* User Card */}
                <div className="dl-user-card">
                    <div className="dl-user-avatar">{initial}</div>
                    <div className="dl-user-info">
                        <p className="dl-user-name">{user?.name || 'Delivery Partner'}</p>
                        <p className="dl-user-email">{user?.email}</p>
                        <span className="dl-user-badge">
                            <Truck size={10} /> Delivery Partner
                        </span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="dl-nav">
                    <NavLink
                        to="/delivery"
                        end
                        className={({ isActive }) => `dl-nav-link${isActive ? ' dl-nav-active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Package size={20} />
                        <span>My Orders</span>
                    </NavLink>
                </nav>

                {/* Footer */}
                <div className="dl-sidebar-footer">
                    <button className="dl-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dl-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DeliveryLayout;
