import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Paintbrush, Save, RotateCcw, ChevronDown, Upload, CheckCircle,
  Palette, Home, SwatchBook, Type, BarChart3, Layers, Star, Mail, Megaphone, ShoppingBag, ShoppingCart, ClipboardList,
  CreditCard, LogIn, UserPlus, Menu, Truck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminCustomization.css';

const API = (import.meta.env.VITE_API_URL || '/api') + '/branding';

const FONTS = ['Poppins','Inter','Roboto','Outfit','Nunito','Lato','Montserrat','Raleway','Open Sans','DM Sans','Plus Jakarta Sans','Quicksand','Figtree'];

const DEFAULTS = {
  colorPrimary:'#2563eb', colorSecondary:'#7c3aed', colorAccent:'#10b981',
  colorBackground:'#ffffff', colorText:'#111827', colorButton:'#2563eb',
  fontHeading:'Poppins', fontBody:'Poppins', fontSizeBase:'16px',
  appNamePart1:'Flexi', appNamePart2:'Commerce', mailName:'FlexiCommerce', faviconUrl:'', logoUrl:'',
  navbarHomeLabel:'Home', navbarProductsLabel:'Products', navbarOrdersLabel:'My Orders', navbarContactLabel:'Contact',
  heroSlides:[
    { image:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=700&fit=crop', tag:'Premium Shopping Experience', title:'Discover Products That', highlight:'Define Your Style', subtitle:'Explore our curated collection of premium electronics, fashion, and accessories.' },
    { image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=700&fit=crop', tag:'New Arrivals', title:'Elevate Your Wardrobe With', highlight:'Trending Fashion', subtitle:'Shop the latest trends in fashion. From casual wear to premium accessories.' },
    { image:'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=700&fit=crop', tag:'Tech Deals', title:'Cutting-Edge', highlight:'Electronics & Gadgets', subtitle:'Get up to 40% off on top-brand electronics. Headphones, laptops, smartwatches.' },
    { image:'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=700&fit=crop', tag:'Best Sellers', title:'Shop Our Most', highlight:'Popular Products', subtitle:'Thousands of customers love these picks. Browse our bestselling collection.' },
  ],
  statOneNumber:'10K+', statOneLabel:'Happy Customers',
  statTwoNumber:'500+', statTwoLabel:'Premium Products',
  statThreeNumber:'99%', statThreeLabel:'Satisfaction Rate',
  featureOneTitle:'Free Shipping', featureOneDesc:'Free delivery on orders above Rs. 999',
  featureTwoTitle:'Secure Payments', featureTwoDesc:'100% secure payment processing',
  featureThreeTitle:'Easy Returns', featureThreeDesc:'30-day hassle-free return policy',
  categoriesSectionTitle:'Shop by Category', categoriesSectionSubtitle:'Browse our wide range of product categories',
  featuredSectionTitle:'Featured Products', featuredSectionSubtitle:'Handpicked premium products just for you',
  promoTag:'Limited Time Offer', promoTitle:'Up to 40% Off on Electronics',
  promoDesc:'Grab the best deals on top-brand electronics. Premium quality, unbeatable prices.',
  promoButtonText:'Shop the Sale', promoImage:'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&h=400&fit=crop',
  testimonialsSectionTitle:'What Our Customers Say', testimonialsSectionSubtitle:'Real reviews from real customers',
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
  newsletterTitle:'Shop with Confidence', newsletterSubtitle:'Enjoy secure shopping with 30-day hassle-free returns, free delivery over Rs. 999, and 24/7 dedicated support.', newsletterBtnText:'',

  valPropTitle: 'Why Choose Us',
  valPropSubtitle: 'We focus on customer happiness and top quality.',
  valPropOneTitle: 'Premium Quality',
  valPropOneDesc: 'We source only from top verified suppliers.',
  valPropTwoTitle: 'Secure Payments',
  valPropTwoDesc: 'Your transaction info is 100% encrypted.',
  valPropThreeTitle: 'Fast Delivery',
  valPropThreeDesc: 'Reliable doorstep shipping within 2-3 business days.',
  valPropFourTitle: '24/7 Priority Support',
  valPropFourDesc: 'Our helpdesk is always active to assist you.',

  howTitle: 'Simple & Secure Shopping',
  howSubtitle: 'Get your favorite items delivered to your doorstep in three easy steps.',
  howStepOneTitle: '1. Select Your Products',
  howStepOneDesc: 'Browse our extensive catalog and add premium items to your shopping cart.',
  howStepTwoTitle: '2. Safe Checkout',
  howStepTwoDesc: 'Complete your purchase securely using Credit Cards, UPI, or Cash on Delivery.',
  howStepThreeTitle: '3. Secure Payment & Delivery',
  howStepThreeDesc: 'Complete your payment securely and get your products delivered safely to your doorstep.',

  faqTitle: 'Frequently Asked Questions',
  faqSubtitle: 'Find answers to common inquiries about our store',
  faqOneQ: 'What is your shipping policy?',
  faqOneA: 'We offer free delivery for orders above Rs. 999. Deliveries generally take 2-4 business days.',
  faqTwoQ: 'How do I track my orders?',
  faqTwoA: 'You can view and track all your orders in depth on the My Orders page under your profile.',
  faqThreeQ: 'What payment methods do you support?',
  faqThreeA: 'We support Cash on Delivery (COD) as well as online payments including Credit Cards and UPI.',
  faqFourQ: 'Is there a returns policy?',
  faqFourA: 'Yes, we have a 30-day hassle-free returns policy. Items must be returned in their original packaging.',

  socialTitle: 'Join Our Community',
  socialSubtitle: 'Follow us on social media and tag @FlexiCommerce to get featured on our website!',
  socialHoverText: '@FlexiCommerce',
  socialImageOne: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop',
  socialImageTwo: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop',
  socialImageThree: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop',
  socialImageFour: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=400&h=400&fit=crop',
  
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
  
  contactPageTitle: 'Contact Us',
  contactPageSubtitle: "We'd love to hear from you. Get in touch with us.",
  contactPhoneTitle: 'Phone',
  contactPhoneValue: '+91 9003948329',
  contactPhoneSubtext: 'Mon-Sat, 9AM-8PM',
  contactAddressTitle: 'Address',
  contactAddressValue: 'Kanagapuram, Vellode',
  contactAddressSubtext: 'Erode - 638112',
  contactPersonTitle: 'Contact Person',
  contactPersonValue: 'MohanRaja V',
  contactPersonSubtext: 'Owner & Founder',
  contactHoursTitle: 'Business Hours',
  contactHoursValue: 'Mon - Sat',
  contactHoursSubtext: '9:00 AM - 8:00 PM',
  contactFormTitle: 'Send us a Message',
  contactFormDesc: "Fill out the form below and we'll get back to you as soon as possible.",
  contactFormBtnText: 'Send Message',
  contactMapTitle: 'Find Us',
  contactMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3913.5!2d77.7!3d11.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDIxJzAwLjAiTiA3N8KwNDInMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin',

  cartPageTitle: 'Shopping Cart',
  cartPageSubtitle: 'Review your selected items',
  cartEmptyTitle: 'Your cart is empty',
  cartEmptyDesc: "Looks like you haven't added anything to your cart yet.",
  cartEmptyBtnText: 'Continue Shopping',
  cartSectionHeader: 'Cart Items',
  cartClearBtnText: 'Clear Cart',
  cartSummaryTitle: 'Order Summary',
  cartSummarySubtotalLabel: 'Subtotal',
  cartSummaryShippingLabel: 'Shipping',
  cartSummaryFreeShippingNote: 'You qualify for free shipping!',
  cartSummaryTotalLabel: 'Total',
  cartCheckoutBtnText: 'Proceed to Checkout',
  cartContinueShoppingText: 'Continue Shopping',

  ordersPageTitle: 'My Orders',
  ordersPageSubtitle: 'Track all your placed orders in one place',
  ordersSummaryTotalLabel: 'Total Orders',
  ordersSummaryProgressLabel: 'In Progress',
  ordersSummaryDeliveredLabel: 'Delivered',
  ordersTableHeaderTitle: 'Recent Orders',
  ordersEmptyTitle: 'No orders yet',
  ordersEmptyDesc: 'You have not placed any order yet.',
  ordersEmptyBtnText: 'Start Shopping',

  checkoutPageTitle: 'Checkout',
  checkoutPageSubtitle: 'Delivery details and payment',
  checkoutDeliveryAddressTitle: 'Delivery Address',
  checkoutPaymentMethodTitle: 'Payment Method',
  checkoutPaymentCodText: 'Cash on Delivery',
  checkoutPaymentOnlineText: 'Online Payment (Razorpay Test)',
  checkoutOnlinePaymentNote: 'Razorpay test mode payment. Use test details on popup.',
  checkoutOnlinePaymentBtn: 'Proceed to Razorpay (Test)',
  checkoutOnlinePaymentBtnPaid: 'Payment Completed',
  checkoutOnlinePaymentBtnOpening: 'Opening Razorpay...',
  checkoutSummaryTitle: 'Order Summary',
  checkoutSummaryItemsLabel: 'Items',
  checkoutSummarySubtotalLabel: 'Subtotal',
  checkoutSummaryShippingLabel: 'Shipping',
  checkoutSummaryTotalLabel: 'Total',
  checkoutPlaceOrderBtn: 'Place Order',
  checkoutPlaceOrderBtnPlacing: 'Placing Order...',
  checkoutBackToCartText: 'Back to Cart',
  checkoutSuccessTitle: 'Order Placed Successfully!',
  checkoutSuccessDesc: 'Thank you for shopping with us. Your order has been received and is being processed.',
  checkoutSuccessBtnText: 'View My Orders',

  loginPageTitle: 'Welcome Back',
  loginPageSubtitle: 'Sign in to your account to continue',
  loginEmailLabel: 'Email Address',
  loginPasswordLabel: 'Password',
  loginRememberMeLabel: 'Remember me',
  loginForgotPasswordLabel: 'Forgot Password?',
  loginSignInBtn: 'Sign In',
  loginSignInBtnLoading: 'Signing In...',
  loginCreateAccountPrompt: "Don't have an account?",
  loginCreateAccountLink: 'Create Account',

  signupPageTitle: 'Create Account',
  signupPageSubtitle: 'Join Flexi Commerce and start shopping',
  signupNameLabel: 'Full Name',
  signupEmailLabel: 'Email Address',
  signupPasswordLabel: 'Password',
  signupConfirmPasswordLabel: 'Confirm Password',
  signupTermsLabel: 'I agree to the Terms of Service and Privacy Policy',
  signupSubmitBtn: 'Create Account',
  signupSubmitBtnLoading: 'Creating Account...',
  signupSignInPrompt: 'Already have an account?',
  signupSignInLink: 'Sign In',

  footerDesc: 'Your one-stop destination for premium products at unbeatable prices. We deliver quality, style, and value right to your doorstep.',
  footerCopyright: '© 2026 Flexi Commerce. All rights reserved.',
  shippingFee: 99,
  freeShippingThreshold: 999,
};

/* ── Toast ── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`cp-toast ${type}`}>
      {type === 'success' && <CheckCircle size={16} />}
      <span>{msg}</span>
      <button className="cp-toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

/* ── Color Field ── */
function ColorField({ label, fieldKey, value, savedValue, onChange }) {
  const [hex, setHex] = useState(value);
  useEffect(() => setHex(value), [value]);
  const commit = v => {
    const c = v.startsWith('#') ? v : '#' + v;
    setHex(c);
    if (/^#[0-9a-fA-F]{6}$/.test(c)) onChange(fieldKey, c);
  };
  return (
    <div className="cp-color-field">
      <label>{label}</label>
      <div className="cp-color-row">
        <div className="cp-color-swatch" style={{ background: hex }}>
          <input
            type="color"
            value={hex}
            onChange={e => { setHex(e.target.value); onChange(fieldKey, e.target.value); }}
          />
        </div>
        <input
          className="cp-color-hex"
          value={hex}
          onChange={e => setHex(e.target.value)}
          onBlur={e => commit(e.target.value)}
          maxLength={7}
        />
      </div>
      <div className="cp-color-live-row">
        <span className="cp-color-live-dot" style={{ background: savedValue }} />
        <span className="cp-color-live-text">Live: {savedValue}</span>
      </div>
    </div>
  );
}

/* ── Image Upload ── */
function ImageUpload({ label, fieldKey, value, onChange, hint }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const handle = file => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => onChange(fieldKey, e.target.result);
    r.readAsDataURL(file);
  };
  return (
    <div className="cp-field">
      <label>{label}{hint && <span className="cp-field-hint">{hint}</span>}</label>
      <div className={`cp-upload-zone ${drag ? 'drag' : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => ref.current.click()}
      >
        <input ref={ref} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handle(e.target.files[0])} />
        <div className="cp-upload-icon"><Upload size={22} /></div>
        <strong>Click or drag to upload</strong>
        <p>PNG, JPG, WEBP — max 5 MB</p>
        {value && <img src={value} alt="preview" className="cp-upload-preview-img" />}
      </div>
      {value && (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="cp-upload-current">Image uploaded</span>
          <button className="cp-upload-remove" onClick={() => onChange(fieldKey, '')}>Remove</button>
        </div>
      )}
    </div>
  );
}

/* ── Text Field ── */
function Field({ label, fieldKey, value, onChange, type='text', hint, rows=2 }) {
  return (
    <div className="cp-field">
      <label>{label}{hint && <span className="cp-field-hint">{hint}</span>}</label>
      {type === 'textarea'
        ? <textarea className="cp-textarea" rows={rows} value={value||''} onChange={e => onChange(fieldKey, e.target.value)} />
        : <input className="cp-input" type={type} value={value||''} onChange={e => onChange(fieldKey, e.target.value)} />
      }
    </div>
  );
}

/* ── Slide Editor Item ── */
function SlideItem({ slide, index, onChange }) {
  const [open, setOpen] = useState(index === 0);
  const ref = useRef();
  const upd = (k, v) => onChange(index, k, v);
  const handleFile = file => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => upd('image', e.target.result);
    r.readAsDataURL(file);
  };
  return (
    <div className="cp-slide-item">
      <div className="cp-slide-header" onClick={() => setOpen(o => !o)}>
        <div className="cp-slide-header-left">
          <span className="cp-slide-number">{index + 1}</span>
          <span className="cp-slide-label">Slide {index + 1}</span>
          <span className="cp-slide-tag">{slide.tag || '(no tag)'}</span>
        </div>
        <ChevronDown size={16} className={`cp-slide-toggle ${open ? 'open' : ''}`} />
      </div>
      {open && (
        <div className="cp-slide-body">
          <div className="cp-field">
            <label>Background Image</label>
            {/* When image exists: full-ratio preview with hover overlay to re-upload */}
            {slide.image ? (
              <>
                <div className="cp-slide-img-preview-wrap">
                  <img src={slide.image} alt={`Slide ${index + 1} background`} />
                  <div className="cp-slide-img-overlay" onClick={() => ref.current.click()}>
                    <Upload size={20} />
                    <span>Click to change image</span>
                  </div>
                  <input ref={ref} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
                </div>
                <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'center' }}>
                  <input className="cp-input" style={{ flex:1, fontSize:'0.813rem' }} value={slide.image} onChange={e => upd('image', e.target.value)} placeholder="Or paste image URL" />
                  <button className="cp-upload-remove" style={{ marginTop:0, whiteSpace:'nowrap' }} onClick={() => upd('image', '')}>Remove</button>
                </div>
              </>
            ) : (
              /* When no image: show upload dropzone */
              <>
                <div className="cp-upload-zone"
                  onDragOver={e => { e.preventDefault(); }}
                  onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => ref.current.click()}
                >
                  <input ref={ref} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
                  <div className="cp-upload-icon"><Upload size={22} /></div>
                  <strong>Click or drag to upload slide image</strong>
                  <p>PNG, JPG, WEBP — Recommended 1200×700px</p>
                </div>
                <input className="cp-input" style={{ marginTop:8, fontSize:'0.813rem' }} value={slide.image} onChange={e => upd('image', e.target.value)} placeholder="Or paste image URL here" />
              </>
            )}
          </div>
          <div className="cp-grid-2">
            <div className="cp-field"><label>Slide Tag / Label</label><input className="cp-input" value={slide.tag||''} onChange={e => upd('tag', e.target.value)} placeholder="e.g. New Arrivals" /></div>
            <div className="cp-field"><label>Highlighted Word(s)</label><input className="cp-input" value={slide.highlight||''} onChange={e => upd('highlight', e.target.value)} placeholder="Shown in brand color" /></div>
          </div>
          <div className="cp-field"><label>Slide Title (before highlight)</label><input className="cp-input" value={slide.title||''} onChange={e => upd('title', e.target.value)} placeholder="e.g. Discover Products That" /></div>
          <div className="cp-field"><label>Slide Subtitle / Description</label><textarea className="cp-textarea" rows={2} value={slide.subtitle||''} onChange={e => upd('subtitle', e.target.value)} /></div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function AdminCustomization() {
  const { token } = useAuth();
  const authHeader = token ? `Bearer ${token}` : '';
  const [s, setS]           = useState(DEFAULTS);
  const [saved, setSaved]   = useState(DEFAULTS);
  const [tab, setTab]       = useState('theme');
  const [dirty, setDirty]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState(null);

  const showToast = useCallback((msg, type='success') => setToast({ msg, type }), []);

  useEffect(() => {
    fetch(API).then(r => r.json()).then(d => {
      const merged = { ...DEFAULTS, ...d };
      setS(merged); setSaved(merged); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const upd = useCallback((k, v) => { setS(p => ({ ...p, [k]: v })); setDirty(true); }, []);

  const updSlide = useCallback((idx, key, val) => {
    setS(p => {
      const slides = [...(p.heroSlides || [])];
      slides[idx] = { ...slides[idx], [key]: val };
      return { ...p, heroSlides: slides };
    });
    setDirty(true);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify(s),
      });
      let d = {};
      try {
        d = await res.json();
      } catch (err) {
        throw new Error(`Server returned invalid response (Status ${res.status})`);
      }
      if (!res.ok) throw new Error(d.message || `Server error (Status ${res.status})`);
      const merged = { ...DEFAULTS, ...d.settings };
      setS(merged); setSaved(merged); setDirty(false);
      applyTheme(merged);
      showToast('Changes saved and applied to website!');
    } catch(e) { showToast(e.message || 'Save failed', 'error'); }
    setSaving(false);
  };

  const reset = async () => {
    if (!window.confirm('Reset all settings to factory defaults?')) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/reset`, { method:'POST', headers:{ 'Authorization': authHeader } });
      let d = {};
      try {
        d = await res.json();
      } catch (err) {
        throw new Error(`Server returned invalid response (Status ${res.status})`);
      }
      if (!res.ok) throw new Error(d.message || `Server error (Status ${res.status})`);
      const merged = { ...DEFAULTS, ...d.settings };
      setS(merged); setSaved(merged); setDirty(false);
      applyTheme(merged);
      showToast('Reset to defaults');
    } catch(e) { showToast(e.message||'Reset failed','error'); }
    setSaving(false);
  };

  function applyTheme(cfg) {
    const r = document.documentElement;
    r.style.setProperty('--brand-primary', cfg.colorPrimary);
    r.style.setProperty('--brand-secondary', cfg.colorSecondary);
    r.style.setProperty('--brand-accent', cfg.colorAccent);
    r.style.setProperty('--brand-bg', cfg.colorBackground);
    r.style.setProperty('--brand-text', cfg.colorText);
    r.style.setProperty('--brand-button', cfg.colorButton);
  }

  if (loading) return <div style={{ padding:60, textAlign:'center', color:'var(--gray-400)' }}>Loading settings…</div>;

  return (
    <div className="cp-page">
      {/* ── Top Bar ── */}
      <div className="cp-topbar">
        <div>
          <div className="cp-topbar-title"><Paintbrush size={22} />Customization</div>
          <div className="cp-topbar-sub">White-label branding &amp; homepage content management</div>
        </div>
        <div className="cp-topbar-actions">
          {dirty && <span className="cp-unsaved-badge"><span className="cp-unsaved-dot" />Unsaved changes</span>}
          <button className="cp-btn cp-btn-outline" onClick={reset} disabled={saving}><RotateCcw size={14} />Reset Defaults</button>
          <button className="cp-btn cp-btn-save" onClick={save} disabled={saving}>
            <Save size={14} />{saving ? 'Saving…' : 'Save & Apply'}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="cp-tabs">
        <button className={`cp-tab ${tab === 'theme' ? 'active' : ''}`} onClick={() => setTab('theme')}>
          <Palette size={16} />
          Website Theme
        </button>
        <button className={`cp-tab ${tab === 'navbar' ? 'active' : ''}`} onClick={() => setTab('navbar')}>
          <Menu size={16} />
          Navbar Settings
        </button>
        <button className={`cp-tab ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
          <Home size={16} />
          Home Page
        </button>
        <button className={`cp-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          <ShoppingBag size={16} />
          Products Page
        </button>
        <button className={`cp-tab ${tab === 'contact' ? 'active' : ''}`} onClick={() => setTab('contact')}>
          <Mail size={16} />
          Contact Page
        </button>
        <button className={`cp-tab ${tab === 'cart' ? 'active' : ''}`} onClick={() => setTab('cart')}>
          <ShoppingCart size={16} />
          Cart Page
        </button>
        <button className={`cp-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          <ClipboardList size={16} />
          My Orders Page
        </button>
        <button className={`cp-tab ${tab === 'checkout' ? 'active' : ''}`} onClick={() => setTab('checkout')}>
          <CreditCard size={16} />
          Checkout Page
        </button>
        <button className={`cp-tab ${tab === 'shipping' ? 'active' : ''}`} onClick={() => setTab('shipping')}>
          <Truck size={16} />
          Shipping Fee
        </button>
        <button className={`cp-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
          <LogIn size={16} />
          Login Page
        </button>
        <button className={`cp-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>
          <UserPlus size={16} />
          Signup Page
        </button>
        <button className={`cp-tab ${tab === 'footer' ? 'active' : ''}`} onClick={() => setTab('footer')}>
          <Layers size={16} />
          Footer Content
        </button>
      </div>

      {/* ══ TAB: WEBSITE THEME ══ */}
      {tab === 'theme' && (
        <div className="cp-section">
          {/* Live preview bar */}
          <div className="cp-theme-preview">
            <span className="cp-theme-preview-label">Currently Live:</span>
            {[['Primary',saved.colorPrimary],['Secondary',saved.colorSecondary],['Accent',saved.colorAccent],
              ['BG',saved.colorBackground],['Text',saved.colorText],['Button',saved.colorButton]].map(([l,v]) => (
              <span key={l} className="cp-theme-swatch" style={{ background:v }} title={`${l}: ${v}`} />
            ))}
            <span className="cp-theme-font-badge">{saved.fontBody}</span>
            <span className="cp-theme-font-badge">{saved.fontSizeBase}</span>
          </div>

          {/* Colors */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Brand Colors</h3>
              <p>These colors are applied globally across the entire website. Changes take effect immediately after saving.</p>
            </div>
            <div className="cp-grid-2">
              <ColorField label="Primary Color"    fieldKey="colorPrimary"    value={s.colorPrimary}    savedValue={saved.colorPrimary}    onChange={upd} />
              <ColorField label="Secondary Color"  fieldKey="colorSecondary"  value={s.colorSecondary}  savedValue={saved.colorSecondary}  onChange={upd} />
              <ColorField label="Accent Color"     fieldKey="colorAccent"     value={s.colorAccent}     savedValue={saved.colorAccent}     onChange={upd} />
              <ColorField label="Background Color" fieldKey="colorBackground" value={s.colorBackground} savedValue={saved.colorBackground} onChange={upd} />
              <ColorField label="Text Color"       fieldKey="colorText"       value={s.colorText}       savedValue={saved.colorText}       onChange={upd} />
              <ColorField label="Button Color"     fieldKey="colorButton"     value={s.colorButton}     savedValue={saved.colorButton}     onChange={upd} />
            </div>
          </div>

          {/* General Branding */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>General Branding</h3>
              <p>Customize the logo texts and the website favicon url.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="App Name Part 1" fieldKey="appNamePart1" value={s.appNamePart1} onChange={upd} />
              <Field label="App Name Part 2" fieldKey="appNamePart2" value={s.appNamePart2} onChange={upd} />
              <Field label="Favicon URL" fieldKey="faviconUrl" value={s.faviconUrl} onChange={upd} />
              <Field label="Mail Sender Name" fieldKey="mailName" value={s.mailName} onChange={upd} hint="Sender name for transactional emails" />
            </div>
          </div>

          {/* Typography */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Typography</h3>
              <p>Control the fonts and base font size used throughout the website.</p>
            </div>
            <div className="cp-grid-3">
              <div className="cp-field">
                <label>Heading Font</label>
                <select className="cp-select" value={s.fontHeading} onChange={e => upd('fontHeading', e.target.value)}>
                  {FONTS.map(f => <option key={f}>{f}</option>)}
                </select>
                <div className="cp-font-preview" style={{ fontFamily: s.fontHeading, fontWeight:700, fontSize:'1.1rem' }}>
                  Aa — The Quick Brown Fox
                </div>
              </div>
              <div className="cp-field">
                <label>Body Font</label>
                <select className="cp-select" value={s.fontBody} onChange={e => upd('fontBody', e.target.value)}>
                  {FONTS.map(f => <option key={f}>{f}</option>)}
                </select>
                <div className="cp-font-preview" style={{ fontFamily: s.fontBody }}>
                  Aa — The quick brown fox jumps
                </div>
              </div>
              <div className="cp-field">
                <label>Base Font Size <span className="cp-field-hint">e.g. 14px, 16px, 18px</span></label>
                <input className="cp-input" value={s.fontSizeBase} onChange={e => upd('fontSizeBase', e.target.value)} placeholder="16px" />
                <div className="cp-font-preview" style={{ fontSize: s.fontSizeBase }}>
                  Sample text at {s.fontSizeBase}
                </div>
              </div>
            </div>
            <link href={`https://fonts.googleapis.com/css2?family=${s.fontHeading.replace(/ /g,'+')}:wght@400;700&family=${s.fontBody.replace(/ /g,'+')}:wght@400;500&display=swap`} rel="stylesheet" />
          </div>
        </div>
      )}

      {/* ══ TAB: NAVBAR SETTINGS ══ */}
      {tab === 'navbar' && (
        <div className="cp-section">
          {/* 1. Navbar Logo Image & Brand Text */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Navbar Brand Logo</h3>
              <p>Customize the logo image and text shown on the left of the navigation bar.</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <ImageUpload label="Upload Logo Image" fieldKey="logoUrl" value={s.logoUrl} onChange={upd} hint="Circular brand logo" />
            </div>
            <div className="cp-grid-2">
              <Field label="Logo Part 1 (Blue)" fieldKey="appNamePart1" value={s.appNamePart1} onChange={upd} hint="e.g. Flexi" />
              <Field label="Logo Part 2 (Dark)" fieldKey="appNamePart2" value={s.appNamePart2} onChange={upd} hint="e.g. Commerce" />
            </div>
          </div>

          {/* 2. Navigation Link Labels */}
          <div className="cp-card" style={{ marginTop: 24 }}>
            <div className="cp-card-header">
              <h3>Navigation Menu Link Labels</h3>
              <p>Customize the display labels for navbar menu items.</p>
            </div>
            <div className="cp-grid-2" style={{ marginBottom: 16 }}>
              <Field label="Home Link Label" fieldKey="navbarHomeLabel" value={s.navbarHomeLabel} onChange={upd} />
              <Field label="Products Link Label" fieldKey="navbarProductsLabel" value={s.navbarProductsLabel} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-2">
              <Field label="My Orders Link Label" fieldKey="navbarOrdersLabel" value={s.navbarOrdersLabel} onChange={upd} />
              <Field label="Contact Link Label" fieldKey="navbarContactLabel" value={s.navbarContactLabel} onChange={upd} />
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: HOME PAGE ══ */}
      {tab === 'home' && (
        <div className="cp-section">

          {/* 1. Hero Slider */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Hero Slider</h3>
              <p>The full-width image slider shown at the very top of the homepage. Edit each slide below.</p>
            </div>
            <div className="cp-slide-list">
              {(s.heroSlides || []).map((slide, i) => (
                <SlideItem key={i} slide={slide} index={i} onChange={updSlide} />
              ))}
            </div>
          </div>

          {/* 2. Hero Stats Bar */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Stats Bar</h3>
              <p>Three statistics shown at the bottom of the hero section (e.g. "10K+ Happy Customers").</p>
            </div>
            <div className="cp-grid-3">
              <div>
                <div className="cp-grid-2">
                  <Field label="Stat 1 Number" fieldKey="statOneNumber" value={s.statOneNumber} onChange={upd} />
                  <Field label="Stat 1 Label"  fieldKey="statOneLabel"  value={s.statOneLabel}  onChange={upd} />
                </div>
              </div>
              <div>
                <div className="cp-grid-2">
                  <Field label="Stat 2 Number" fieldKey="statTwoNumber" value={s.statTwoNumber} onChange={upd} />
                  <Field label="Stat 2 Label"  fieldKey="statTwoLabel"  value={s.statTwoLabel}  onChange={upd} />
                </div>
              </div>
              <div>
                <div className="cp-grid-2">
                  <Field label="Stat 3 Number" fieldKey="statThreeNumber" value={s.statThreeNumber} onChange={upd} />
                  <Field label="Stat 3 Label"  fieldKey="statThreeLabel"  value={s.statThreeLabel}  onChange={upd} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Features Strip */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Features Strip</h3>
              <p>Three trust badges shown below the hero slider (Free Shipping, Secure Payments, Easy Returns).</p>
            </div>
            <div className="cp-grid-3">
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <Field label="Feature 1 Title" fieldKey="featureOneTitle" value={s.featureOneTitle} onChange={upd} />
                <Field label="Feature 1 Description" fieldKey="featureOneDesc" value={s.featureOneDesc} onChange={upd} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <Field label="Feature 2 Title" fieldKey="featureTwoTitle" value={s.featureTwoTitle} onChange={upd} />
                <Field label="Feature 2 Description" fieldKey="featureTwoDesc" value={s.featureTwoDesc} onChange={upd} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <Field label="Feature 3 Title" fieldKey="featureThreeTitle" value={s.featureThreeTitle} onChange={upd} />
                <Field label="Feature 3 Description" fieldKey="featureThreeDesc" value={s.featureThreeDesc} onChange={upd} />
              </div>
            </div>
          </div>

          {/* 4. Categories Section */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Shop by Category Section</h3>
              <p>The section heading and subtitle shown above the category grid. Categories themselves are managed in the Categories module.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Section Title"    fieldKey="categoriesSectionTitle"    value={s.categoriesSectionTitle}    onChange={upd} />
              <Field label="Section Subtitle" fieldKey="categoriesSectionSubtitle" value={s.categoriesSectionSubtitle} onChange={upd} />
            </div>
          </div>

          {/* 5. Featured Products */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Featured Products Section</h3>
              <p>The heading and subtitle above the featured products grid. Products are sourced automatically from your product catalog.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Section Title"    fieldKey="featuredSectionTitle"    value={s.featuredSectionTitle}    onChange={upd} />
              <Field label="Section Subtitle" fieldKey="featuredSectionSubtitle" value={s.featuredSectionSubtitle} onChange={upd} />
            </div>
          </div>

          {/* 6. Promo Banner */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Promotional Banner</h3>
              <p>A full-width banner section with a tagline, headline, description, button, and image — used for featured promotions or sales.</p>
            </div>
            <div className="cp-grid-2" style={{ marginBottom:16 }}>
              <Field label="Banner Tag / Label"       fieldKey="promoTag"        value={s.promoTag}        onChange={upd} hint="e.g. Limited Time Offer" />
              <Field label="Button Text"              fieldKey="promoButtonText" value={s.promoButtonText} onChange={upd} />
              <Field label="Banner Headline"          fieldKey="promoTitle"      value={s.promoTitle}      onChange={upd} />
            </div>
            <Field label="Banner Description" fieldKey="promoDesc" value={s.promoDesc} onChange={upd} type="textarea" rows={3} />
            <hr className="cp-card-divider" />
            <ImageUpload label="Banner Image" fieldKey="promoImage" value={s.promoImage} onChange={upd} hint="Recommended 500×400px" />
          </div>

          {/* 7. Testimonials */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Testimonials Section</h3>
              <p>Customize the section headings and individual review cards.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Section Title"    fieldKey="testimonialsSectionTitle"    value={s.testimonialsSectionTitle}    onChange={upd} />
              <Field label="Section Subtitle" fieldKey="testimonialsSectionSubtitle" value={s.testimonialsSectionSubtitle} onChange={upd} />
            </div>

            <hr className="cp-card-divider" />
            <h4 style={{ marginBottom: 12, color: '#1e293b' }}>Review Card 1</h4>
            <div className="cp-grid-3" style={{ marginBottom: 12 }}>
              <Field label="Author Name" fieldKey="testimonialOneName" value={s.testimonialOneName} onChange={upd} />
              <Field label="Author Role" fieldKey="testimonialOneRole" value={s.testimonialOneRole} onChange={upd} />
              <Field label="Rating (1-5 Stars)" fieldKey="testimonialOneStars" value={s.testimonialOneStars} onChange={upd} type="number" />
            </div>
            <Field label="Review Content" fieldKey="testimonialOneText" value={s.testimonialOneText} onChange={upd} type="textarea" rows={2} />

            <hr className="cp-card-divider" />
            <h4 style={{ marginBottom: 12, color: '#1e293b' }}>Review Card 2</h4>
            <div className="cp-grid-3" style={{ marginBottom: 12 }}>
              <Field label="Author Name" fieldKey="testimonialTwoName" value={s.testimonialTwoName} onChange={upd} />
              <Field label="Author Role" fieldKey="testimonialTwoRole" value={s.testimonialTwoRole} onChange={upd} />
              <Field label="Rating (1-5 Stars)" fieldKey="testimonialTwoStars" value={s.testimonialTwoStars} onChange={upd} type="number" />
            </div>
            <Field label="Review Content" fieldKey="testimonialTwoText" value={s.testimonialTwoText} onChange={upd} type="textarea" rows={2} />

            <hr className="cp-card-divider" />
            <h4 style={{ marginBottom: 12, color: '#1e293b' }}>Review Card 3</h4>
            <div className="cp-grid-3" style={{ marginBottom: 12 }}>
              <Field label="Author Name" fieldKey="testimonialThreeName" value={s.testimonialThreeName} onChange={upd} />
              <Field label="Author Role" fieldKey="testimonialThreeRole" value={s.testimonialThreeRole} onChange={upd} />
              <Field label="Rating (1-5 Stars)" fieldKey="testimonialThreeStars" value={s.testimonialThreeStars} onChange={upd} type="number" />
            </div>
            <Field label="Review Content" fieldKey="testimonialThreeText" value={s.testimonialThreeText} onChange={upd} type="textarea" rows={2} />
          </div>

          {/* 8. Static Branding Banner */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Static Branding Banner</h3>
              <p>The static branding card shown near the bottom of the homepage.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Banner Title"    fieldKey="newsletterTitle"    value={s.newsletterTitle}    onChange={upd} />
              <Field label="Banner Subtitle" fieldKey="newsletterSubtitle" value={s.newsletterSubtitle} onChange={upd} />
            </div>
          </div>

          {/* 9. Value Propositions Section */}
          <div className="cp-card" style={{ marginTop: 24 }}>
            <div className="cp-card-header">
              <h3>Value Propositions Section ("Why Choose Us")</h3>
              <p>Customize the heading and 4 value proposition key-value description blocks.</p>
            </div>
            <div className="cp-grid-2" style={{ marginBottom: 16 }}>
              <Field label="Section Title" fieldKey="valPropTitle" value={s.valPropTitle} onChange={upd} />
              <Field label="Section Subtitle" fieldKey="valPropSubtitle" value={s.valPropSubtitle} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-2" style={{ marginBottom: 12 }}>
              <Field label="Proposition 1 Title" fieldKey="valPropOneTitle" value={s.valPropOneTitle} onChange={upd} />
              <Field label="Proposition 1 Description" fieldKey="valPropOneDesc" value={s.valPropOneDesc} onChange={upd} />
            </div>
            <div className="cp-grid-2" style={{ marginBottom: 12 }}>
              <Field label="Proposition 2 Title" fieldKey="valPropTwoTitle" value={s.valPropTwoTitle} onChange={upd} />
              <Field label="Proposition 2 Description" fieldKey="valPropTwoDesc" value={s.valPropTwoDesc} onChange={upd} />
            </div>
            <div className="cp-grid-2" style={{ marginBottom: 12 }}>
              <Field label="Proposition 3 Title" fieldKey="valPropThreeTitle" value={s.valPropThreeTitle} onChange={upd} />
              <Field label="Proposition 3 Description" fieldKey="valPropThreeDesc" value={s.valPropThreeDesc} onChange={upd} />
            </div>
            <div className="cp-grid-2">
              <Field label="Proposition 4 Title" fieldKey="valPropFourTitle" value={s.valPropFourTitle} onChange={upd} />
              <Field label="Proposition 4 Description" fieldKey="valPropFourDesc" value={s.valPropFourDesc} onChange={upd} />
            </div>
          </div>

          {/* 10. How It Works Section */}
          <div className="cp-card" style={{ marginTop: 24 }}>
            <div className="cp-card-header">
              <h3>How It Works Section ("Shopping Steps")</h3>
              <p>Configure a 3-step shopping timeline of titles and descriptions for your shop.</p>
            </div>
            <div className="cp-grid-2" style={{ marginBottom: 16 }}>
              <Field label="Section Title" fieldKey="howTitle" value={s.howTitle} onChange={upd} />
              <Field label="Section Subtitle" fieldKey="howSubtitle" value={s.howSubtitle} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div style={{ marginBottom: 12 }}>
              <h4 style={{ marginBottom: 8, color: '#1e293b' }}>Step 1</h4>
              <Field label="Step 1 Title" fieldKey="howStepOneTitle" value={s.howStepOneTitle} onChange={upd} />
              <Field label="Step 1 Description" fieldKey="howStepOneDesc" value={s.howStepOneDesc} onChange={upd} type="textarea" rows={2} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <h4 style={{ marginBottom: 8, color: '#1e293b' }}>Step 2</h4>
              <Field label="Step 2 Title" fieldKey="howStepTwoTitle" value={s.howStepTwoTitle} onChange={upd} />
              <Field label="Step 2 Description" fieldKey="howStepTwoDesc" value={s.howStepTwoDesc} onChange={upd} type="textarea" rows={2} />
            </div>
            <div>
              <h4 style={{ marginBottom: 8, color: '#1e293b' }}>Step 3</h4>
              <Field label="Step 3 Title" fieldKey="howStepThreeTitle" value={s.howStepThreeTitle} onChange={upd} />
              <Field label="Step 3 Description" fieldKey="howStepThreeDesc" value={s.howStepThreeDesc} onChange={upd} type="textarea" rows={2} />
            </div>
          </div>

          {/* 11. FAQ Accordion Section */}
          <div className="cp-card" style={{ marginTop: 24 }}>
            <div className="cp-card-header">
              <h3>FAQ Accordion Section</h3>
              <p>Configure 4 custom questions and answers for your customers.</p>
            </div>
            <div className="cp-grid-2" style={{ marginBottom: 16 }}>
              <Field label="Section Heading" fieldKey="faqTitle" value={s.faqTitle} onChange={upd} />
              <Field label="Section Subtitle" fieldKey="faqSubtitle" value={s.faqSubtitle} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8, color: '#1e293b' }}>FAQ #1</h4>
              <Field label="Question" fieldKey="faqOneQ" value={s.faqOneQ} onChange={upd} />
              <Field label="Answer" fieldKey="faqOneA" value={s.faqOneA} onChange={upd} type="textarea" rows={2} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8, color: '#1e293b' }}>FAQ #2</h4>
              <Field label="Question" fieldKey="faqTwoQ" value={s.faqTwoQ} onChange={upd} />
              <Field label="Answer" fieldKey="faqTwoA" value={s.faqTwoA} onChange={upd} type="textarea" rows={2} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8, color: '#1e293b' }}>FAQ #3</h4>
              <Field label="Question" fieldKey="faqThreeQ" value={s.faqThreeQ} onChange={upd} />
              <Field label="Answer" fieldKey="faqThreeA" value={s.faqThreeA} onChange={upd} type="textarea" rows={2} />
            </div>
            <div>
              <h4 style={{ marginBottom: 8, color: '#1e293b' }}>FAQ #4</h4>
              <Field label="Question" fieldKey="faqFourQ" value={s.faqFourQ} onChange={upd} />
              <Field label="Answer" fieldKey="faqFourA" value={s.faqFourA} onChange={upd} type="textarea" rows={2} />
            </div>
          </div>

          {/* 12. Community Social Feed Section */}
          <div className="cp-card" style={{ marginTop: 24 }}>
            <div className="cp-card-header">
              <h3>Community Social Feed Section</h3>
              <p>Configure titles and 4 lifestyle images showing your brand community.</p>
            </div>
            <div className="cp-grid-3" style={{ marginBottom: 16 }}>
              <Field label="Section Title" fieldKey="socialTitle" value={s.socialTitle} onChange={upd} />
              <Field label="Section Subtitle" fieldKey="socialSubtitle" value={s.socialSubtitle} onChange={upd} />
              <Field label="Image Hover Text" fieldKey="socialHoverText" value={s.socialHoverText} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-2" style={{ gap: '20px' }}>
              <ImageUpload label="Social Image 1" fieldKey="socialImageOne" value={s.socialImageOne} onChange={upd} />
              <ImageUpload label="Social Image 2" fieldKey="socialImageTwo" value={s.socialImageTwo} onChange={upd} />
              <ImageUpload label="Social Image 3" fieldKey="socialImageThree" value={s.socialImageThree} onChange={upd} />
              <ImageUpload label="Social Image 4" fieldKey="socialImageFour" value={s.socialImageFour} onChange={upd} />
            </div>
          </div>

        </div>
      )}

      {/* ══ TAB: PRODUCTS PAGE ══ */}
      {tab === 'products' && (
        <div className="cp-section">
          {/* 1. Page Header */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Page Header</h3>
              <p>Customize the title and subtitle displayed at the top of the products catalog page.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Page Title" fieldKey="productsPageTitle" value={s.productsPageTitle} onChange={upd} />
              <Field label="Page Subtitle" fieldKey="productsPageSubtitle" value={s.productsPageSubtitle} onChange={upd} />
            </div>
          </div>

          {/* 2. Sidebar Filters */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Sidebar Controls</h3>
              <p>Customize filter and search labels in the sidebar.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Filters Heading" fieldKey="productsSidebarFiltersLabel" value={s.productsSidebarFiltersLabel} onChange={upd} />
              <Field label="Search Input Placeholder" fieldKey="productsSidebarSearchPlaceholder" value={s.productsSidebarSearchPlaceholder} onChange={upd} />
              <Field label="Categories Heading" fieldKey="productsSidebarCategoriesLabel" value={s.productsSidebarCategoriesLabel} onChange={upd} />
              <Field label="Price Range Heading" fieldKey="productsSidebarPriceLabel" value={s.productsSidebarPriceLabel} onChange={upd} />
            </div>
          </div>

          {/* 3. Toolbar & Sorting */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Toolbar &amp; Sorting</h3>
              <p>Customize the layout options at the top of the product grid.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Sort By Label" fieldKey="productsToolbarSortLabel" value={s.productsToolbarSortLabel} onChange={upd} />
              <Field label="Results Count Suffix" fieldKey="productsToolbarResultsSuffix" value={s.productsToolbarResultsSuffix} onChange={upd} hint="e.g. 'products found'" />
            </div>
          </div>

          {/* 4. Empty State */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Empty State Messages</h3>
              <p>Customize what is displayed when no products match the filters.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="No Products Title" fieldKey="productsEmptyTitle" value={s.productsEmptyTitle} onChange={upd} />
              <Field label="No Products Description" fieldKey="productsEmptyDesc" value={s.productsEmptyDesc} onChange={upd} />
              <Field label="Products Coming Soon Description" fieldKey="productsEmptyComingSoon" value={s.productsEmptyComingSoon} onChange={upd} />
            </div>
          </div>

          {/* 5. Product Card & Badges */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Product Card &amp; Actions</h3>
              <p>Customize the labels displayed on product cards.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Free Shipping Badge Text" fieldKey="productsShippingBadgeText" value={s.productsShippingBadgeText} onChange={upd} />
              <Field label="Add to Cart Button Text" fieldKey="productsAddToCartText" value={s.productsAddToCartText} onChange={upd} />
            </div>
          </div>

          {/* 6. Selection Modal */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Selection Options Modal</h3>
              <p>Customize the title and buttons shown when variants, sizes or colors are selected.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="Modal Title" fieldKey="productsModalTitle" value={s.productsModalTitle} onChange={upd} />
              <Field label="Confirm Button Text" fieldKey="productsModalConfirmText" value={s.productsModalConfirmText} onChange={upd} />
              <Field label="Modal Shipping Text" fieldKey="productsModalShippingText" value={s.productsModalShippingText} onChange={upd} />
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: CONTACT PAGE ══ */}
      {tab === 'contact' && (
        <div className="cp-section">
          {/* 1. Page Header */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Page Header</h3>
              <p>Customize the title and subtitle displayed at the top of the contact page.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Page Title" fieldKey="contactPageTitle" value={s.contactPageTitle} onChange={upd} />
              <Field label="Page Subtitle" fieldKey="contactPageSubtitle" value={s.contactPageSubtitle} onChange={upd} />
            </div>
          </div>

          {/* 2. Contact Info Cards */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Contact Info Cards</h3>
              <p>Customize the phone, address, contact person, and business hours card contents.</p>
            </div>
            <div className="cp-grid-3">
              {/* Phone card */}
              <div className="cp-field" style={{ borderRight: '1px solid var(--gray-200)', paddingRight: 16 }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-600)' }}>Phone Card</h4>
                <Field label="Title" fieldKey="contactPhoneTitle" value={s.contactPhoneTitle} onChange={upd} />
                <Field label="Value" fieldKey="contactPhoneValue" value={s.contactPhoneValue} onChange={upd} />
                <Field label="Subtext" fieldKey="contactPhoneSubtext" value={s.contactPhoneSubtext} onChange={upd} />
              </div>
              {/* Address card */}
              <div className="cp-field" style={{ borderRight: '1px solid var(--gray-200)', paddingRight: 16 }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-600)' }}>Address Card</h4>
                <Field label="Title" fieldKey="contactAddressTitle" value={s.contactAddressTitle} onChange={upd} />
                <Field label="Value" fieldKey="contactAddressValue" value={s.contactAddressValue} onChange={upd} />
                <Field label="Subtext" fieldKey="contactAddressSubtext" value={s.contactAddressSubtext} onChange={upd} />
              </div>
              {/* Contact Person card */}
              <div className="cp-field">
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-600)' }}>Contact Person Card</h4>
                <Field label="Title" fieldKey="contactPersonTitle" value={s.contactPersonTitle} onChange={upd} />
                <Field label="Value" fieldKey="contactPersonValue" value={s.contactPersonValue} onChange={upd} />
                <Field label="Subtext" fieldKey="contactPersonSubtext" value={s.contactPersonSubtext} onChange={upd} />
              </div>
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              {/* Business Hours card */}
              <div className="cp-field">
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-600)' }}>Business Hours Card</h4>
                <Field label="Title" fieldKey="contactHoursTitle" value={s.contactHoursTitle} onChange={upd} />
                <Field label="Value" fieldKey="contactHoursValue" value={s.contactHoursValue} onChange={upd} />
                <Field label="Subtext" fieldKey="contactHoursSubtext" value={s.contactHoursSubtext} onChange={upd} />
              </div>
            </div>
          </div>

          {/* 3. Send Message Form */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Send Message Form</h3>
              <p>Customize the heading, description, and button text of the contact form.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="Form Title" fieldKey="contactFormTitle" value={s.contactFormTitle} onChange={upd} />
              <Field label="Form Description" fieldKey="contactFormDesc" value={s.contactFormDesc} onChange={upd} />
              <Field label="Submit Button Text" fieldKey="contactFormBtnText" value={s.contactFormBtnText} onChange={upd} />
            </div>
          </div>

          {/* 4. Map Section */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Google Maps Embed</h3>
              <p>Provide the embed URL for your location (from Google Maps &gt; Share &gt; Embed map &gt; src attribute).</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Map Section Title" fieldKey="contactMapTitle" value={s.contactMapTitle} onChange={upd} />
              <Field label="Embed iframe URL (src)" fieldKey="contactMapEmbedUrl" value={s.contactMapEmbedUrl} onChange={upd} />
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: CART PAGE ══ */}
      {tab === 'cart' && (
        <div className="cp-section">
          {/* 1. Page Header */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Page Header</h3>
              <p>Customize the title and subtitle of the shopping cart page.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Page Title" fieldKey="cartPageTitle" value={s.cartPageTitle} onChange={upd} />
              <Field label="Page Subtitle" fieldKey="cartPageSubtitle" value={s.cartPageSubtitle} onChange={upd} />
            </div>
          </div>

          {/* 2. Empty Cart State */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Empty Cart State</h3>
              <p>Customize labels displayed when the shopping cart has no items.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="Empty Cart Title" fieldKey="cartEmptyTitle" value={s.cartEmptyTitle} onChange={upd} />
              <Field label="Empty Cart Description" fieldKey="cartEmptyDesc" value={s.cartEmptyDesc} onChange={upd} />
              <Field label="Empty Cart Button Text" fieldKey="cartEmptyBtnText" value={s.cartEmptyBtnText} onChange={upd} />
            </div>
          </div>

          {/* 3. Cart Items Section */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Cart Items List Header</h3>
              <p>Customize the header label and clear cart button text above the item list.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Section Header Title" fieldKey="cartSectionHeader" value={s.cartSectionHeader} onChange={upd} />
              <Field label="Clear Cart Button Text" fieldKey="cartClearBtnText" value={s.cartClearBtnText} onChange={upd} />
            </div>
          </div>

          {/* 4. Order Summary Card */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Order Summary Details</h3>
              <p>Customize the labels in the checkout calculation card on the right.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="Summary Card Title" fieldKey="cartSummaryTitle" value={s.cartSummaryTitle} onChange={upd} />
              <Field label="Subtotal Label" fieldKey="cartSummarySubtotalLabel" value={s.cartSummarySubtotalLabel} onChange={upd} />
              <Field label="Shipping Label" fieldKey="cartSummaryShippingLabel" value={s.cartSummaryShippingLabel} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Free Shipping Note" fieldKey="cartSummaryFreeShippingNote" value={s.cartSummaryFreeShippingNote} onChange={upd} />
              <Field label="Total Label" fieldKey="cartSummaryTotalLabel" value={s.cartSummaryTotalLabel} onChange={upd} />
              <Field label="Checkout Button Text" fieldKey="cartCheckoutBtnText" value={s.cartCheckoutBtnText} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-2">
              <Field label="Continue Shopping Link Text" fieldKey="cartContinueShoppingText" value={s.cartContinueShoppingText} onChange={upd} />
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: MY ORDERS PAGE ══ */}
      {tab === 'orders' && (
        <div className="cp-section">
          {/* 1. Page Header */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Page Header</h3>
              <p>Customize the title and subtitle of the orders tracking page.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Page Title" fieldKey="ordersPageTitle" value={s.ordersPageTitle} onChange={upd} />
              <Field label="Page Subtitle" fieldKey="ordersPageSubtitle" value={s.ordersPageSubtitle} onChange={upd} />
            </div>
          </div>

          {/* 2. Orders Summary Cards */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Summary Statistics Badges</h3>
              <p>Customize the labels for the aggregated metrics counters.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="Total Orders Label" fieldKey="ordersSummaryTotalLabel" value={s.ordersSummaryTotalLabel} onChange={upd} />
              <Field label="In Progress Label" fieldKey="ordersSummaryProgressLabel" value={s.ordersSummaryProgressLabel} onChange={upd} />
              <Field label="Delivered Label" fieldKey="ordersSummaryDeliveredLabel" value={s.ordersSummaryDeliveredLabel} onChange={upd} />
            </div>
          </div>

          {/* 3. Table Header & Empty State */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Table Title &amp; Empty State</h3>
              <p>Customize the list header and the display details shown when no orders are found.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="Table Title" fieldKey="ordersTableHeaderTitle" value={s.ordersTableHeaderTitle} onChange={upd} />
              <Field label="Empty State Title" fieldKey="ordersEmptyTitle" value={s.ordersEmptyTitle} onChange={upd} />
              <Field label="Empty State Description" fieldKey="ordersEmptyDesc" value={s.ordersEmptyDesc} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-2">
              <Field label="Empty State Button Text" fieldKey="ordersEmptyBtnText" value={s.ordersEmptyBtnText} onChange={upd} />
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: CHECKOUT PAGE ══ */}
      {tab === 'checkout' && (
        <div className="cp-section">
          {/* 1. Page Header */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Page Header</h3>
              <p>Customize the title and subtitle of the checkout page.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Page Title" fieldKey="checkoutPageTitle" value={s.checkoutPageTitle} onChange={upd} />
              <Field label="Page Subtitle" fieldKey="checkoutPageSubtitle" value={s.checkoutPageSubtitle} onChange={upd} />
            </div>
          </div>

          {/* 2. Billing & Payment Headers */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Section Headings &amp; Payment Options</h3>
              <p>Customize sub-section headings and payment labels.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="Delivery Address Title" fieldKey="checkoutDeliveryAddressTitle" value={s.checkoutDeliveryAddressTitle} onChange={upd} />
              <Field label="Payment Method Title" fieldKey="checkoutPaymentMethodTitle" value={s.checkoutPaymentMethodTitle} onChange={upd} />
              <Field label="COD Option Text" fieldKey="checkoutPaymentCodText" value={s.checkoutPaymentCodText} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Online Option Text" fieldKey="checkoutPaymentOnlineText" value={s.checkoutPaymentOnlineText} onChange={upd} />
              <Field label="Online Payment Note" fieldKey="checkoutOnlinePaymentNote" value={s.checkoutOnlinePaymentNote} onChange={upd} />
              <Field label="Proceed Online Btn Text" fieldKey="checkoutOnlinePaymentBtn" value={s.checkoutOnlinePaymentBtn} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Online Paid Text" fieldKey="checkoutOnlinePaymentBtnPaid" value={s.checkoutOnlinePaymentBtnPaid} onChange={upd} />
              <Field label="Online Opening Text" fieldKey="checkoutOnlinePaymentBtnOpening" value={s.checkoutOnlinePaymentBtnOpening} onChange={upd} />
            </div>
          </div>

          {/* 3. Order Summary & Actions */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Summary &amp; Submit Controls</h3>
              <p>Customize the details on the side summary card and action buttons.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="Summary Title" fieldKey="checkoutSummaryTitle" value={s.checkoutSummaryTitle} onChange={upd} />
              <Field label="Items Label" fieldKey="checkoutSummaryItemsLabel" value={s.checkoutSummaryItemsLabel} onChange={upd} />
              <Field label="Subtotal Label" fieldKey="checkoutSummarySubtotalLabel" value={s.checkoutSummarySubtotalLabel} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Shipping Label" fieldKey="checkoutSummaryShippingLabel" value={s.checkoutSummaryShippingLabel} onChange={upd} />
              <Field label="Total Label" fieldKey="checkoutSummaryTotalLabel" value={s.checkoutSummaryTotalLabel} onChange={upd} />
              <Field label="Place Order Btn Text" fieldKey="checkoutPlaceOrderBtn" value={s.checkoutPlaceOrderBtn} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Place Order Btn (Placing)" fieldKey="checkoutPlaceOrderBtnPlacing" value={s.checkoutPlaceOrderBtnPlacing} onChange={upd} />
              <Field label="Back to Cart Link Text" fieldKey="checkoutBackToCartText" value={s.checkoutBackToCartText} onChange={upd} />
            </div>
          </div>

          {/* 4. Success Modal */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Success Confirmation Modal</h3>
              <p>Customize what the customer sees after a successful checkout.</p>
            </div>
            <div className="cp-grid-3">
              <Field label="Success Title" fieldKey="checkoutSuccessTitle" value={s.checkoutSuccessTitle} onChange={upd} />
              <Field label="Success Description" fieldKey="checkoutSuccessDesc" value={s.checkoutSuccessDesc} onChange={upd} />
              <Field label="Success Button Text" fieldKey="checkoutSuccessBtnText" value={s.checkoutSuccessBtnText} onChange={upd} />
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: LOGIN PAGE ══ */}
      {tab === 'login' && (
        <div className="cp-section">
          {/* 1. Page Header */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Page Content</h3>
              <p>Customize headings, subtitles, and standard form labels on the login page.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Welcome Title" fieldKey="loginPageTitle" value={s.loginPageTitle} onChange={upd} />
              <Field label="Subtitle" fieldKey="loginPageSubtitle" value={s.loginPageSubtitle} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Email Input Label" fieldKey="loginEmailLabel" value={s.loginEmailLabel} onChange={upd} />
              <Field label="Password Input Label" fieldKey="loginPasswordLabel" value={s.loginPasswordLabel} onChange={upd} />
              <Field label="Remember Me Checkbox" fieldKey="loginRememberMeLabel" value={s.loginRememberMeLabel} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Forgot Password Link" fieldKey="loginForgotPasswordLabel" value={s.loginForgotPasswordLabel} onChange={upd} />
              <Field label="Sign In Button" fieldKey="loginSignInBtn" value={s.loginSignInBtn} onChange={upd} />
              <Field label="Sign In Button (Signing In)" fieldKey="loginSignInBtnLoading" value={s.loginSignInBtnLoading} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-2">
              <Field label="Register Link Prompt" fieldKey="loginCreateAccountPrompt" value={s.loginCreateAccountPrompt} onChange={upd} />
              <Field label="Register Link Text" fieldKey="loginCreateAccountLink" value={s.loginCreateAccountLink} onChange={upd} />
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: SIGNUP PAGE ══ */}
      {tab === 'signup' && (
        <div className="cp-section">
          {/* 1. Page Content */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Page Content</h3>
              <p>Customize headings, input field labels, terms agreement, and links on the register page.</p>
            </div>
            <div className="cp-grid-2">
              <Field label="Signup Title" fieldKey="signupPageTitle" value={s.signupPageTitle} onChange={upd} />
              <Field label="Subtitle" fieldKey="signupPageSubtitle" value={s.signupPageSubtitle} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Name Input Label" fieldKey="signupNameLabel" value={s.signupNameLabel} onChange={upd} />
              <Field label="Email Input Label" fieldKey="signupEmailLabel" value={s.signupEmailLabel} onChange={upd} />
              <Field label="Password Input Label" fieldKey="signupPasswordLabel" value={s.signupPasswordLabel} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Confirm Password Input Label" fieldKey="signupConfirmPasswordLabel" value={s.signupConfirmPasswordLabel} onChange={upd} />
              <Field label="Terms Agreement Checkbox" fieldKey="signupTermsLabel" value={s.signupTermsLabel} onChange={upd} />
              <Field label="Register Button Text" fieldKey="signupSubmitBtn" value={s.signupSubmitBtn} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Register Button (Registering)" fieldKey="signupSubmitBtnLoading" value={s.signupSubmitBtnLoading} onChange={upd} />
              <Field label="Login Link Prompt" fieldKey="signupSignInPrompt" value={s.signupSignInPrompt} onChange={upd} />
              <Field label="Login Link Text" fieldKey="signupSignInLink" value={s.signupSignInLink} onChange={upd} />
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: FOOTER CONTENT ══ */}
      {tab === 'footer' && (
        <div className="cp-section">
          {/* 1. General Footer Content */}
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Footer Details</h3>
              <p>Customize the description text and the copyright information shown in the footer.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="Footer Description" fieldKey="footerDesc" value={s.footerDesc} onChange={upd} type="textarea" rows={3} />
              <Field label="Copyright Notice" fieldKey="footerCopyright" value={s.footerCopyright} onChange={upd} />
            </div>
          </div>

          {/* 2. Footer Contact Info */}
          <div className="cp-card" style={{ marginTop: 24 }}>
            <div className="cp-card-header">
              <h3>Footer Contact Info</h3>
              <p>Customize the contact details shown in the rightmost column of the footer.</p>
            </div>
            <div className="cp-grid-3" style={{ marginBottom: 16 }}>
              <Field label="Phone Number" fieldKey="contactPhoneValue" value={s.contactPhoneValue} onChange={upd} />
              <Field label="Contact Person / Email" fieldKey="contactPersonValue" value={s.contactPersonValue} onChange={upd} />
              <Field label="Business Hours (Days)" fieldKey="contactHoursValue" value={s.contactHoursValue} onChange={upd} />
            </div>
            <hr className="cp-card-divider" />
            <div className="cp-grid-3">
              <Field label="Address Line 1" fieldKey="contactAddressValue" value={s.contactAddressValue} onChange={upd} />
              <Field label="Address Line 2" fieldKey="contactAddressSubtext" value={s.contactAddressSubtext} onChange={upd} />
              <Field label="Business Hours (Hours)" fieldKey="contactHoursSubtext" value={s.contactHoursSubtext} onChange={upd} />
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: SHIPPING SETTINGS ══ */}
      {tab === 'shipping' && (
        <div className="cp-section">
          <div className="cp-card">
            <div className="cp-card-header">
              <h3>Shipping Fee Configuration</h3>
              <p>Configure the flat shipping fee charges and the minimum order threshold required for free shipping.</p>
            </div>
            <div className="cp-grid-2">
              <Field 
                label="Flat Shipping Fee (Rs.)" 
                fieldKey="shippingFee" 
                type="number" 
                value={s.shippingFee} 
                onChange={upd} 
                hint="Charged on orders that do not qualify for free shipping" 
              />
              <Field 
                label="Free Shipping Threshold (Rs.)" 
                fieldKey="freeShippingThreshold" 
                type="number" 
                value={s.freeShippingThreshold} 
                onChange={upd} 
                hint="Minimum order value to get free shipping" 
              />
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
