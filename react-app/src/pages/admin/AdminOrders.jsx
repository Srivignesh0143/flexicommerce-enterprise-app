import { useState, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingBag, CheckCircle, XCircle, Truck, Package, Clock, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ExcelJS from 'exceljs';
import '../admin/AdminLayout.css';

const AdminOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expandedOrders, setExpandedOrders] = useState({});
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpOrder, setOtpOrder] = useState(null);
    const [otpValue, setOtpValue] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);

    const ORDER_STATUS_OPTIONS = [
        { value: 'pending', label: 'Pending' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
    ];

    const PAYMENT_STATUS_OPTIONS = [
        { value: 'pending', label: 'Pay: Pending' },
        { value: 'verified', label: 'Pay: Verified' },
        { value: 'failed', label: 'Pay: Failed' },
    ];

    const toggleRow = (id) => {
        setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setOrders(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders((prev) => prev.map((o) => (o._id === id ? updatedOrder : o)));
                setOpenDropdown(null);
            }
        } catch (err) { console.error(err); }
    };

    const getDisplayStatus = (status) => (status === 'delivered' ? 'delivered' : 'pending');

    const updatePayment = async (id, paymentStatus) => {
        try {
            const res = await fetch(`${API_URL}/orders/${id}/payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ paymentStatus }),
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders((prev) => prev.map((o) => (o._id === id ? updatedOrder : o)));
                setOpenDropdown(null);
            }
        } catch (err) { console.error(err); }
    };

    const getStatusLabel = (value) => ORDER_STATUS_OPTIONS.find((option) => option.value === value)?.label || 'Pending';
    const getPaymentLabel = (value) => PAYMENT_STATUS_OPTIONS.find((option) => option.value === value)?.label || 'Pay: Pending';

    const openMenu = (type, orderId, buttonElement) => {
        const rect = buttonElement.getBoundingClientRect();
        const menuWidth = 190;
        const menuHeight = 132;
        const left = Math.min(Math.max(12, rect.left), window.innerWidth - menuWidth - 12);
        const top = rect.bottom + menuHeight + 12 > window.innerHeight && rect.top > menuHeight + 12
            ? rect.top - menuHeight - 8
            : rect.bottom + 8;

        setOpenDropdown({
            type,
            orderId,
            left,
            top,
            width: Math.max(menuWidth, rect.width),
        });
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter((o) => getDisplayStatus(o.status) === filter);

    const sendOtp = async (orderId) => {
        setOtpLoading(true);
        setOtpError('');
        setOtpSuccessMsg('');
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/send-delivery-otp`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSuccessMsg(data.message || 'OTP sent successfully to the customer!');
            } else {
                setOtpError(data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            console.error(err);
            setOtpError('Error sending OTP.');
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
            setOtpError('Please enter a valid 6-digit OTP.');
            return;
        }
        setOtpLoading(true);
        setOtpError('');
        try {
            const res = await fetch(`${API_URL}/orders/${otpOrder._id}/verify-delivery-otp`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ otp: otpValue })
            });
            const data = await res.json();
            if (res.ok) {
                setOrders((prev) => prev.map((o) => (o._id === otpOrder._id ? data : o)));
                setOtpModalOpen(false);
                alert('Order marked as delivered successfully!');
            } else {
                setOtpError(data.message || 'OTP verification failed.');
            }
        } catch (err) {
            console.error(err);
            setOtpError('Error verifying OTP.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders');

        worksheet.columns = [
            { header: 'S.No', key: 'sNo', width: 8 },
            { header: 'Order ID', key: 'orderId', width: 14 },
            { header: 'Customer Name', key: 'name', width: 22 },
            { header: 'Customer Email', key: 'email', width: 28 },
            { header: 'Date Ordered', key: 'date', width: 22 },
            { header: 'Items Summary', key: 'items', width: 45 },
            { header: 'Total Items', key: 'totalItems', width: 12 },
            { header: 'Payment Method', key: 'paymentMethod', width: 16 },
            { header: 'Payment Status', key: 'paymentStatus', width: 16 },
            { header: 'Order Status', key: 'orderStatus', width: 16 },
            { header: 'Subtotal (Rs.)', key: 'subtotal', width: 15 },
            { header: 'Shipping (Rs.)', key: 'shipping', width: 15 },
            { header: 'Grand Total (Rs.)', key: 'grandTotal', width: 18 },
            { header: 'Shipping Address', key: 'address', width: 60 }
        ];

        filteredOrders.forEach((o, idx) => {
            const itemsDetail = o.items.map(item => {
                const details = [];
                if (item.pricing && item.pricing !== 'default') details.push(`Pricing: ${item.pricing}`);
                if (item.size) details.push(`Size: ${item.size}`);
                if (item.color) details.push(`Color: ${item.color}`);
                const detailStr = details.length > 0 ? ` (${details.join(', ')})` : '';
                return `${item.name}${detailStr} x ${item.quantity} [Rs. ${item.price}]`;
            }).join('\n');

            const address = o.shippingAddress 
                ? `${o.shippingAddress.fullName}, Ph: ${o.shippingAddress.phone}, ${o.shippingAddress.address}, ${o.shippingAddress.city}, ${o.shippingAddress.state} - ${o.shippingAddress.pincode}`
                : 'N/A';

            worksheet.addRow({
                sNo: idx + 1,
                orderId: o.orderId || o._id.slice(-8),
                name: o.userName,
                email: o.userEmail,
                date: new Date(o.createdAt).toLocaleString('en-IN'),
                items: itemsDetail,
                totalItems: o.items.length,
                paymentMethod: (o.paymentMethod || 'cod').toUpperCase(),
                paymentStatus: o.paymentStatus.toUpperCase(),
                orderStatus: o.status.toUpperCase(),
                subtotal: o.total,
                shipping: o.shipping || 0,
                grandTotal: o.grandTotal,
                address: address
            });
        });

        // Style Header Row
        const headerRow = worksheet.getRow(1);
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF2563EB' } // Brand blue
            };
            cell.font = {
                name: 'Segoe UI',
                size: 11,
                bold: true,
                color: { argb: 'FFFFFFFF' }
            };
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF1E40AF' } },
                left: { style: 'thin', color: { argb: 'FF1E40AF' } },
                bottom: { style: 'thin', color: { argb: 'FF1E40AF' } },
                right: { style: 'thin', color: { argb: 'FF1E40AF' } }
            };
        });

        // Style Data Rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            row.height = 22;
            const isEven = rowNumber % 2 === 0;

            row.eachCell((cell, colNumber) => {
                cell.font = {
                    name: 'Segoe UI',
                    size: 10
                };
                
                // Alignments & wraps
                if ([1, 2, 5, 7, 8, 9, 10, 11, 12, 13].includes(colNumber)) {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: [6, 14].includes(colNumber) };
                }

                // Zebra striping background
                if (isEven) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF8FAFC' } // Slate 50
                    };
                } else {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' }
                    };
                }

                // Thin borders
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'customer_orders.xlsx';
        link.click();
    };

    useEffect(() => {
        if (!openDropdown) return undefined;

        const handlePointerDown = (event) => {
            const target = event.target;
            if (target.closest?.('[data-admin-order-dropdown]') || target.closest?.('[data-admin-order-trigger]')) {
                return;
            }
            setOpenDropdown(null);
        };

        const handleWindowChange = () => setOpenDropdown(null);

        document.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('resize', handleWindowChange);
        window.addEventListener('scroll', handleWindowChange, true);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('resize', handleWindowChange);
            window.removeEventListener('scroll', handleWindowChange, true);
        };
    }, [openDropdown]);

    if (loading) return <div className="admin-empty"><p>Loading orders...</p></div>;

    return (
        <div>
            <div className="admin-page-header">
                <h1>Orders</h1>
                <p>Manage and track all customer orders</p>
            </div>

            {/* Filter Tabs */}
            <div className="order-filters" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                {['all', 'pending', 'delivered'].map((f) => (
                    <button
                        key={f}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 16px', fontSize: '0.813rem', textTransform: 'capitalize' }}
                        onClick={() => setFilter(f)}
                    >
                        {f} {f === 'all' ? `(${orders.length})` : `(${orders.filter((o) => getDisplayStatus(o.status) === f).length})`}
                    </button>
                ))}
                <button
                    className="btn btn-secondary"
                    style={{ 
                        padding: '8px 16px', 
                        fontSize: '0.813rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#10b981', 
                        borderColor: '#10b981', 
                        background: 'rgba(16, 185, 129, 0.05)', 
                        marginLeft: 'auto',
                        cursor: 'pointer'
                    }}
                    onClick={handleExportExcel}
                >
                    <FileSpreadsheet size={16} />
                    <span>Export Orders Excel</span>
                </button>
            </div>

            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>{filteredOrders.length} Orders</h2>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="admin-empty">
                        <ShoppingBag size={48} />
                        <h3>No orders found</h3>
                        <p>{filter === 'all' ? 'Orders will appear here when customers place them' : `No ${filter} orders`}</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <Fragment key={order._id}>
                                <tr onClick={() => toggleRow(order._id)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        {expandedOrders[order._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 600 }}>#{order.orderId || order._id.slice(-8)}</td>
                                    <td>
                                        <div>
                                            <span style={{ fontWeight: 500 }}>{order.userName}</span>
                                            <br />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{order.userEmail}</span>
                                        </div>
                                    </td>
                                    <td>{order.items.length} items</td>
                                    <td style={{ fontWeight: 600 }}>Rs. {order.grandTotal.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge status-order-${order.status}`}>
                                            {order.status === 'delivered' ? 'completed' : order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                            <span className={`status-badge status-method-${order.paymentMethod || 'cod'}`}>
                                                {order.paymentMethod === 'online' ? 'ONLINE' : 'COD'}
                                            </span>
                                            <span className={`status-badge status-payment-${order.paymentMethod === 'online' ? 'verified' : order.paymentStatus}`}>
                                                {order.paymentMethod === 'online' ? 'verified' : order.paymentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.813rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="admin-order-actions">
                                            {order.status !== 'delivered' && (
                                                <>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                                                        onClick={() => markDelivered(order)}
                                                    >
                                                        Delivered
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-order-select admin-order-trigger"
                                                        data-admin-order-trigger
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (openDropdown?.type === 'status' && openDropdown?.orderId === order._id) {
                                                                setOpenDropdown(null);
                                                            } else {
                                                                openMenu('status', order._id, e.currentTarget);
                                                            }
                                                        }}
                                                        aria-haspopup="menu"
                                                        aria-expanded={openDropdown?.type === 'status' && openDropdown?.orderId === order._id}
                                                    >
                                                        <span>{getStatusLabel(order.status)}</span>
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </>
                                            )}
                                            {(order.paymentMethod || 'cod') !== 'online' && (
                                                <button
                                                    type="button"
                                                    className="admin-order-select admin-order-trigger"
                                                    data-admin-order-trigger
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (openDropdown?.type === 'payment' && openDropdown?.orderId === order._id) {
                                                            setOpenDropdown(null);
                                                        } else {
                                                            openMenu('payment', order._id, e.currentTarget);
                                                        }
                                                    }}
                                                    aria-haspopup="menu"
                                                    aria-expanded={openDropdown?.type === 'payment' && openDropdown?.orderId === order._id}
                                                >
                                                    <span>{getPaymentLabel(order.paymentStatus)}</span>
                                                    <ChevronDown size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedOrders[order._id] && (
                                    <tr className="order-details-expanded" style={{ cursor: 'default' }}>
                                        <td colSpan="9" style={{ padding: '16px', backgroundColor: 'var(--gray-50)' }}>
                                            <div style={{ marginBottom: '12px' }}><strong>Shipping Address:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.phone}, {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</div>
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

            {otpModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal" style={{ maxWidth: '420px', padding: '24px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Delivery OTP Verification</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
                            Verify order delivery for customer <strong>{otpOrder?.userName}</strong> (Order: #{otpOrder?.orderId || otpOrder?._id?.slice(-8)}).
                        </p>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '8px' }}>
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
                                    border: '2px solid var(--gray-300)',
                                    borderRadius: '8px',
                                    width: '100%',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {otpError && (
                            <div style={{ color: 'var(--danger)', fontSize: '0.825rem', marginBottom: '16px', fontWeight: 500 }}>
                                {otpError}
                            </div>
                        )}

                        {otpSuccessMsg && (
                            <div style={{ color: '#059669', fontSize: '0.825rem', marginBottom: '16px', fontWeight: 500 }}>
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
                                    color: 'var(--primary-600)',
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

                        <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setOtpModalOpen(false)}
                                style={{ padding: '10px 16px', fontSize: '0.875rem', borderRadius: '6px' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={verifyOtp}
                                disabled={otpLoading || otpValue.length !== 6}
                                style={{ padding: '10px 16px', fontSize: '0.875rem', borderRadius: '6px' }}
                            >
                                {otpLoading ? 'Verifying...' : 'Verify & Deliver'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {openDropdown && createPortal(
                <div
                    className="admin-order-dropdown"
                    data-admin-order-dropdown
                    style={{ left: `${openDropdown.left}px`, top: `${openDropdown.top}px`, width: `${openDropdown.width}px` }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {(openDropdown.type === 'status' ? ORDER_STATUS_OPTIONS : PAYMENT_STATUS_OPTIONS).map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className="admin-order-dropdown-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (openDropdown.type === 'status') {
                                    updateStatus(openDropdown.orderId, option.value);
                                } else {
                                    updatePayment(openDropdown.orderId, option.value);
                                }
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminOrders;
