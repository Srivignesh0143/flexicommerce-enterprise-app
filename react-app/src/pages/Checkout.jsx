import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const BRANDING_API = (import.meta.env.VITE_API_URL || '/api') + '/branding';

const DEFAULT_BRANDING = {
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
    shippingFee: 99,
    freeShippingThreshold: 999,
};

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();
    const { user, token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

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

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [payingOnline, setPayingOnline] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentData, setPaymentData] = useState({ paid: false, paymentOrderId: '', paymentId: '' });
    const [deliveryErrors, setDeliveryErrors] = useState({});
    const [checkoutNotice, setCheckoutNotice] = useState('');
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
    });

    const threshold = branding.freeShippingThreshold !== undefined ? branding.freeShippingThreshold : 999;
    const fee = branding.shippingFee !== undefined ? branding.shippingFee : 99;
    const shipping = cartTotal >= threshold ? 0 : fee;
    const grandTotal = cartTotal + shipping;

    const isAddressValid = useMemo(() => {
        return Object.values(formData).every((v) => v.trim().length > 0);
    }, [formData]);

    const validateDeliveryAddress = () => {
        const nextErrors = {};

        if (!formData.address.trim()) nextErrors.address = 'Address is required.';
        if (!formData.city.trim()) nextErrors.city = 'City is required.';
        if (!formData.state.trim()) nextErrors.state = 'State is required.';

        const pincode = formData.pincode.trim();
        const phone = formData.phone.trim();

        if (!pincode) {
            nextErrors.pincode = 'Pincode is required.';
        } else if (!/^[0-9]{4,10}$/.test(pincode)) {
            nextErrors.pincode = 'Enter a valid pincode.';
        }

        if (!phone) {
            nextErrors.phone = 'Phone number is required.';
        } else if (!/^[0-9+\-\s]{7,15}$/.test(phone)) {
            nextErrors.phone = 'Enter a valid phone number.';
        }

        setDeliveryErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handlePlaceOrderSubmit = async (e) => {
        e.preventDefault();
        if (!validateDeliveryAddress()) return;
        await placeOrder();
    };

    useEffect(() => {
        if (!user || !token) {
            navigate('/login', { state: { from: '/checkout' }, replace: true });
            return;
        }

        if (cart.length === 0) {
            navigate('/cart', { replace: true });
        }
    }, [user, token, cart.length, navigate]);

    if (!user || !token || cart.length === 0) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setCheckoutNotice('');
        setDeliveryErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const startRazorpayPayment = async () => {
        if (paymentMethod !== 'online') return;
        if (!RAZORPAY_KEY_ID) {
            setCheckoutNotice('Razorpay test key is missing. Please configure VITE_RAZORPAY_KEY_ID.');
            return;
        }
        if (!validateDeliveryAddress()) {
            return;
        }

        setPayingOnline(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Unable to load Razorpay checkout. Please check your internet and try again.');
            }

            const createOrderRes = await fetch(`${API_URL}/orders/razorpay/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: Math.round(grandTotal * 100) }),
            });
            const createOrderData = await createOrderRes.json();
            if (!createOrderRes.ok) {
                throw new Error(createOrderData.message || 'Failed to initialize Razorpay payment.');
            }

            await new Promise((resolve, reject) => {
                const paymentObject = new window.Razorpay({
                    key: RAZORPAY_KEY_ID,
                    amount: createOrderData.amount,
                    currency: createOrderData.currency,
                    name: 'FlexiCommerce',
                    description: 'Test payment',
                    order_id: createOrderData.id,
                    prefill: {
                        name: user?.name || '',
                        email: user?.email || '',
                        contact: formData.phone,
                    },
                    notes: {
                        address: `${formData.address}, ${formData.city}`,
                    },
                    theme: {
                        color: '#0f766e',
                    },
                    handler: async (response) => {
                        try {
                            const verifyRes = await fetch(`${API_URL}/orders/razorpay/verify`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify(response),
                            });
                            const verifyData = await verifyRes.json();
                            if (!verifyRes.ok || !verifyData.verified) {
                                throw new Error(verifyData.message || 'Payment verification failed.');
                            }

                            setPaymentData({
                                paid: true,
                                paymentOrderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                            });
                            setCheckoutNotice('Razorpay test payment successful. You can place the order now.');
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Razorpay payment popup closed.')),
                    },
                });

                paymentObject.open();
            });
        } catch (err) {
            setCheckoutNotice(err.message || 'Online payment failed. Please try again.');
        } finally {
            setPayingOnline(false);
        }
    };

    const placeOrder = async () => {
        if (!validateDeliveryAddress()) {
            return;
        }

        if (paymentMethod === 'online' && !paymentData.paid) {
            setCheckoutNotice('Complete online payment first.');
            return;
        }

        setPlacingOrder(true);
        try {
            const items = cart.map((item) => ({
                productId: item._id || item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                pricing: item.selectedPricing,
                size: item.selectedSize,
                color: item.selectedColor
            }));

            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items,
                    total: cartTotal,
                    shipping,
                    grandTotal,
                    shippingAddress: formData,
                    paymentMethod,
                    paymentOrderId: paymentData.paymentOrderId,
                    paymentId: paymentData.paymentId,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to place order.');
            }

            clearCart();
            setShowSuccessModal(true);
        } catch (err) {
            setCheckoutNotice(err.message || 'Failed to place order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <main className="checkout-page">
            <section className="page-header">
                <div className="container">
                    <h1>{branding.checkoutPageTitle}</h1>
                    <p>{branding.checkoutPageSubtitle}</p>
                </div>
            </section>

            <div className="container checkout-layout">
                <form id="checkout-form" className="checkout-form-card" onSubmit={handlePlaceOrderSubmit} noValidate>
                    <h3>{branding.checkoutDeliveryAddressTitle}</h3>
                    {checkoutNotice && <div className="checkout-inline-notice" role="status" aria-live="polite">{checkoutNotice}</div>}
                    <div className="checkout-form-grid">
                        <label>
                            Address
                            <input name="address" value={formData.address} onChange={handleChange} placeholder="House no, street" required autoComplete="street-address" />
                            {deliveryErrors.address && <span className="field-error">{deliveryErrors.address}</span>}
                        </label>
                        <label>
                            City
                            <input name="city" value={formData.city} onChange={handleChange} placeholder="City" required autoComplete="address-level2" />
                            {deliveryErrors.city && <span className="field-error">{deliveryErrors.city}</span>}
                        </label>
                        <label>
                            State
                            <input name="state" value={formData.state} onChange={handleChange} placeholder="State" required autoComplete="address-level1" />
                            {deliveryErrors.state && <span className="field-error">{deliveryErrors.state}</span>}
                        </label>
                        <label>
                            Pincode
                            <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" required inputMode="numeric" pattern="[0-9]{4,10}" autoComplete="postal-code" />
                            {deliveryErrors.pincode && <span className="field-error">{deliveryErrors.pincode}</span>}
                        </label>
                        <label className="full-width">
                            Phone
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" required inputMode="tel" pattern="[0-9+\-\s]{7,15}" autoComplete="tel" />
                            {deliveryErrors.phone && <span className="field-error">{deliveryErrors.phone}</span>}
                        </label>
                    </div>

                    <h3 className="section-gap">{branding.checkoutPaymentMethodTitle}</h3>
                    <div className="payment-options">
                        <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                            <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => {
                                setPaymentMethod('cod');
                                setPaymentData({ paid: false, paymentOrderId: '', paymentId: '' });
                            }} />
                            <Truck size={18} /> {branding.checkoutPaymentCodText}
                        </label>
                        <label className={`payment-option ${paymentMethod === 'online' ? 'active' : ''}`}>
                            <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => {
                                setPaymentMethod('online');
                                setPaymentData({ paid: false, paymentOrderId: '', paymentId: '' });
                            }} />
                            <CreditCard size={18} /> {branding.checkoutPaymentOnlineText}
                        </label>
                    </div>

                    {paymentMethod === 'online' && (
                        <div className="online-payment-box">
                            <div className="online-payment-note">
                                <ShieldCheck size={18} /> {branding.checkoutOnlinePaymentNote}
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={startRazorpayPayment} disabled={payingOnline || paymentData.paid}>
                                {paymentData.paid ? branding.checkoutOnlinePaymentBtnPaid : payingOnline ? branding.checkoutOnlinePaymentBtnOpening : branding.checkoutOnlinePaymentBtn}
                            </button>
                        </div>
                    )}
                </form>

                <aside className="checkout-summary-card">
                    <h3>{branding.checkoutSummaryTitle}</h3>
                    <div className="summary-lines">
                        <div><span>{branding.checkoutSummaryItemsLabel}</span><span>{cart.length}</span></div>
                        <div><span>{branding.checkoutSummarySubtotalLabel}</span><span>Rs. {cartTotal.toLocaleString()}</span></div>
                        <div><span>{branding.checkoutSummaryShippingLabel}</span><span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span></div>
                        <div className="summary-total"><span>{branding.checkoutSummaryTotalLabel}</span><span>Rs. {grandTotal.toLocaleString()}</span></div>
                    </div>
                    <button className="btn btn-primary btn-lg" type="submit" form="checkout-form" disabled={placingOrder || (paymentMethod === 'online' && !paymentData.paid)}>
                        {placingOrder ? branding.checkoutPlaceOrderBtnPlacing : branding.checkoutPlaceOrderBtn}
                    </button>
                    <Link to="/cart" className="checkout-back-link">{branding.checkoutBackToCartText}</Link>
                </aside>
            </div>
            
            {showSuccessModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                        <div style={{ background: '#10b981', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h2 style={{ margin: '0 0 10px', color: 'var(--gray-900)' }}>{branding.checkoutSuccessTitle}</h2>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '24px', lineHeight: 1.5 }}>
                            {branding.checkoutSuccessDesc}
                        </p>
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '12px' }}
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/my-orders');
                            }}
                        >
                            {branding.checkoutSuccessBtnText}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Checkout;
