import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCcw, Star, ChevronLeft, ChevronRight, ChevronDown, Package, Heart, ShoppingCart, Award, Zap, Headphones, Flame, Instagram, Search, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Landing.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BRANDING_API = API_URL + '/branding';

const DEFAULT_BRANDING = {
    colorPrimary: '#2563eb', colorSecondary: '#7c3aed', colorAccent: '#10b981',
    colorBackground: '#ffffff', colorText: '#111827', colorButton: '#2563eb',
    fontHeading: 'Poppins', fontBody: 'Poppins', fontSizeBase: '16px',
    heroSlides: [
        { image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=700&fit=crop', tag: 'Premium Shopping Experience', title: 'Discover Products That', highlight: 'Define Your Style', subtitle: 'Explore our curated collection of premium electronics, fashion, and accessories. Quality meets affordability at Flexi Commerce.' },
        { image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=700&fit=crop', tag: 'New Arrivals', title: 'Elevate Your Wardrobe With', highlight: 'Trending Fashion', subtitle: 'Shop the latest trends in fashion. From casual wear to premium accessories, find everything you need.' },
        { image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=700&fit=crop', tag: 'Tech Deals', title: 'Cutting-Edge', highlight: 'Electronics & Gadgets', subtitle: 'Get up to 40% off on top-brand electronics. Headphones, laptops, smartwatches and more at unbeatable prices.' },
        { image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=700&fit=crop', tag: 'Best Sellers', title: 'Shop Our Most', highlight: 'Popular Products', subtitle: 'Thousands of customers love these picks. Browse our bestselling collection and see why.' },
    ],
    statOneNumber: '10K+', statOneLabel: 'Happy Customers',
    statTwoNumber: '500+', statTwoLabel: 'Premium Products',
    statThreeNumber: '99%', statThreeLabel: 'Satisfaction Rate',
    featureOneTitle: 'Free Shipping', featureOneDesc: 'Free delivery on orders above Rs. 999',
    featureTwoTitle: 'Secure Payments', featureTwoDesc: '100% secure payment processing',
    featureThreeTitle: 'Easy Returns', featureThreeDesc: '30-day hassle-free return policy',
    categoriesSectionTitle: 'Shop by Category', categoriesSectionSubtitle: 'Browse our wide range of product categories',
    featuredSectionTitle: 'Featured Products', featuredSectionSubtitle: 'Handpicked premium products just for you',
    promoTag: 'Limited Time Offer', promoTitle: 'Up to 40% Off on Electronics',
    promoDesc: 'Grab the best deals on top-brand electronics. Premium quality, unbeatable prices. Offer valid while stocks last.',
    promoButtonText: 'Shop the Sale', promoImage: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&h=400&fit=crop',
    testimonialsSectionTitle: 'What Our Customers Say', testimonialsSectionSubtitle: 'Real reviews from real customers',
    testimonialOneText: 'Exceptional quality products and lightning-fast delivery. Flexi Commerce has become my go-to online store.',
    testimonialOneName: 'Priya S.',
    testimonialOneRole: 'Verified Buyer',
    testimonialOneStars: 5,
    testimonialTwoText: 'The product range is impressive and the prices are unbeatable. Customer service is top-notch too.',
    testimonialTwoName: 'Arjun M.',
    testimonialTwoRole: 'Verified Buyer',
    testimonialTwoStars: 5,
    testimonialThreeText: 'I love the seamless shopping experience. Every order has been perfect, from browsing to delivery.',
    testimonialThreeName: 'Sneha R.',
    testimonialThreeRole: 'Verified Buyer',
    testimonialThreeStars: 4,
    newsletterTitle: 'Shop with Confidence', newsletterSubtitle: 'Enjoy secure shopping with 30-day hassle-free returns, free delivery over Rs. 999, and 24/7 dedicated support.', newsletterBtnText: '',
};



const Landing = () => {
    const { addToCart } = useCart();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [branding, setBranding] = useState(DEFAULT_BRANDING);
    const intervalRef = useRef(null);

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

    // FAQ interactive state
    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (index) => {
        setActiveFaq(prev => (prev === index ? null : index));
    };

    const heroSlides = branding.heroSlides && branding.heroSlides.length > 0 ? branding.heroSlides : DEFAULT_BRANDING.heroSlides;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes, brandingRes] = await Promise.all([
                    fetch(`${API_URL}/products`),
                    fetch(`${API_URL}/categories`),
                    fetch(BRANDING_API),
                ]);
                if (productsRes.ok) {
                    const allProducts = await productsRes.json();
                    const featured = allProducts.filter(p => p.isFeatured);
                    setFeaturedProducts(featured.length > 0 ? featured : allProducts.slice(0, 4));
                }
                if (categoriesRes.ok) setCategories(await categoriesRes.json());
                if (brandingRes.ok) {
                    const b = await brandingRes.json();
                    const merged = { ...DEFAULT_BRANDING, ...b };
                    setBranding(merged);
                    // Apply CSS variables
                    const r = document.documentElement;
                    r.style.setProperty('--primary-600', merged.colorPrimary);
                    r.style.setProperty('--primary-700', merged.colorPrimary);
                    r.style.setProperty('--brand-secondary', merged.colorSecondary);
                    r.style.setProperty('--brand-accent', merged.colorAccent);
                    if (merged.fontBody) document.body.style.fontFamily = `'${merged.fontBody}', sans-serif`;
                    if (merged.fontSizeBase) document.documentElement.style.fontSize = merged.fontSizeBase;
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
    }, []);

    const goToSlide = (indexOrFn) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide((prev) => (typeof indexOrFn === 'function' ? indexOrFn(prev) : indexOrFn));
        setTimeout(() => setIsAnimating(false), 600);
    };

    const startAutoSlide = () => {
        intervalRef.current = setInterval(() => {
            goToSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
    };

    const stopAutoSlide = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    useEffect(() => {
        startAutoSlide();
        return () => stopAutoSlide();
    }, []);

    const nextSlide = () => { stopAutoSlide(); goToSlide((prev) => (prev + 1) % heroSlides.length); startAutoSlide(); };
    const prevSlide = () => { stopAutoSlide(); goToSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length); startAutoSlide(); };

    const slide = heroSlides[currentSlide];

    const activeTestimonials = [
        { id: 1, rating: branding.testimonialOneStars || 5, text: branding.testimonialOneText || '', name: branding.testimonialOneName || '', role: branding.testimonialOneRole || '' },
        { id: 2, rating: branding.testimonialTwoStars || 5, text: branding.testimonialTwoText || '', name: branding.testimonialTwoName || '', role: branding.testimonialTwoRole || '' },
        { id: 3, rating: branding.testimonialThreeStars || 5, text: branding.testimonialThreeText || '', name: branding.testimonialThreeName || '', role: branding.testimonialThreeRole || '' },
    ];

    return (
        <main className="landing">
            {/* ===== HERO SLIDER ===== */}
            <section className="hero-slider">
                <div className="slider-bg-container">
                    {heroSlides.map((s, idx) => (
                        <div key={idx} className={`slider-bg ${idx === currentSlide ? 'slider-bg-active' : ''}`} style={{ backgroundImage: `url(${s.image})` }} />
                    ))}
                    <div className="slider-overlay" />
                </div>
                <div className="container hero-slider-content">
                    <div className="hero-text-slider" key={currentSlide}>
                        <span className="hero-tag animate-slide-down">{slide.tag}</span>
                        <h1 className="hero-title animate-slide-up">
                            {slide.title} <span className="highlight">{slide.highlight}</span>
                        </h1>
                        <p className="hero-subtitle animate-slide-up delay-1">{slide.subtitle}</p>
                        <div className="hero-actions animate-slide-up delay-2">
                            <Link to="/products" className="btn btn-primary btn-lg">Shop Now <ArrowRight size={18} /></Link>
                            <Link to="/contact" className="btn btn-secondary-light btn-lg">Contact Us</Link>
                        </div>
                    </div>
                    <div className="hero-stats animate-slide-up delay-3">
                        <div className="stat"><span className="stat-number">{branding.statOneNumber}</span><span className="stat-label">{branding.statOneLabel}</span></div>
                        <div className="stat-divider"></div>
                        <div className="stat"><span className="stat-number">{branding.statTwoNumber}</span><span className="stat-label">{branding.statTwoLabel}</span></div>
                        <div className="stat-divider"></div>
                        <div className="stat"><span className="stat-number">{branding.statThreeNumber}</span><span className="stat-label">{branding.statThreeLabel}</span></div>
                    </div>
                </div>
                <button className="slider-arrow slider-prev" onClick={prevSlide} aria-label="Previous slide"><ChevronLeft size={24} /></button>
                <button className="slider-arrow slider-next" onClick={nextSlide} aria-label="Next slide"><ChevronRight size={24} /></button>
                <div className="slider-dots">
                    {heroSlides.map((_, idx) => (
                        <button key={idx} className={`slider-dot ${idx === currentSlide ? 'dot-active' : ''}`} onClick={() => { stopAutoSlide(); goToSlide(idx); startAutoSlide(); }} aria-label={`Go to slide ${idx + 1}`} />
                    ))}
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="features section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card"><div className="feature-icon"><Truck size={28} /></div><h3>{branding.featureOneTitle}</h3><p>{branding.featureOneDesc}</p></div>
                        <div className="feature-card"><div className="feature-icon"><ShieldCheck size={28} /></div><h3>{branding.featureTwoTitle}</h3><p>{branding.featureTwoDesc}</p></div>
                        <div className="feature-card"><div className="feature-icon"><RefreshCcw size={28} /></div><h3>{branding.featureThreeTitle}</h3><p>{branding.featureThreeDesc}</p></div>
                    </div>
                </div>
            </section>

            {/* ===== VALUE PROPOSITIONS SECTION ===== */}
            <section className="val-props section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">{branding.valPropTitle || 'Why Choose Us'}</h2>
                        <p className="section-subtitle">{branding.valPropSubtitle || 'We focus on customer happiness and top quality.'}</p>
                    </div>
                    <div className="val-props-grid">
                        <div className="val-prop-card">
                            <div className="val-prop-icon-wrapper">
                                <Award className="val-prop-icon" size={28} />
                            </div>
                            <h3>{branding.valPropOneTitle || 'Premium Quality'}</h3>
                            <p>{branding.valPropOneDesc || 'We source only from top verified suppliers.'}</p>
                        </div>
                        <div className="val-prop-card">
                            <div className="val-prop-icon-wrapper">
                                <ShieldCheck className="val-prop-icon" size={28} />
                            </div>
                            <h3>{branding.valPropTwoTitle || 'Secure Payments'}</h3>
                            <p>{branding.valPropTwoDesc || 'Your transaction info is 100% encrypted.'}</p>
                        </div>
                        <div className="val-prop-card">
                            <div className="val-prop-icon-wrapper">
                                <Zap className="val-prop-icon" size={28} />
                            </div>
                            <h3>{branding.valPropThreeTitle || 'Fast Delivery'}</h3>
                            <p>{branding.valPropThreeDesc || 'Reliable doorstep shipping within 2-3 business days.'}</p>
                        </div>
                        <div className="val-prop-card">
                            <div className="val-prop-icon-wrapper">
                                <Headphones className="val-prop-icon" size={28} />
                            </div>
                            <h3>{branding.valPropFourTitle || '24/7 Priority Support'}</h3>
                            <p>{branding.valPropFourDesc || 'Our helpdesk is always active to assist you.'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CATEGORIES (from DB) ===== */}
            {categories.length > 0 && (
                <section className="categories section">
                    <div className="container">
                        <h2 className="section-title">{branding.categoriesSectionTitle}</h2>
                        <p className="section-subtitle">{branding.categoriesSectionSubtitle}</p>
                        <div className="categories-grid">
                            {categories.map((cat) => (
                                <Link to="/products" key={cat._id} className="category-card">
                                    <div className="category-icon" style={{ '--cat-color': cat.color }}>
                                        <Package size={32} />
                                    </div>
                                    <h3>{cat.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== FEATURED PRODUCTS (from DB) ===== */}
            {featuredProducts.length > 0 && (
                <section className="featured section">
                    <div className="container">
                        <h2 className="section-title">{branding.featuredSectionTitle}</h2>
                        <p className="section-subtitle">{branding.featuredSectionSubtitle}</p>
                        <div className="products-grid">
                            {featuredProducts.map((product) => {
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
                                            <h3 className="product-name">{product.name}</h3>
                                            <div className="product-rating">
                                                <div className="stars-wrapper">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'} color={i < Math.floor(product.rating) ? '#f59e0b' : '#d1d5db'} />
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
                                            <button className="btn btn-primary product-btn" onClick={() => addToCart(product)}>
                                                <ShoppingCart size={15} />
                                                <span>Add to Cart</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="featured-cta">
                            <Link to="/products" className="btn btn-secondary btn-lg">View All Products <ArrowRight size={18} /></Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== HOW IT WORKS SECTION ===== */}
            <section className="how-it-works section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">{branding.howTitle || 'Simple & Secure Shopping'}</h2>
                        <p className="section-subtitle">{branding.howSubtitle || 'Get your favorite items delivered to your doorstep in three easy steps.'}</p>
                    </div>
                    <div className="how-it-works-grid">
                        <div className="how-step-card">
                            <div className="how-step-badge">1</div>
                            <div className="how-step-icon-wrapper">
                                <Search className="how-step-icon" size={28} />
                            </div>
                            <h3>{branding.howStepOneTitle || '1. Select Your Products'}</h3>
                            <p>{branding.howStepOneDesc || 'Browse our extensive catalog and add premium items to your shopping cart.'}</p>
                        </div>
                        <div className="how-step-card">
                            <div className="how-step-badge">2</div>
                            <div className="how-step-icon-wrapper">
                                <CreditCard className="how-step-icon" size={28} />
                            </div>
                            <h3>{branding.howStepTwoTitle || '2. Safe Checkout'}</h3>
                            <p>{branding.howStepTwoDesc || 'Complete your purchase securely using Credit Cards, UPI, or Cash on Delivery.'}</p>
                        </div>
                        <div className="how-step-card">
                            <div className="how-step-badge">3</div>
                            <div className="how-step-icon-wrapper">
                                <Truck className="how-step-icon" size={28} />
                            </div>
                            <h3>{branding.howStepThreeTitle || '3. Track Your Delivery'}</h3>
                            <p>{branding.howStepThreeDesc || 'Enjoy real-time shipping notifications and updates straight to your doorstep.'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== PROMO BANNER ===== */}
            <section className="promo-banner">
                <div className="container promo-content">
                    <div className="promo-text">
                        <span className="promo-tag">{branding.promoTag}</span>
                        <h2>{branding.promoTitle}</h2>
                        <p>{branding.promoDesc}</p>
                        <Link to="/products" className="btn btn-primary btn-lg">{branding.promoButtonText} <ArrowRight size={18} /></Link>
                    </div>
                    <div className="promo-image-wrapper">
                        <img src={branding.promoImage} alt="Promotional banner" className="promo-image" />
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="testimonials section">
                <div className="container">
                    <h2 className="section-title">{branding.testimonialsSectionTitle}</h2>
                    <p className="section-subtitle">{branding.testimonialsSectionSubtitle}</p>
                    <div className="testimonials-grid">
                        {activeTestimonials.map((t) => (
                            <div className="testimonial-card" key={t.id}>
                                <div className="testimonial-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < t.rating ? '#f59e0b' : 'none'} color={i < t.rating ? '#f59e0b' : '#d1d5db'} />
                                    ))}
                                </div>
                                <p className="testimonial-text">{t.text}</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{(t.name || '').charAt(0)}</div>
                                    <div><h4>{t.name}</h4><span>{t.role}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FAQ ACCORDION SECTION ===== */}
            <section className="faq-section section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">{branding.faqTitle || 'Frequently Asked Questions'}</h2>
                        <p className="section-subtitle">{branding.faqSubtitle || 'Find answers to common inquiries about our store'}</p>
                    </div>
                    <div className="faq-accordion-wrapper">
                        {[
                            { q: branding.faqOneQ, a: branding.faqOneA },
                            { q: branding.faqTwoQ, a: branding.faqTwoA },
                            { q: branding.faqThreeQ, a: branding.faqThreeA },
                            { q: branding.faqFourQ, a: branding.faqFourA }
                        ].map((faq, idx) => (
                            <div key={idx} className={`faq-item ${activeFaq === idx ? 'faq-item-active' : ''}`}>
                                <button className="faq-question-btn" onClick={() => toggleFaq(idx)}>
                                    <span>{faq.q}</span>
                                    <ChevronDown size={18} className="faq-chevron" />
                                </button>
                                <div className="faq-answer-container">
                                    <div className="faq-answer-content">
                                        <p>{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== COMMUNITY SOCIAL FEED SECTION ===== */}
            <section className="social-feed section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">{branding.socialTitle || 'Join Our Community'}</h2>
                        <p className="section-subtitle">{branding.socialSubtitle || 'Follow us on social media and tag @FlexiCommerce to get featured!'}</p>
                    </div>
                    <div className="social-feed-grid">
                        {[
                            branding.socialImageOne || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop',
                            branding.socialImageTwo || 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop',
                            branding.socialImageThree || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop',
                            branding.socialImageFour || 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=400&h=400&fit=crop'
                        ].map((imgUrl, idx) => (
                            <div key={idx} className="social-feed-card">
                                <img src={imgUrl} alt={`Community look ${idx + 1}`} className="social-feed-img" />
                                <div className="social-feed-overlay">
                                    <span className="social-handle">{branding.socialHoverText || '@FlexiCommerce'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== NEWSLETTER ===== */}
            <section className="newsletter section">
                <div className="container">
                    <div className="newsletter-card">
                        <h2>{branding.newsletterTitle}</h2>
                        <p>{branding.newsletterSubtitle}</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Enter your email address" required />
                            <button type="submit" className="btn btn-primary">{branding.newsletterBtnText}</button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Landing;
