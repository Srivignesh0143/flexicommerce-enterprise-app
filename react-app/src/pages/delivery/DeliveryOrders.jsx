import { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, Phone, Calendar, CheckCircle2, Truck, Send, KeyRound, RefreshCw, ChevronDown, ChevronUp, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DeliveryOrders.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const STATUS_TABS = ['all', 'pending', 'shipped', 'out_for_delivery', 'delivered'];

const statusLabel = (s) => ({
    pending: 'Pending', shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
}[s] || s);

const statusClass = (s) => ({
    pending: 'ds-badge-pending', shipped: 'ds-badge-shipped',
    out_for_delivery: 'ds-badge-outdelivery', delivered: 'ds-badge-delivered', cancelled: 'ds-badge-cancelled'
}[s] || '');

const DeliveryOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpOrder, setOtpOrder] = useState(null);
    const [otpValue, setOtpValue] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    const [toasts, setToasts] = useState([]);

    const showToast = (msg, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/delivery/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const setStatus = async (orderId, status) => {
        setActionLoading(prev => ({ ...prev, [`status_${orderId}`]: true }));
        try {
            const res = await fetch(`${API_URL}/delivery/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            showToast(`Status updated to "${statusLabel(status)}"`);
            fetchOrders();
        } catch (err) {
            showToast(err.message || 'Failed to update status', 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, [`status_${orderId}`]: false }));
        }
    };

    const sendOtp = async (orderId) => {
        setOtpLoading(true);
        setOtpError('');
        setOtpSuccessMsg('');
        try {
            const res = await fetch(`${API_URL}/delivery/orders/${orderId}/send-otp`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setOtpSuccessMsg('OTP sent successfully to the customer!');
        } catch (err) {
            setOtpError(err.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const markDelivered = (order) => {
        setOtpOrder(order);
        setOtpValue('');
        setOtpError('');
        setOtpSuccessMsg('');
        setOtpModalOpen(true);
        sendOtp(order._id);
    };

    const verifyOtp = async () => {
        if (!otpValue || otpValue.length !== 6) {
            setOtpError('Enter the 6-digit OTP');
            return;
        }
        setOtpLoading(true);
        setOtpError('');
        try {
            const res = await fetch(`${API_URL}/delivery/orders/${otpOrder._id}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ otp: otpValue })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            showToast('Order marked as Delivered! 🎉');
            setOtpModalOpen(false);
            fetchOrders();
        } catch (err) {
            setOtpError(err.message || 'Failed to verify OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(o => o.status === activeTab);

    const tabCount = (tab) => tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length;

    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    if (loading) {
        return (
            <div className="ds-loading">
                <div className="ds-spinner" />
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="ds-page">
            {/* Toasts */}
            <div className="ds-toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`ds-toast ds-toast-${t.type}`}>
                        {t.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {t.msg}
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="ds-header">
                <div>
                    <h1 className="ds-title">My Deliveries</h1>
                    <p className="ds-subtitle">Manage and track your assigned orders</p>
                </div>
                <button className="ds-refresh-btn" onClick={fetchOrders}>
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="ds-stats">
                <div className="ds-stat-card ds-stat-blue">
                    <Package size={22} />
                    <div>
                        <p className="ds-stat-val">{orders.length}</p>
                        <p className="ds-stat-lbl">Total Assigned</p>
                    </div>
                </div>
                <div className="ds-stat-card ds-stat-amber">
                    <Truck size={22} />
                    <div>
                        <p className="ds-stat-val">{activeOrders}</p>
                        <p className="ds-stat-lbl">Active Orders</p>
                    </div>
                </div>
                <div className="ds-stat-card ds-stat-green">
                    <CheckCircle2 size={22} />
                    <div>
                        <p className="ds-stat-val">{deliveredOrders}</p>
                        <p className="ds-stat-lbl">Delivered</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="ds-tabs">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab}
                        className={`ds-tab${activeTab === tab ? ' ds-tab-active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'all' ? 'All' : statusLabel(tab)}
                        {tabCount(tab) > 0 && (
                            <span className="ds-tab-count">{tabCount(tab)}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="ds-empty">
                    <Package size={48} strokeWidth={1} />
                    <h3>No orders here</h3>
                    <p>{activeTab === 'all' ? 'No orders have been assigned to you yet.' : `No orders with status "${statusLabel(activeTab)}".`}</p>
                </div>
            ) : (
                <div className="ds-orders-list">
                    {filteredOrders.map(order => {
                        const isExpanded = expandedOrder === order._id;
                        const isDelivered = order.status === 'delivered';
                        const isCancelled = order.status === 'cancelled';
                        const canSendOtp = ['out_for_delivery'].includes(order.status);

                        return (
                            <div key={order._id} className={`ds-order-card${isDelivered ? ' ds-order-delivered' : ''}`}>
                                {/* Card Header */}
                                <div className="ds-order-header" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                                    <div className="ds-order-header-left">
                                        <div className="ds-order-id-badge">
                                            {order.orderId || `#${order._id.slice(-6).toUpperCase()}`}
                                        </div>
                                        <div>
                                            <div className="ds-order-customer">
                                                <User size={13} />
                                                {order.userName}
                                            </div>
                                            <div className="ds-order-date">
                                                <Calendar size={12} />
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ds-order-header-right">
                                        <span className={`ds-badge ${statusClass(order.status)}`}>{statusLabel(order.status)}</span>
                                        <span className="ds-order-amount">₹{order.grandTotal?.toLocaleString()}</span>
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="ds-order-body">
                                        {/* Address */}
                                        <div className="ds-info-block">
                                            <div className="ds-info-label"><MapPin size={14} /> Delivery Address</div>
                                            <div className="ds-address">
                                                {order.shippingAddress?.address}, {order.shippingAddress?.city}<br />
                                                {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                                            </div>
                                            <div className="ds-phone">
                                                <Phone size={13} /> {order.shippingAddress?.phone}
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="ds-info-block">
                                            <div className="ds-info-label"><Package size={14} /> Items ({order.items?.length})</div>
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="ds-item-row">
                                                    {item.image && <img src={item.image} alt={item.name} className="ds-item-img" />}
                                                    <div className="ds-item-info">
                                                        <span className="ds-item-name">{item.name}</span>
                                                        <span className="ds-item-meta">
                                                            Qty: {item.quantity}
                                                            {item.size && ` · ${item.size}`}
                                                            {item.color && ` · ${item.color}`}
                                                        </span>
                                                    </div>
                                                    <span className="ds-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        {!isDelivered && !isCancelled && (
                                            <div className="ds-actions">
                                                {order.status !== 'out_for_delivery' && order.status !== 'delivered' && (
                                                    <button
                                                        className="ds-btn ds-btn-primary"
                                                        disabled={actionLoading[`status_${order._id}`]}
                                                        onClick={() => setStatus(order._id, 'out_for_delivery')}
                                                    >
                                                        <Truck size={16} />
                                                        {actionLoading[`status_${order._id}`] ? 'Updating...' : 'Mark Out for Delivery'}
                                                    </button>
                                                )}

                                                {canSendOtp && (
                                                    <button
                                                        className="ds-btn ds-btn-success"
                                                        onClick={() => markDelivered(order)}
                                                    >
                                                        <KeyRound size={16} />
                                                        Verify & Deliver
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {isDelivered && (
                                            <div className="ds-delivered-badge">
                                                <CheckCircle2 size={18} /> Order delivered successfully!
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* OTP Modal */}
            {otpModalOpen && (
                <div className="ds-modal-overlay">
                    <div className="ds-modal">
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Delivery OTP Verification</h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
                            Verify order delivery for customer <strong>{otpOrder?.userName}</strong> (Order: #{otpOrder?.orderId || otpOrder?._id?.slice(-6).toUpperCase()}).
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                                Enter 6-Digit Verification OTP
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter OTP"
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                style={{
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '6px',
                                    fontWeight: 'bold',
                                    padding: '12px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    width: '100%',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {otpError && (
                            <div style={{ color: '#ef4444', fontSize: '0.825rem', marginBottom: '16px', fontWeight: 500 }}>
                                {otpError}
                            </div>
                        )}

                        {otpSuccessMsg && (
                            <div style={{ color: '#10b981', fontSize: '0.825rem', marginBottom: '16px', fontWeight: 500 }}>
                                {otpSuccessMsg}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <button
                                type="button"
                                onClick={() => sendOtp(otpOrder._id)}
                                disabled={otpLoading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#4f46e5',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: 0
                                }}
                            >
                                {otpLoading ? 'Sending...' : 'Resend OTP to Customer'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="ds-btn ds-btn-secondary"
                                onClick={() => setOtpModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="ds-btn ds-btn-success"
                                onClick={verifyOtp}
                                disabled={otpLoading || otpValue.length !== 6}
                            >
                                {otpLoading ? 'Verifying...' : 'Verify & Deliver'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryOrders;
