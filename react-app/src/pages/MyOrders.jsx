import { useEffect, useMemo, useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MyOrders.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BRANDING_API = API_URL + '/branding';

const DEFAULT_BRANDING = {
    ordersPageTitle: 'My Orders',
    ordersPageSubtitle: 'Track all your placed orders in one place',
    ordersSummaryTotalLabel: 'Total Orders',
    ordersSummaryProgressLabel: 'In Progress',
    ordersSummaryDeliveredLabel: 'Delivered',
    ordersTableHeaderTitle: 'Recent Orders',
    ordersEmptyTitle: 'No orders yet',
    ordersEmptyDesc: 'You have not placed any order yet.',
    ordersEmptyBtnText: 'Start Shopping',
};

const STEPS = [
    { label: 'Ordered', status: 'pending' },
    { label: 'Shipped', status: 'shipped' },
    { label: 'Out for Delivery', status: 'out_for_delivery' },
    { label: 'Delivered', status: 'delivered' }
];

const getStatusStep = (status) => {
    switch (status) {
        case 'pending':
        case 'confirmed':
            return 0;
        case 'shipped':
            return 1;
        case 'out_for_delivery':
            return 2;
        case 'delivered':
            return 3;
        default:
            return 0;
    }
};

const MyOrders = () => {
    const { user, token, loading } = useAuth();
    const navigate = useNavigate();
    const [branding, setBranding] = useState(DEFAULT_BRANDING);
    const [loadingBranding, setLoadingBranding] = useState(true);

    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState({});

    const toggleRow = (id) => {
        setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchOrders = async (silent = false) => {
        if (!token) return;
        if (!silent) setIsLoadingOrders(true);

        try {
            const res = await fetch(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            if (!silent) setIsLoadingOrders(false);
        }
    };

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await fetch(BRANDING_API);
                if (res.ok) {
                    const data = await res.json();
                    setBranding({ ...DEFAULT_BRANDING, ...data });
                }
            } catch (err) {
                console.error('Failed to fetch branding data:', err);
            } finally {
                setLoadingBranding(false);
            }
        };
        fetchBranding();
    }, []);

    useEffect(() => {
        if (!loading && (!user || !token)) {
            navigate('/login', { state: { from: '/my-orders' }, replace: true });
            return;
        }

        if (user && token) {
            fetchOrders();
            const timer = setInterval(() => fetchOrders(true), 15000);
            return () => clearInterval(timer);
        }
    }, [user, token, loading, API_URL, navigate]);

    const summary = useMemo(() => {
        return orders.reduce(
            (acc, order) => {
                acc.total += 1;
                if (order.status === 'delivered') acc.delivered += 1;
                if (order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped') acc.inProgress += 1;
                return acc;
            },
            { total: 0, delivered: 0, inProgress: 0 }
        );
    }, [orders]);

    if (loading || isLoadingOrders) {
        return <div className="my-orders-empty"><p>Loading your orders...</p></div>;
    }

    if (!user) return null;

    return (
        <main className="my-orders-page">
            <section className="page-header">
                <div className="container">
                    <h1>{branding.ordersPageTitle}</h1>
                    <p>{branding.ordersPageSubtitle}</p>
                </div>
            </section>

            <div className="container my-orders-content">
                <div className="my-orders-summary">
                    <div className="my-orders-card">
                        <span>{branding.ordersSummaryTotalLabel}</span>
                        <strong>{summary.total}</strong>
                    </div>
                    <div className="my-orders-card">
                        <span>{branding.ordersSummaryProgressLabel}</span>
                        <strong>{summary.inProgress}</strong>
                    </div>
                    <div className="my-orders-card">
                        <span>{branding.ordersSummaryDeliveredLabel}</span>
                        <strong>{summary.delivered}</strong>
                    </div>
                </div>

                <div className="my-orders-table-wrap">
                    <div className="my-orders-table-head">
                        <h2><ShoppingBag size={18} /> {branding.ordersTableHeaderTitle}</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="my-orders-empty">
                            <Package size={48} />
                            <h3>{branding.ordersEmptyTitle}</h3>
                            <p>{branding.ordersEmptyDesc}</p>
                            <Link to="/products" className="btn btn-primary">{branding.ordersEmptyBtnText}</Link>
                        </div>
                    ) : (
                        <table className="my-orders-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <Fragment key={order._id}>
                                        <tr onClick={() => toggleRow(order._id)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                {expandedOrders[order._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </td>
                                            <td className="mono" style={{ fontSize: '0.875rem', fontWeight: 600 }}>#{order.orderId || order._id.slice(-8)}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.items?.length || 0}</td>
                                            <td>Rs. {Number(order.grandTotal || 0).toLocaleString()}</td>
                                            <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                                            <td><span className={`status-badge status-${order.paymentStatus}`}>{order.paymentStatus}</span></td>
                                            <td>{order.paymentMethod === 'online' ? 'Online' : 'COD'}</td>
                                        </tr>
                                        {expandedOrders[order._id] && (
                                            <tr className="order-details-expanded">
                                                <td colSpan="8" style={{ padding: '20px 16px', backgroundColor: 'var(--gray-50)' }}>
                                                    {order.status === 'cancelled' ? (
                                                        <div className="tracker-cancelled-msg">
                                                            This order has been cancelled.
                                                        </div>
                                                    ) : (
                                                        <div className="order-tracker-container">
                                                            <h4 className="tracker-title">Track Order</h4>
                                                            <div className="tracker-stepper">
                                                                <div className="tracker-line"></div>
                                                                <div 
                                                                    className="tracker-line-progress" 
                                                                    style={{ width: `${(getStatusStep(order.status) / (STEPS.length - 1)) * 75}%` }}
                                                                ></div>
                                                                {STEPS.map((step, idx) => {
                                                                    const currentStep = getStatusStep(order.status);
                                                                    const isCompleted = currentStep >= idx;
                                                                    const isActive = currentStep === idx;
                                                                    return (
                                                                        <div key={idx} className={`tracker-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                                                            <div className="tracker-circle">
                                                                                {isCompleted ? <Check size={12} /> : idx + 1}
                                                                            </div>
                                                                            <span className="tracker-label">{step.label}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--gray-700)' }}><strong>Shipping Address:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.phone}, {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</div>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                                        <thead style={{ backgroundColor: 'var(--gray-100)' }}>
                                                            <tr>
                                                                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Product</th>
                                                                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Details</th>
                                                                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Price</th>
                                                                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                                                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Subtotal</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items && order.items.map((item, idx) => (
                                                                <tr key={idx} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                                                    <td style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                                        <span>{item.name || 'Unknown Product'}</span>
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px' }}>
                                                                        {(!item.pricing || item.pricing === 'default') && !item.size && !item.color ? (
                                                                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Standard</span>
                                                                        ) : (
                                                                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                                                                                {item.pricing && item.pricing !== 'default' && <div>Pricing: {item.pricing}</div>}
                                                                                {item.size && <div>Size: {item.size}</div>}
                                                                                {item.color && <div>Color: {item.color}</div>}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>Rs. {item.price}</td>
                                                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.quantity}</td>
                                                                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>Rs. {item.price * item.quantity}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot style={{ backgroundColor: 'var(--gray-50)', fontSize: '0.9rem' }}>
                                                            <tr>
                                                                <td colSpan="4" style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--gray-600)' }}>Subtotal</td>
                                                                <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 500 }}>Rs. {order.total}</td>
                                                            </tr>
                                                            <tr>
                                                                <td colSpan="4" style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--gray-600)' }}>Shipping</td>
                                                                <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 500 }}>{order.shipping > 0 ? `Rs. ${order.shipping}` : 'Free'}</td>
                                                            </tr>
                                                            <tr style={{ borderTop: '2px solid var(--gray-200)' }}>
                                                                <td colSpan="4" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--primary-700)' }}>Total</td>
                                                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--primary-700)' }}>Rs. {order.grandTotal}</td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
};

export default MyOrders;
