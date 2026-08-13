import mongoose from 'mongoose';

const sliderSlideSchema = new mongoose.Schema({
    image:       { type: String, default: '' },
    tag:         { type: String, default: '' },
    title:       { type: String, default: '' },
    highlight:   { type: String, default: '' },
    subtitle:    { type: String, default: '' },
}, { _id: false });

const brandingSchema = new mongoose.Schema({
    docId: { type: String, default: 'singleton', unique: true },

    // ── SECTION 1: Website Theme ───────────────────────────────────────────────
    colorPrimary:    { type: String, default: '#2563eb' },
    colorSecondary:  { type: String, default: '#7c3aed' },
    colorAccent:     { type: String, default: '#10b981' },
    colorBackground: { type: String, default: '#ffffff' },
    colorText:       { type: String, default: '#111827' },
    colorButton:     { type: String, default: '#2563eb' },
    fontHeading:     { type: String, default: 'Poppins' },
    fontBody:        { type: String, default: 'Poppins' },
    fontSizeBase:    { type: String, default: '16px' },
    appNamePart1:    { type: String, default: 'Flexi' },
    appNamePart2:    { type: String, default: 'Commerce' },
    mailName:        { type: String, default: 'FlexiCommerce' },
    faviconUrl:      { type: String, default: '' },
    logoUrl:         { type: String, default: '' },

    // Navbar customization
    navbarHomeLabel:     { type: String, default: 'Home' },
    navbarProductsLabel: { type: String, default: 'Products' },
    navbarOrdersLabel:   { type: String, default: 'My Orders' },
    navbarContactLabel:  { type: String, default: 'Contact' },

    // ── SECTION 2: Home Page ───────────────────────────────────────────────────
    // Hero slider (up to 4 slides)
    heroSlides: {
        type: [sliderSlideSchema],
        default: [
            {
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=700&fit=crop',
                tag: 'Premium Shopping Experience',
                title: 'Discover Products That',
                highlight: 'Define Your Style',
                subtitle: 'Explore our curated collection of premium electronics, fashion, and accessories.',
            },
            {
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=700&fit=crop',
                tag: 'New Arrivals',
                title: 'Elevate Your Wardrobe With',
                highlight: 'Trending Fashion',
                subtitle: 'Shop the latest trends in fashion. From casual wear to premium accessories.',
            },
            {
                image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=700&fit=crop',
                tag: 'Tech Deals',
                title: 'Cutting-Edge',
                highlight: 'Electronics & Gadgets',
                subtitle: 'Get up to 40% off on top-brand electronics. Headphones, laptops, smartwatches.',
            },
            {
                image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=700&fit=crop',
                tag: 'Best Sellers',
                title: 'Shop Our Most',
                highlight: 'Popular Products',
                subtitle: 'Thousands of customers love these picks. Browse our bestselling collection.',
            },
        ],
    },

    // Hero stats bar
    statOneNumber: { type: String, default: '10K+' },
    statOneLabel:  { type: String, default: 'Happy Customers' },
    statTwoNumber: { type: String, default: '500+' },
    statTwoLabel:  { type: String, default: 'Premium Products' },
    statThreeNumber: { type: String, default: '99%' },
    statThreeLabel:  { type: String, default: 'Satisfaction Rate' },

    // Features section
    featureOneTitle:       { type: String, default: 'Free Shipping' },
    featureOneDesc:        { type: String, default: 'Free delivery on orders above Rs. 999' },
    featureTwoTitle:       { type: String, default: 'Secure Payments' },
    featureTwoDesc:        { type: String, default: '100% secure payment processing' },
    featureThreeTitle:     { type: String, default: 'Easy Returns' },
    featureThreeDesc:      { type: String, default: '30-day hassle-free return policy' },

    // Categories section
    categoriesSectionTitle:    { type: String, default: 'Shop by Category' },
    categoriesSectionSubtitle: { type: String, default: 'Browse our wide range of product categories' },

    // Featured Products section
    featuredSectionTitle:    { type: String, default: 'Featured Products' },
    featuredSectionSubtitle: { type: String, default: 'Handpicked premium products just for you' },

    // Promo Banner section
    promoTag:        { type: String, default: 'Limited Time Offer' },
    promoTitle:      { type: String, default: 'Up to 40% Off on Electronics' },
    promoDesc:       { type: String, default: 'Grab the best deals on top-brand electronics. Premium quality, unbeatable prices. Offer valid while stocks last.' },
    promoButtonText: { type: String, default: 'Shop the Sale' },
    promoImage:      { type: String, default: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&h=400&fit=crop' },

    // Testimonials section
    testimonialsSectionTitle:    { type: String, default: 'What Our Customers Say' },
    testimonialsSectionSubtitle: { type: String, default: 'Real reviews from real customers' },

    testimonialOneText:  { type: String, default: 'Exceptional quality products and lightning-fast delivery. Flexi Commerce has become my go-to online store.' },
    testimonialOneName:  { type: String, default: 'Priya S.' },
    testimonialOneRole:  { type: String, default: 'Verified Buyer' },
    testimonialOneStars: { type: Number, default: 5 },

    testimonialTwoText:  { type: String, default: 'The product range is impressive and the prices are unbeatable. Customer service is top-notch too.' },
    testimonialTwoName:  { type: String, default: 'Arjun M.' },
    testimonialTwoRole:  { type: String, default: 'Verified Buyer' },
    testimonialTwoStars: { type: Number, default: 5 },

    testimonialThreeText: { type: String, default: 'I love the seamless shopping experience. Every order has been perfect, from browsing to delivery.' },
    testimonialThreeName: { type: String, default: 'Sneha R.' },
    testimonialThreeRole: { type: String, default: 'Verified Buyer' },
    testimonialThreeStars:{ type: Number, default: 4 },

    // Newsletter section
    newsletterTitle:    { type: String, default: 'Shop with Confidence' },
    newsletterSubtitle: { type: String, default: 'Enjoy secure shopping with 30-day hassle-free returns, free delivery over Rs. 999, and 24/7 dedicated support.' },
    newsletterBtnText:  { type: String, default: '' },

    // ── SECTION 3: Products Page ───────────────────────────────────────────────
    // Page header
    productsPageTitle:    { type: String, default: 'Our Products' },
    productsPageSubtitle: { type: String, default: 'Discover our complete range of premium products' },

    // Sidebar labels
    productsSidebarFiltersLabel:    { type: String, default: 'Filters' },
    productsSidebarSearchPlaceholder: { type: String, default: 'Search products...' },
    productsSidebarCategoriesLabel: { type: String, default: 'Categories' },
    productsSidebarPriceLabel:      { type: String, default: 'Price Range' },

    // Toolbar
    productsToolbarSortLabel:        { type: String, default: 'Sort by:' },
    productsToolbarResultsSuffix:    { type: String, default: 'products found' },

    // Empty state
    productsEmptyTitle:         { type: String, default: 'No products found' },
    productsEmptyDesc:          { type: String, default: 'Try adjusting your filters or search query' },
    productsEmptyComingSoon:    { type: String, default: 'Products coming soon! Stay tuned.' },

    // Product card
    productsShippingBadgeText:  { type: String, default: 'Free shipping on orders above Rs. 999' },
    productsAddToCartText:      { type: String, default: 'Add to Cart' },

    // Options modal
    productsModalTitle:         { type: String, default: 'Select Options' },
    productsModalConfirmText:   { type: String, default: 'Confirm Add to Cart' },
    productsModalShippingText:  { type: String, default: 'Free shipping on orders above Rs. 999' },

    // ── SECTION 4: Contact Page ────────────────────────────────────────────────
    // Page Header
    contactPageTitle:          { type: String, default: 'Contact Us' },
    contactPageSubtitle:       { type: String, default: "We'd love to hear from you. Get in touch with us." },

    // Contact Cards
    contactPhoneTitle:         { type: String, default: 'Phone' },
    contactPhoneValue:         { type: String, default: '+91 9003948329' },
    contactPhoneSubtext:       { type: String, default: 'Mon-Sat, 9AM-8PM' },

    contactAddressTitle:       { type: String, default: 'Address' },
    contactAddressValue:       { type: String, default: 'Kanagapuram, Vellode' },
    contactAddressSubtext:     { type: String, default: 'Erode - 638112' },

    contactPersonTitle:        { type: String, default: 'Contact Person' },
    contactPersonValue:        { type: String, default: 'MohanRaja V' },
    contactPersonSubtext:      { type: String, default: 'Owner & Founder' },

    contactHoursTitle:         { type: String, default: 'Business Hours' },
    contactHoursValue:         { type: String, default: 'Mon - Sat' },
    contactHoursSubtext:       { type: String, default: '9:00 AM - 8:00 PM' },

    // Send Message Form
    contactFormTitle:          { type: String, default: 'Send us a Message' },
    contactFormDesc:           { type: String, default: "Fill out the form below and we'll get back to you as soon as possible." },
    contactFormBtnText:        { type: String, default: 'Send Message' },

    // Map Section
    contactMapTitle:           { type: String, default: 'Find Us' },
    contactMapEmbedUrl:        { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3913.5!2d77.7!3d11.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDIxJzAwLjAiTiA3N8KwNDInMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin' },

    // ── SECTION 5: Cart Page ───────────────────────────────────────────────────
    cartPageTitle:              { type: String, default: 'Shopping Cart' },
    cartPageSubtitle:           { type: String, default: 'Review your selected items' },
    cartEmptyTitle:             { type: String, default: 'Your cart is empty' },
    cartEmptyDesc:              { type: String, default: "Looks like you haven't added anything to your cart yet." },
    cartEmptyBtnText:           { type: String, default: 'Continue Shopping' },
    cartSectionHeader:          { type: String, default: 'Cart Items' },
    cartClearBtnText:           { type: String, default: 'Clear Cart' },
    cartSummaryTitle:           { type: String, default: 'Order Summary' },
    cartSummarySubtotalLabel:   { type: String, default: 'Subtotal' },
    cartSummaryShippingLabel:   { type: String, default: 'Shipping' },
    cartSummaryFreeShippingNote: { type: String, default: 'You qualify for free shipping!' },
    cartSummaryTotalLabel:      { type: String, default: 'Total' },
    cartCheckoutBtnText:        { type: String, default: 'Proceed to Checkout' },
    cartContinueShoppingText:   { type: String, default: 'Continue Shopping' },

    // ── SECTION 6: My Orders Page ──────────────────────────────────────────────
    ordersPageTitle:            { type: String, default: 'My Orders' },
    ordersPageSubtitle:         { type: String, default: 'Track all your placed orders in one place' },
    ordersSummaryTotalLabel:    { type: String, default: 'Total Orders' },
    ordersSummaryProgressLabel: { type: String, default: 'In Progress' },
    ordersSummaryDeliveredLabel: { type: String, default: 'Delivered' },
    ordersTableHeaderTitle:     { type: String, default: 'Recent Orders' },
    ordersEmptyTitle:           { type: String, default: 'No orders yet' },
    ordersEmptyDesc:            { type: String, default: 'You have not placed any order yet.' },
    ordersEmptyBtnText:         { type: String, default: 'Start Shopping' },

    // ── SECTION 7: Checkout Page ───────────────────────────────────────────────
    checkoutPageTitle:              { type: String, default: 'Checkout' },
    checkoutPageSubtitle:           { type: String, default: 'Delivery details and payment' },
    checkoutDeliveryAddressTitle:   { type: String, default: 'Delivery Address' },
    checkoutPaymentMethodTitle:     { type: String, default: 'Payment Method' },
    checkoutPaymentCodText:         { type: String, default: 'Cash on Delivery' },
    checkoutPaymentOnlineText:      { type: String, default: 'Online Payment (Razorpay Test)' },
    checkoutOnlinePaymentNote:      { type: String, default: 'Razorpay test mode payment. Use test details on popup.' },
    checkoutOnlinePaymentBtn:       { type: String, default: 'Proceed to Razorpay (Test)' },
    checkoutOnlinePaymentBtnPaid:   { type: String, default: 'Payment Completed' },
    checkoutOnlinePaymentBtnOpening:{ type: String, default: 'Opening Razorpay...' },
    checkoutSummaryTitle:           { type: String, default: 'Order Summary' },
    checkoutSummaryItemsLabel:      { type: String, default: 'Items' },
    checkoutSummarySubtotalLabel:   { type: String, default: 'Subtotal' },
    checkoutSummaryShippingLabel:   { type: String, default: 'Shipping' },
    checkoutSummaryTotalLabel:      { type: String, default: 'Total' },
    checkoutPlaceOrderBtn:          { type: String, default: 'Place Order' },
    checkoutPlaceOrderBtnPlacing:   { type: String, default: 'Placing Order...' },
    checkoutBackToCartText:         { type: String, default: 'Back to Cart' },
    checkoutSuccessTitle:           { type: String, default: 'Order Placed Successfully!' },
    checkoutSuccessDesc:            { type: String, default: 'Thank you for shopping with us. Your order has been received and is being processed.' },
    checkoutSuccessBtnText:         { type: String, default: 'View My Orders' },

    // ── SECTION 8: Login Page ──────────────────────────────────────────────────
    loginPageTitle:             { type: String, default: 'Welcome Back' },
    loginPageSubtitle:          { type: String, default: 'Sign in to your account to continue' },
    loginEmailLabel:            { type: String, default: 'Email Address' },
    loginPasswordLabel:         { type: String, default: 'Password' },
    loginRememberMeLabel:       { type: String, default: 'Remember me' },
    loginForgotPasswordLabel:   { type: String, default: 'Forgot Password?' },
    loginSignInBtn:             { type: String, default: 'Sign In' },
    loginSignInBtnLoading:      { type: String, default: 'Signing In...' },
    loginCreateAccountPrompt:   { type: String, default: "Don't have an account?" },
    loginCreateAccountLink:     { type: String, default: 'Create Account' },

    // ── SECTION 9: Signup Page ─────────────────────────────────────────────────
    signupPageTitle:            { type: String, default: 'Create Account' },
    signupPageSubtitle:         { type: String, default: 'Join Flexi Commerce and start shopping' },
    signupNameLabel:            { type: String, default: 'Full Name' },
    signupEmailLabel:           { type: String, default: 'Email Address' },
    signupPasswordLabel:        { type: String, default: 'Password' },
    signupConfirmPasswordLabel: { type: String, default: 'Confirm Password' },
    signupTermsLabel:           { type: String, default: 'I agree to the Terms of Service and Privacy Policy' },
    signupSubmitBtn:            { type: String, default: 'Create Account' },
    signupSubmitBtnLoading:     { type: String, default: 'Creating Account...' },
    signupSignInPrompt:         { type: String, default: 'Already have an account?' },
    signupSignInLink:           { type: String, default: 'Sign In' },

    // ── SECTION 10: Footer Content ──────────────────────────────────────────────
    footerDesc:         { type: String, default: 'Your one-stop destination for premium products at unbeatable prices. We deliver quality, style, and value right to your doorstep.' },
    footerCopyright:    { type: String, default: '© 2026 Flexi Commerce. All rights reserved.' },

    // ── SECTION 11: Value Propositions ──────────────────────────────────────────
    valPropTitle:       { type: String, default: 'Why Choose Us' },
    valPropSubtitle:    { type: String, default: 'We focus on customer happiness and top quality.' },
    valPropOneTitle:    { type: String, default: 'Premium Quality' },
    valPropOneDesc:     { type: String, default: 'We source only from top verified suppliers.' },
    valPropTwoTitle:    { type: String, default: 'Secure Payments' },
    valPropTwoDesc:     { type: String, default: 'Your transaction info is 100% encrypted.' },
    valPropThreeTitle:  { type: String, default: 'Fast Delivery' },
    valPropThreeDesc:   { type: String, default: 'Reliable doorstep shipping within 2-3 business days.' },
    valPropFourTitle:   { type: String, default: '24/7 Priority Support' },
    valPropFourDesc:    { type: String, default: 'Our helpdesk is always active to assist you.' },

    // ── SECTION 12: How It Works ────────────────────────────────────────────────
    howTitle:          { type: String, default: 'Simple & Secure Shopping' },
    howSubtitle:       { type: String, default: 'Get your favorite items delivered to your doorstep in three easy steps.' },
    howStepOneTitle:   { type: String, default: '1. Select Your Products' },
    howStepOneDesc:    { type: String, default: 'Browse our extensive catalog and add premium items to your shopping cart.' },
    howStepTwoTitle:   { type: String, default: '2. Safe Checkout' },
    howStepTwoDesc:    { type: String, default: 'Complete your purchase securely using Credit Cards, UPI, or Cash on Delivery.' },
    howStepThreeTitle: { type: String, default: '3. Secure Payment & Delivery' },
    howStepThreeDesc:  { type: String, default: 'Complete your payment securely and get your products delivered safely to your doorstep.' },

    // ── SECTION 13: FAQ Accordion ───────────────────────────────────────────────
    faqTitle:       { type: String, default: 'Frequently Asked Questions' },
    faqSubtitle:    { type: String, default: 'Find answers to common inquiries about our store' },
    faqOneQ:        { type: String, default: 'What is your shipping policy?' },
    faqOneA:        { type: String, default: 'We offer free delivery for orders above Rs. 999. Deliveries generally take 2-4 business days.' },
    faqTwoQ:        { type: String, default: 'How do I track my orders?' },
    faqTwoA:        { type: String, default: 'You can view and track all your orders in depth on the My Orders page under your profile.' },
    faqThreeQ:      { type: String, default: 'What payment methods do you support?' },
    faqThreeA:      { type: String, default: 'We support Cash on Delivery (COD) as well as online payments including Credit Cards and UPI.' },
    faqFourQ:       { type: String, default: 'Is there a returns policy?' },
    faqFourA:       { type: String, default: 'Yes, we have a 30-day hassle-free returns policy. Items must be returned in their original packaging.' },

    // ── SECTION 14: Community Social Feed ───────────────────────────────────────
    socialTitle:        { type: String, default: 'Join Our Community' },
    socialSubtitle:     { type: String, default: 'Follow us on social media and tag @FlexiCommerce to get featured on our website!' },
    socialHoverText:    { type: String, default: '@FlexiCommerce' },
    socialImageOne:     { type: String, default: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop' },
    socialImageTwo:     { type: String, default: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop' },
    socialImageThree:   { type: String, default: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop' },
    socialImageFour:    { type: String, default: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=400&h=400&fit=crop' },

    // ── SECTION 15: Shipping Settings ───────────────────────────────────────────
    shippingFee:            { type: Number, default: 99 },
    freeShippingThreshold:  { type: Number, default: 999 },

}, { timestamps: true });

const BrandingSettings = mongoose.model('BrandingSettings', brandingSchema);
export default BrandingSettings;
