import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BRANDING_API = API_URL + '/branding';

const DEFAULT_BRANDING = {
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
    shippingFee: 99,
    freeShippingThreshold: 999,
};

const Cart = () => {
    const navigate = useNavigate();
    const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const [branding, setBranding] = useState(DEFAULT_BRANDING);
    const [loadingBranding, setLoadingBranding] = useState(true);

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

    const threshold = branding.freeShippingThreshold !== undefined ? branding.freeShippingThreshold : 999;
    const fee = branding.shippingFee !== undefined ? branding.shippingFee : 99;
    const shipping = cartTotal >= threshold ? 0 : fee;
    const grandTotal = cartTotal + shipping;

    const handleCheckout = () => navigate('/checkout');

    if (cart.length === 0) {
        return (
            <main className="cart-page">
                <section className="page-header">
                    <div className="container">
                        <h1>{branding.cartPageTitle}</h1>
                        <p>{branding.cartPageSubtitle}</p>
                    </div>
                </section>
                <div className="container">
                    <div className="empty-cart">
                        <ShoppingBag size={64} />
                        <h2>{branding.cartEmptyTitle}</h2>
                        <p>{branding.cartEmptyDesc}</p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            {branding.cartEmptyBtnText} <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <section className="page-header">
                <div className="container">
                    <h1>{branding.cartPageTitle}</h1>
                    <p>{branding.cartPageSubtitle} ({cart.length} item{cart.length !== 1 ? 's' : ''})</p>
                </div>
            </section>

            <div className="container cart-layout">
                <div className="cart-items">
                    <div className="cart-items-header">
                        <h3>{branding.cartSectionHeader}</h3>
                        <button className="clear-cart-btn" onClick={clearCart}>
                            <Trash2 size={16} /> {branding.cartClearBtnText}
                        </button>
                    </div>

                    {cart.map((item) => (
                        <div className="cart-item" key={item.cartItemId}>
                            <div className="cart-item-image">
                                <img src={item.image} alt={item.name} />
                            </div>
                            <div className="cart-item-details">
                                <span className="cart-item-category">{item.category}</span>
                                <h4 className="cart-item-name">{item.name}</h4>
                                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: '4px 0' }}>
                                    {item.selectedPricing && item.selectedPricing !== 'default' && <span>Variant: {item.selectedPricing} &nbsp;</span>}
                                    {item.selectedSize && <span>Size: {item.selectedSize} &nbsp;</span>}
                                    {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                                </div>
                                <span className="cart-item-price">Rs. {Number(item.price).toLocaleString()}</span>
                            </div>
                            <div className="cart-item-actions">
                                <div className="quantity-control">
                                    <button
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <span className="cart-item-total">Rs. {(Number(item.price) * item.quantity).toLocaleString()}</span>
                                <button className="remove-btn" onClick={() => removeFromCart(item.cartItemId)} aria-label="Remove item">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <aside className="order-summary">
                    <h3>{branding.cartSummaryTitle}</h3>
                    <div className="summary-rows">
                        <div className="summary-row">
                            <span>{branding.cartSummarySubtotalLabel}</span>
                            <span>Rs. {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                            <span>{branding.cartSummaryShippingLabel}</span>
                            <span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span>
                        </div>
                        {shipping === 0 && (
                            <p className="free-shipping-note">{branding.cartSummaryFreeShippingNote}</p>
                        )}
                        <div className="summary-divider"></div>
                        <div className="summary-row summary-total">
                            <span>{branding.cartSummaryTotalLabel}</span>
                            <span>Rs. {grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary btn-lg checkout-btn"
                        onClick={handleCheckout}
                    >
                        {branding.cartCheckoutBtnText}
                    </button>
                    <Link to="/products" className="continue-shopping">
                        <ArrowRight size={16} /> {branding.cartContinueShoppingText}
                    </Link>
                </aside>
            </div>
        </main>
    );
};

export default Cart;
