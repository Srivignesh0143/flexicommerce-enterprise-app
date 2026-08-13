import { useState, useEffect } from 'react';
import { Star, SlidersHorizontal, Search, Truck, Heart, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Products.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BRANDING_API = API_URL + '/branding';

const DEFAULT_BRANDING = {
    productsPageTitle: 'Our Products',
    productsPageSubtitle: 'Discover our complete range of premium products',
    productsSidebarFiltersLabel: 'Filters',
    productsSidebarSearchPlaceholder: 'Search products...',
    productsSidebarCategoriesLabel: 'Categories',
    productsSidebarPriceLabel: 'Price Range',
    productsToolbarSortLabel: 'Sort by:',
    productsToolbarResultsSuffix: 'products found',
    productsEmptyTitle: 'No products found',
    productsEmptyDesc: 'Try adjusting your filters or search query',
    productsEmptyComingSoon: 'Products coming soon! Stay tuned.',
    productsShippingBadgeText: 'Free shipping on orders above Rs. 999',
    productsAddToCartText: 'Add to Cart',
    productsModalTitle: 'Select Options',
    productsModalConfirmText: 'Confirm Add to Cart',
    productsModalShippingText: 'Free shipping on orders above Rs. 999',
};

const Products = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceBounds, setPriceBounds] = useState([0, 0]);
    const [priceRange, setPriceRange] = useState([0, 0]);
    const [loading, setLoading] = useState(true);
    const [branding, setBranding] = useState(DEFAULT_BRANDING);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedDesc, setExpandedDesc] = useState({});

    const toggleDesc = (id) => setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));

    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem('flexi_wishlist');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const toggleWishlist = (productId) => {
        setWishlist(prev => {
            const updated = { ...prev, [productId]: !prev[productId] };
            try {
                localStorage.setItem('flexi_wishlist', JSON.stringify(updated));
            } catch (e) {
                console.error(e);
            }
            return updated;
        });
    };

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedPricing, setSelectedPricing] = useState('default');

    // Reset pagination to page 1 when any filter or query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, sortBy, searchQuery, priceRange]);

    const handleAddToCartClick = (product) => {
        const hasSizes = product.sizes && product.sizes.length > 0;
        const hasColors = product.colors && product.colors.length > 0;
        const hasPricings = product.pricings && product.pricings.length > 0;

        if (hasSizes || hasColors || hasPricings) {
            setSelectedProduct(product);
            setSelectedSize(hasSizes ? product.sizes[0] : '');
            setSelectedColor(hasColors ? product.colors[0] : '');
            setSelectedPricing('default');
        } else {
            addToCart(product);
        }
    };

    const confirmAddToCart = () => {
        if (!selectedProduct) return;
        addToCart(selectedProduct, undefined, selectedPricing, selectedSize, selectedColor);
        setSelectedProduct(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes, brandingRes] = await Promise.all([
                    fetch(`${API_URL}/products`),
                    fetch(`${API_URL}/categories`),
                    fetch(BRANDING_API),
                ]);
                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    setProducts(productsData);

                    if (productsData.length > 0) {
                        const prices = productsData.map((p) => Number(p.price) || 0);
                        const minPrice = Math.min(...prices);
                        const maxPrice = Math.max(...prices);
                        setPriceBounds([minPrice, maxPrice]);
                        setPriceRange([minPrice, maxPrice]);
                    }
                }
                if (categoriesRes.ok) setCategories(await categoriesRes.json());
                if (brandingRes.ok) {
                    const b = await brandingRes.json();
                    setBranding({ ...DEFAULT_BRANDING, ...b });
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const categoryNames = ['All', ...categories.map(c => c.name)];

    let filtered = products.filter((p) => {
        const productPrice = Number(p.price) || 0;
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];
        return matchesCategory && matchesSearch && matchesPrice;
    });

    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const paginatedProducts = filtered.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) {
        return (
            <main className="products-page">
                <section className="page-header">
                    <div className="container"><h1>{branding.productsPageTitle}</h1><p>Loading products...</p></div>
                </section>
            </main>
        );
    }

    return (
        <main className="products-page">
            <section className="page-header">
                <div className="container">
                    <h1>{branding.productsPageTitle}</h1>
                    <p>{branding.productsPageSubtitle}</p>
                </div>
            </section>

            <div className="container products-layout">
                {/* Mobile Filter Toggle */}
                <button
                    className="mobile-filter-toggle"
                    onClick={() => setSidebarOpen(prev => !prev)}
                    aria-expanded={sidebarOpen}
                >
                    <SlidersHorizontal size={16} />
                    <span className="mobile-filter-toggle-label">Filters</span>
                    {sidebarOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Sidebar */}
                <aside className={`products-sidebar${sidebarOpen ? '' : ' sidebar-hidden'}`}>
                    <div className="sidebar-section">
                        <h3><SlidersHorizontal size={18} /> {branding.productsSidebarFiltersLabel}</h3>
                    </div>

                    <div className="sidebar-section">
                        <h4>Search</h4>
                        <div className="search-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder={branding.productsSidebarSearchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h4>{branding.productsSidebarCategoriesLabel}</h4>
                        <ul className="category-filters">
                            {categoryNames.map((cat) => (
                                <li key={cat}>
                                    <button
                                        className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                        <span className="filter-count">
                                            {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sidebar-section">
                        <h4>{branding.productsSidebarPriceLabel}</h4>
                        <div className="price-range-display">
                            <span>Rs. {priceRange[0].toLocaleString()}</span>
                            <span>Rs. {priceRange[1].toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min={priceBounds[0]}
                            max={priceBounds[1]}
                            step="1"
                            value={priceRange[0]}
                            onChange={(e) => {
                                const nextMin = Number(e.target.value);
                                setPriceRange([Math.min(nextMin, priceRange[1]), priceRange[1]]);
                            }}
                            className="price-slider"
                        />
                        <input
                            type="range"
                            min={priceBounds[0]}
                            max={priceBounds[1]}
                            step="1"
                            value={priceRange[1]}
                            onChange={(e) => {
                                const nextMax = Number(e.target.value);
                                setPriceRange([priceRange[0], Math.max(nextMax, priceRange[0])]);
                            }}
                            className="price-slider"
                        />
                    </div>
                </aside>

                {/* Products Grid */}
                <div className="products-main">
                    <div className="products-toolbar">
                        <div className="sort-wrapper">
                            <label>{branding.productsToolbarSortLabel}</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="default">Default</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                                <option value="name">Name A-Z</option>
                            </select>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="no-products">
                            <Search size={48} />
                            <h3>{branding.productsEmptyTitle}</h3>
                            <p>{products.length === 0 ? branding.productsEmptyComingSoon : branding.productsEmptyDesc}</p>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid-page">
                                {paginatedProducts.map((product) => {
                                    const isWishlisted = !!wishlist[product._id];
                                    const discountPct = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
                                    const reviewCount = product.reviews !== undefined ? product.reviews : (product.rating ? Math.floor(product.rating * 8 + 4) : 0);
                                    return (
                                        <div className="product-card" key={product._id}>
                                            <div className="product-image-wrapper">
                                                {product.badge && (
                                                    <span className={`product-badge badge-${product.badge.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {product.badge}
                                                    </span>
                                                )}
                                                <button 
                                                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleWishlist(product._id);
                                                    }}
                                                    aria-label="Add to Wishlist"
                                                >
                                                    <Heart size={18} fill={isWishlisted ? 'var(--danger)' : 'none'} color={isWishlisted ? 'var(--danger)' : 'currentColor'} />
                                                </button>
                                                <img src={product.image} alt={product.name} className="product-image" />
                                            </div>
                                            <div className="product-info">
                                                <span className="product-category">{product.category}</span>
                                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }} className="product-name">{product.name}</h3>
                                                {/* View Details toggle */}
                                                <button
                                                    className="view-details-btn"
                                                    onClick={() => toggleDesc(product._id)}
                                                    aria-expanded={!!expandedDesc[product._id]}
                                                >
                                                    {expandedDesc[product._id] ? 'Hide Details ▲' : 'View Details ▼'}
                                                </button>
                                                {expandedDesc[product._id] && (
                                                    <p className="product-description product-description-expanded">{product.description}</p>
                                                )}
                                                <div className="product-rating">
                                                    <div className="stars-wrapper">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'}
                                                                color={i < Math.floor(product.rating) ? '#f59e0b' : '#d1d5db'}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="rating-count">
                                                        {product.rating > 0 ? `${product.rating.toFixed(1)} ` : ''}({reviewCount})
                                                    </span>
                                                </div>
                                                <div className="product-pricing">
                                                    <span className="price-current">Rs. {product.price.toLocaleString()}</span>
                                                    {product.originalPrice > product.price && (
                                                        <>
                                                            <span className="price-original">Rs. {product.originalPrice.toLocaleString()}</span>
                                                            <span className="price-discount">
                                                                {discountPct}% OFF
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="product-shipping-badge">
                                                    <Truck size={14} className="shipping-icon" />
                                                    <span>{branding.productsShippingBadgeText}</span>
                                                </div>
                                                <button className="btn btn-primary product-btn" onClick={() => handleAddToCartClick(product)}>
                                                    <ShoppingCart size={15} />
                                                    <span>{branding.productsAddToCartText}</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button 
                                        className="pagination-btn pagination-nav-btn" 
                                        disabled={currentPage === 1}
                                        onClick={() => {
                                            setCurrentPage(prev => Math.max(prev - 1, 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <div className="pagination-numbers">
                                        {[...Array(totalPages)].map((_, idx) => (
                                            <button
                                                key={idx + 1}
                                                className={`pagination-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                                                onClick={() => {
                                                    setCurrentPage(idx + 1);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        className="pagination-btn pagination-nav-btn" 
                                        disabled={currentPage === totalPages}
                                        onClick={() => {
                                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {selectedProduct && (
                <div className="admin-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{branding.productsModalTitle}</h2>
                            <button className="table-action-btn" onClick={() => setSelectedProduct(null)}>x</button>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{selectedProduct.name}</h3>
                        </div>

                        {selectedProduct.pricings && selectedProduct.pricings.length > 0 && (
                            <div className="form-group" style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: '0.875rem' }}>Variant / Pricing</label>
                                <select value={selectedPricing} onChange={(e) => setSelectedPricing(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                                    <option value="default">Default - Rs. {selectedProduct.price}</option>
                                    {selectedProduct.pricings.map((p, idx) => (
                                        <option key={idx} value={p.label}>{p.label} - Rs. {p.price}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                            <div className="form-group" style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: '0.875rem' }}>Size</label>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                    {selectedProduct.sizes.map((s, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => setSelectedSize(s)}
                                            style={{ 
                                                padding: '6px 12px', 
                                                border: selectedSize === s ? '2px solid var(--primary-600)' : '1px solid var(--gray-300)', 
                                                background: selectedSize === s ? 'var(--primary-50)' : 'white',
                                                borderRadius: '4px', cursor: 'pointer' 
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: '0.875rem' }}>Color</label>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                    {selectedProduct.colors.map((c, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => setSelectedColor(c)}
                                            style={{ 
                                                padding: '6px 12px', 
                                                border: selectedColor === c ? '2px solid var(--primary-600)' : '1px solid var(--gray-300)', 
                                                background: selectedColor === c ? 'var(--primary-50)' : 'white',
                                                borderRadius: '4px', cursor: 'pointer' 
                                            }}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={confirmAddToCart}>
                            {branding.productsModalConfirmText}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Products;
