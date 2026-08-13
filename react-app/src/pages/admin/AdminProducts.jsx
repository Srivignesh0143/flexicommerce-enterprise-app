import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Package, X, Upload, PlusCircle, MinusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../admin/AdminLayout.css';

const AdminProducts = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', price: '', originalPrice: '', category: '', image: '',
        description: '', badge: '', rating: '', stock: '100', sizes: '', colors: '',
        isFeatured: false
    });
    const [pricings, setPricings] = useState([]);
    const [showPricings, setShowPricings] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL || '/api';

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/categories`),
            ]);
            if (productsRes.ok) setProducts(await productsRes.json());
            if (categoriesRes.ok) setCategories(await categoriesRes.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setFormData({ ...formData, image: base64 });
            setImagePreview(base64);
        };
        reader.readAsDataURL(file);
    };

    const openCreate = () => {
        setEditingProduct(null);
        setFormData({ name: '', price: '', originalPrice: '', category: categories.length > 0 ? categories[0].name : '', image: '', description: '', badge: '', rating: '', stock: '100', sizes: '', colors: '', isFeatured: false });
        setPricings([]);
        setShowPricings(false);
        setImagePreview('');
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name, price: product.price, originalPrice: product.originalPrice,
            category: product.category, image: product.image, description: product.description || '',
            badge: product.badge || '', rating: product.rating || '', stock: product.stock ?? 100,
            sizes: product.sizes ? product.sizes.join(', ') : '', colors: product.colors ? product.colors.join(', ') : '',
            isFeatured: !!product.isFeatured
        });
        const hasPricings = product.pricings && product.pricings.length > 0;
        setPricings(hasPricings ? product.pricings.map(p => ({ label: p.label, price: p.price })) : []);
        setShowPricings(hasPricings);
        setImagePreview(product.image);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(products.filter(p => p._id !== id));
        } catch (err) { console.error(err); }
    };

    // Pricings helpers
    const addPricingRow = () => setPricings([...pricings, { label: '', price: '' }]);
    const removePricingRow = (idx) => setPricings(pricings.filter((_, i) => i !== idx));
    const updatePricing = (idx, field, value) => {
        const updated = [...pricings];
        updated[idx] = { ...updated[idx], [field]: value };
        setPricings(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Filter out empty pricings
            const validPricings = showPricings
                ? pricings.filter(p => p.label.trim() && p.price).map(p => ({ label: p.label.trim(), price: Number(p.price) }))
                : [];

            const payload = {
                ...formData,
                price: Number(formData.price),
                originalPrice: Number(formData.originalPrice),
                rating: Number(formData.rating) || 0,
                stock: Number(formData.stock) || 100,
                pricings: validPricings,
                sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
                colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : [],
                isFeatured: formData.isFeatured
            };

            const url = editingProduct ? `${API_URL}/products/${editingProduct._id}` : `${API_URL}/products`;
            const method = editingProduct ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowModal(false);
                fetchData();
            }
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="admin-empty"><p>Loading products...</p></div>;

    return (
        <div>
            <div className="admin-page-header">
                <h1>Products</h1>
                <p>Manage your product catalog</p>
            </div>

            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>{products.length} Products</h2>
                    <button className="btn btn-primary" onClick={openCreate} disabled={categories.length === 0}>
                        <Plus size={16} /> Add Product
                    </button>
                </div>

                {categories.length === 0 && (
                    <div className="admin-empty" style={{ padding: '20px 24px', background: 'rgba(245, 158, 11, 0.06)', borderBottom: '1px solid var(--gray-200)' }}>
                        <p style={{ color: '#d97706', fontWeight: 500, fontSize: '0.875rem' }}>⚠ Add at least one category before adding products</p>
                    </div>
                )}

                {products.length === 0 ? (
                    <div className="admin-empty">
                        <Package size={48} />
                        <h3>No products yet</h3>
                        <p>Add your first product to get started</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Pricings</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p._id}>
                                    <td><img src={p.image} alt={p.name} className="product-thumb" /></td>
                                    <td style={{ fontWeight: 500 }}>
                                        {p.name}
                                        {p.isFeatured && (
                                            <span style={{ marginLeft: 8, background: '#dbeafe', color: '#1e40af', fontSize: '0.675rem', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                                Featured
                                            </span>
                                        )}
                                    </td>
                                    <td>{p.category}</td>
                                    <td>Rs. {p.price.toLocaleString()}</td>
                                    <td>
                                        {p.pricings && p.pricings.length > 0 ? (
                                            <div style={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
                                                {p.pricings.map((pr, i) => (
                                                    <div key={i}>{pr.label} — Rs. {pr.price}</div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--gray-400)', fontSize: '0.813rem' }}>—</span>
                                        )}
                                    </td>
                                    <td>{p.stock}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="table-action-btn" onClick={() => openEdit(p)} title="Edit"><Edit2 size={14} /></button>
                                            <button className="table-action-btn delete" onClick={() => handleDelete(p._id)} title="Delete"><Trash2 size={14} /></button>
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
                            <h2 style={{ margin: 0 }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="table-action-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Price *</label>
                                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Original Price *</label>
                                    <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                                        <option value="">Select category</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="form-group">
                                <label>Product Image *</label>
                                <div className="image-upload-area" onClick={() => fileInputRef.current?.click()} style={{
                                    border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius-md)', padding: imagePreview ? '8px' : '32px 20px',
                                    textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'var(--gray-50)',
                                }}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
                                    ) : (
                                        <div>
                                            <Upload size={32} color="var(--gray-400)" />
                                            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: 8 }}>Click to upload product image</p>
                                            <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>PNG, JPG, WEBP up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Badge</label>
                                    <input value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} placeholder="e.g. Best Seller, New" />
                                </div>
                                <div className="form-group">
                                    <label>Rating (0-5)</label>
                                    <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} />
                                </div>
                            </div>
                            
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                                />
                                <label htmlFor="isFeatured" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                                    Featured Product (Display on Landing Page)
                                </label>
                            </div>
                            
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Sizes (Comma separated)</label>
                                    <input value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} placeholder="e.g. S, M, L, XL" />
                                </div>
                                <div className="form-group">
                                    <label>Colors (Comma separated)</label>
                                    <input value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} placeholder="e.g. Red, Blue, Green" />
                                </div>
                            </div>

                            {/* ===== PRICINGS SECTION ===== */}
                            <div className="form-group" style={{ marginTop: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <label style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>Pricings (Optional)</label>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                        onClick={() => {
                                            setShowPricings(!showPricings);
                                            if (!showPricings && pricings.length === 0) {
                                                setPricings([{ label: '', price: '' }, { label: '', price: '' }, { label: '', price: '' }]);
                                            }
                                        }}
                                    >
                                        {showPricings ? 'Remove Pricings' : 'Add Pricings'}
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: 12 }}>
                                    Add quantity-based pricing like: 1 kg - Rs. 20, 2 kg packet - Rs. 600, 500 ml - Rs. 50
                                </p>

                                {showPricings && (
                                    <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid var(--gray-200)' }}>
                                        {pricings.map((p, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: idx < pricings.length - 1 ? 10 : 0 }}>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 1 kg, 2 kg packet, 500 ml"
                                                    value={p.label}
                                                    onChange={(e) => updatePricing(idx, 'label', e.target.value)}
                                                    style={{ flex: 1.5, padding: '10px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                                                />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                                                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-500)' }}>Rs.</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Price"
                                                        value={p.price}
                                                        onChange={(e) => updatePricing(idx, 'price', e.target.value)}
                                                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                                                    />
                                                </div>
                                                <button type="button" onClick={() => removePricingRow(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}>
                                                    <MinusCircle size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addPricingRow}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
                                                background: 'none', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius-md)',
                                                padding: '8px 14px', fontSize: '0.813rem', color: 'var(--primary-600)', cursor: 'pointer', width: '100%', justifyContent: 'center',
                                            }}
                                        >
                                            <PlusCircle size={16} /> Add another pricing
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
