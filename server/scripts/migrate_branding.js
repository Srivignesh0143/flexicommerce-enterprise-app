import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import BrandingSettings from '../models/BrandingSettings.js';

const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/flexicommerce';

const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB (Atlas)');
    } catch (err) {
        console.warn('Atlas DNS lookup failed, trying local MongoDB...');
        await mongoose.connect(LOCAL_MONGODB_URI);
        console.log('Connected to MongoDB (Local)');
    }
};

const run = async () => {
    try {
        await connectToMongo();
        const res = await BrandingSettings.updateOne(
            { docId: 'singleton' },
            {
                $set: {
                    newsletterTitle: 'Shop with Confidence',
                    newsletterSubtitle: 'Enjoy secure shopping with 30-day hassle-free returns, free delivery over Rs. 999, and 24/7 dedicated support.',
                    newsletterBtnText: '',
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
                    navbarHomeLabel: 'Home',
                    navbarProductsLabel: 'Products',
                    navbarOrdersLabel: 'My Orders',
                    navbarContactLabel: 'Contact',
                }
            }
        );
        console.log('Update result:', res);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

run();
