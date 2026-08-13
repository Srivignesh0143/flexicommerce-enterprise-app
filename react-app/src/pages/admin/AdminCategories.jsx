import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../admin/AdminLayout.css';

const ICON_OPTIONS = ['Package', 'Monitor', 'Shirt', 'Watch', 'Home', 'ShoppingBag', 'Headphones', 'Camera', 'Smartphone', 'Gift'];
const COLOR_OPTIONS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#ec4899', '#8b5cf6'];

const AdminCategories = () => {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: 'Package', color: '#2563eb' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/categories`);
            if (res.ok) setCategories(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditing(null);
        setFormData({ name: '', icon: 'Package', color: '#2563eb' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setFormData({ name: cat.name, icon: cat.icon || 'Package', color: cat.color || '#2563eb' });
        setError('');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(categories.filter(c => c._id !== id));
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const url = editing ? `${API_URL}/categories/${editing._id}` : `${API_URL}/categories`;
            const method = editing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setShowModal(false);
            fetchCategories();
        } catch (err) { setError('Failed to save category.'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="admin-empty"><p>Loading categories...</p></div>;

    return (
        <div>
            <div className="admin-page-header">
                <h1>Categories</h1>
                <p>Manage product categories</p>
            </div>

            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>{categories.length} Categories</h2>
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={16} /> Add Category
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="admin-empty">
                        <Tag size={48} />
                        <h3>No categories yet</h3>
                        <p>Add your first category to start organizing products</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Color</th>
                                <th>Name</th>
                                <th>Icon</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat._id}>
                                    <td>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: cat.color || '#2563eb' }}></div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                                    <td style={{ color: 'var(--gray-500)', fontSize: '0.813rem' }}>{cat.icon || 'Package'}</td>
                                    <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="table-action-btn" onClick={() => openEdit(cat)} title="Edit"><Edit2 size={14} /></button>
                                            <button className="table-action-btn delete" onClick={() => handleDelete(cat._id)} title="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ margin: 0 }}>{editing ? 'Edit Category' : 'Add New Category'}</h2>
                            <button className="table-action-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Category Name *</label>
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Electronics" />
                            </div>
                            <div className="form-group">
                                <label>Icon</label>
                                <select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })}>
                                    {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {COLOR_OPTIONS.map(c => (
                                        <button
                                            type="button"
                                            key={c}
                                            onClick={() => setFormData({ ...formData, color: c })}
                                            style={{
                                                width: 32, height: 32, borderRadius: '50%', background: c, border: formData.color === c ? '3px solid var(--gray-800)' : '2px solid var(--gray-200)',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editing ? 'Update Category' : 'Add Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
