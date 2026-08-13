import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Truck, Package, CheckCircle2, User, Mail, Lock, X, AlertCircle, Eye, EyeOff, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminManageDelivery.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminManageDelivery = () => {
    const { token } = useAuth();
    const [partners, setPartners] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [assignPartnerId, setAssignPartnerId] = useState('');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = useCallback(async () => {
        try {
            const [pRes, oRes] = await Promise.all([
                fetch(`${API_URL}/delivery/partners`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (pRes.ok) setPartners(await pRes.json());
            if (oRes.ok) setOrders(await oRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            setFormError('All fields are required.');
            return;
        }
        if (formData.password.length < 6) {
            setFormError('Password must be at least 6 characters.');
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            const res = await fetch(`${API_URL}/delivery/partners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            showToast('Delivery partner created successfully!');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '' });
            fetchData();
        } catch (err) {
            setFormError(err.message || 'Failed to create partner.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_URL}/delivery/partners/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to delete.');
            showToast('Delivery partner removed.');
            setConfirmDelete(null);
            fetchData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleAssign = async (orderId) => {
        try {
            const res = await fetch(`${API_URL}/delivery/orders/${orderId}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ partnerId: assignPartnerId || null }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            showToast('Order assigned successfully!');
            setAssigningOrder(null);
            setAssignPartnerId('');
            fetchData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const unassignedOrders = orders.filter(o => !o.assignedTo && !['delivered', 'cancelled'].includes(o.status));
    const assignedOrders = orders.filter(o => o.assignedTo && !['delivered', 'cancelled'].includes(o.status));

    if (loading) {
        return (
            <div className="amd-loading">
                <div className="amd-spinner" />
                <p>Loading delivery data...</p>
            </div>
        );
    }

    return (
        <div className="amd-page">
            {/* Toast */}
            {toast && (
                <div className={`amd-toast amd-toast-${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Delete Confirm Modal */}
            {confirmDelete && (
                <div className="admin-modal-overlay">
                    <div className="amd-confirm-modal">
                        <div className="amd-confirm-icon"><Trash2 size={28} /></div>
                        <h3>Remove Delivery Partner?</h3>
                        <p>This will unassign all their orders. This action cannot be undone.</p>
                        <div className="amd-confirm-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Order Modal */}
            {assigningOrder && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h2>Assign Order to Delivery Partner</h2>
                        <p className="amd-modal-sub">Order: <strong>{assigningOrder.orderId || assigningOrder._id}</strong></p>
                        <p className="amd-modal-sub">Customer: <strong>{assigningOrder.userName}</strong></p>
                        <div className="form-group" style={{ marginTop: 20 }}>
                            <label>Select Delivery Partner</label>
                            <select
                                value={assignPartnerId}
                                onChange={e => setAssignPartnerId(e.target.value)}
                                className="amd-select"
                            >
                                <option value="">-- Unassigned --</option>
                                {partners.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => { setAssigningOrder(null); setAssignPartnerId(''); }}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => handleAssign(assigningOrder._id)}>Assign</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Partner Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="amd-modal-header">
                            <h2>Add Delivery Partner</h2>
                            <button className="amd-modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label><User size={14} /> Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ravi Kumar"
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label><Mail size={14} /> Email Address</label>
                                <input
                                    type="email"
                                    placeholder="e.g. ravi@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label><Lock size={14} /> Password</label>
                                <div className="amd-pw-wrapper">
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="Minimum 6 characters"
                                        value={formData.password}
                                        onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                                    />
                                    <button type="button" className="amd-pw-toggle" onClick={() => setShowPw(!showPw)}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            {formError && (
                                <div className="amd-form-error"><AlertCircle size={14} />{formError}</div>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Creating...' : 'Create Partner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1>Manage Delivery</h1>
                    <p>Add delivery partners and assign orders to them</p>
                </div>
                <div className="amd-header-actions">
                    <button className="btn btn-secondary" onClick={fetchData}><RefreshCw size={15} /> Refresh</button>
                    <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); }}>
                        <Plus size={16} /> Add Partner
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="amd-stats">
                <div className="amd-stat amd-stat-indigo">
                    <Users size={20} />
                    <div><p className="amd-stat-val">{partners.length}</p><p className="amd-stat-lbl">Partners</p></div>
                </div>
                <div className="amd-stat amd-stat-amber">
                    <Package size={20} />
                    <div><p className="amd-stat-val">{unassignedOrders.length}</p><p className="amd-stat-lbl">Unassigned</p></div>
                </div>
                <div className="amd-stat amd-stat-blue">
                    <Truck size={20} />
                    <div><p className="amd-stat-val">{assignedOrders.length}</p><p className="amd-stat-lbl">In Progress</p></div>
                </div>
            </div>

            {/* Delivery Partners Table */}
            <div className="admin-table-wrapper" style={{ marginBottom: 32 }}>
                <div className="admin-table-header">
                    <h2><Truck size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Delivery Partners</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setFormError(''); }}>
                        <Plus size={14} /> Add Partner
                    </button>
                </div>
                {partners.length === 0 ? (
                    <div className="admin-empty">
                        <Truck size={40} strokeWidth={1} />
                        <h3>No delivery partners yet</h3>
                        <p>Add your first delivery partner to get started.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Partner</th>
                                <th>Email</th>
                                <th>Total Orders</th>
                                <th>Active</th>
                                <th>Delivered</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partners.map(p => (
                                <tr key={p._id}>
                                    <td>
                                        <div className="amd-partner-cell">
                                            <div className="amd-avatar">{p.name?.charAt(0).toUpperCase()}</div>
                                            <span className="amd-partner-name">{p.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#64748b' }}>{p.email}</td>
                                    <td><span className="amd-count-badge">{p.orderCount || 0}</span></td>
                                    <td><span className="amd-count-badge amd-count-amber">{p.activeCount || 0}</span></td>
                                    <td><span className="amd-count-badge amd-count-green">{p.deliveredCount || 0}</span></td>
                                    <td>
                                        <button
                                            className="table-action-btn delete"
                                            title="Remove partner"
                                            onClick={() => setConfirmDelete(p._id)}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Unassigned Orders */}
            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2><Package size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Unassigned Orders ({unassignedOrders.length})</h2>
                </div>
                {unassignedOrders.length === 0 ? (
                    <div className="admin-empty" style={{ padding: '40px 20px' }}>
                        <CheckCircle2 size={36} strokeWidth={1} />
                        <h3>All orders are assigned!</h3>
                        <p>No active orders pending assignment.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>City</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Assign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unassignedOrders.map(o => (
                                <tr key={o._id}>
                                    <td>
                                        <span className="order-id">{o.orderId || o._id.slice(-8).toUpperCase()}</span>
                                    </td>
                                    <td>{o.userName}</td>
                                    <td style={{ color: '#64748b' }}>{o.shippingAddress?.city || '—'}</td>
                                    <td>
                                        <span className={`status-badge status-order-${o.status}`}>
                                            {o.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>₹{o.grandTotal?.toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => { setAssigningOrder(o); setAssignPartnerId(o.assignedTo || ''); }}
                                        >
                                            <Truck size={13} /> Assign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Assigned Orders */}
            {assignedOrders.length > 0 && (
                <div className="admin-table-wrapper" style={{ marginTop: 24 }}>
                    <div className="admin-table-header">
                        <h2><Truck size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Active Assigned Orders ({assignedOrders.length})</h2>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Assigned To</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Reassign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedOrders.map(o => (
                                <tr key={o._id}>
                                    <td><span className="order-id">{o.orderId || o._id.slice(-8).toUpperCase()}</span></td>
                                    <td>{o.userName}</td>
                                    <td>
                                        <div className="amd-partner-cell">
                                            <div className="amd-avatar amd-avatar-sm">{o.assignedToName?.charAt(0).toUpperCase()}</div>
                                            <span>{o.assignedToName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-order-${o.status}`}>
                                            {o.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>₹{o.grandTotal?.toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="table-action-btn"
                                            title="Reassign"
                                            onClick={() => { setAssigningOrder(o); setAssignPartnerId(o.assignedTo || ''); }}
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminManageDelivery;
