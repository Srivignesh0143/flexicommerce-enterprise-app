import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';

dotenv.config();

const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/flexicommerce';

const isSrvDnsError = (err) => {
    const message = (err?.message || '').toLowerCase();
    return message.includes('querysrv enotfound') || (message.includes('enotfound') && message.includes('mongodb.net'));
};

const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB (Atlas)');
        return;
    } catch (err) {
        if (!isSrvDnsError(err)) throw err;
        console.warn('Atlas DNS lookup failed, trying local MongoDB...');
        await mongoose.connect(LOCAL_MONGODB_URI);
        console.log('Connected to MongoDB (Local)');
    }
};

const categorySeed = [
    { name: 'Beverages', icon: 'CupSoda', color: '#0ea5e9' },
    { name: 'Snacks', icon: 'Cookie', color: '#f59e0b' },
    { name: 'Personal Care', icon: 'Sparkles', color: '#ec4899' },
    { name: 'Household', icon: 'Home', color: '#22c55e' },
    { name: 'Dairy', icon: 'Milk', color: '#3b82f6' },
    { name: 'Bakery', icon: 'Croissant', color: '#f97316' },
    { name: 'Fruits', icon: 'Apple', color: '#84cc16' },
    { name: 'Vegetables', icon: 'Carrot', color: '#10b981' },
];

const baseProducts = [
    ['Cold Brew Coffee', 'Beverages'],
    ['Green Tea', 'Beverages'],
    ['Fresh Orange Juice', 'Beverages'],
    ['Sparkling Water', 'Beverages'],
    ['Roasted Almond Mix', 'Snacks'],
    ['Protein Chips', 'Snacks'],
    ['Masala Peanuts', 'Snacks'],
    ['Granola Bars', 'Snacks'],
    ['Hydrating Face Wash', 'Personal Care'],
    ['Herbal Shampoo', 'Personal Care'],
    ['Body Lotion', 'Personal Care'],
    ['Natural Toothpaste', 'Personal Care'],
    ['Dishwash Gel', 'Household'],
    ['Floor Cleaner', 'Household'],
    ['Laundry Liquid', 'Household'],
    ['Kitchen Towels', 'Household'],
    ['Farm Fresh Milk', 'Dairy'],
    ['Greek Yogurt', 'Dairy'],
    ['Cheddar Cheese Slices', 'Dairy'],
    ['Salted Butter', 'Dairy'],
    ['Whole Wheat Bread', 'Bakery'],
    ['Multigrain Buns', 'Bakery'],
    ['Banana Muffins', 'Bakery'],
    ['Butter Croissant', 'Bakery'],
    ['Apple Pack', 'Fruits'],
    ['Banana Bunch', 'Fruits'],
    ['Mango Box', 'Fruits'],
    ['Pomegranate Pack', 'Fruits'],
    ['Tomato Basket', 'Vegetables'],
    ['Onion Bag', 'Vegetables'],
    ['Spinach Bundle', 'Vegetables'],
    ['Carrot Pack', 'Vegetables'],
];

const categoryImages = {
    Beverages: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=1000&q=80',
    ],
    Snacks: [
        'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1585238341986-2f6c4b6f2d52?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=1000&q=80',
    ],
    'Personal Care': [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=80',
    ],
    Household: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1000&q=80',
    ],
    Dairy: [
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560780551-4f1f6c8b1fcf?auto=format&fit=crop&w=1000&q=80',
    ],
    Bakery: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1000&q=80',
    ],
    Fruits: [
        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1574226516831-e1dff420e37f?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1000&q=80',
    ],
    Vegetables: [
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=1000&q=80',
    ],
};

const categoryImageCursor = {};

const getImageForCategory = (category) => {
    const images = categoryImages[category] || [];
    if (!images.length) {
        return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80';
    }

    const currentIdx = categoryImageCursor[category] || 0;
    const image = images[currentIdx % images.length];
    categoryImageCursor[category] = currentIdx + 1;
    return image;
};

const makeProducts = () => {
    return baseProducts.map(([name, category], idx) => {
        const price = 99 + (idx % 8) * 35;
        const originalPrice = price + 40 + (idx % 3) * 20;
        const rating = Number((3.6 + (idx % 12) * 0.1).toFixed(1));
        return {
            name,
            category,
            price,
            originalPrice,
            image: getImageForCategory(category),
            description: `${name} - demo catalog item for testing and dashboard metrics.`,
            badge: idx % 5 === 0 ? 'Best Seller' : idx % 7 === 0 ? 'New' : '',
            rating: rating > 5 ? 5 : rating,
            stock: 40 + (idx % 6) * 15,
            pricings: [
                { label: 'Standard Pack', price },
                { label: 'Family Pack', price: price + 80 },
            ],
        };
    });
};

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'verified', 'failed', 'verified'];

const createDummyOrders = (users, products) => {
    const now = new Date();
    const orders = [];

    for (let i = 0; i < 28; i += 1) {
        const user = users[i % users.length];
        const first = products[i % products.length];
        const second = products[(i + 5) % products.length];
        const qty1 = (i % 3) + 1;
        const qty2 = (i % 2) + 1;

        const items = [
            {
                productId: first._id,
                name: first.name,
                price: first.price,
                quantity: qty1,
                image: first.image,
            },
            {
                productId: second._id,
                name: second.name,
                price: second.price,
                quantity: qty2,
                image: second.image,
            },
        ];

        const total = (first.price * qty1) + (second.price * qty2);
        const shipping = total > 500 ? 0 : 49;
        const grandTotal = total + shipping;

        const createdAt = new Date(now);
        createdAt.setMonth(now.getMonth() - (i % 6));
        createdAt.setDate((i % 27) + 1);
        createdAt.setHours(10 + (i % 9), 15, 0, 0);

        const paymentStatus = paymentStatuses[i % paymentStatuses.length];

        orders.push({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            items,
            total,
            shipping,
            grandTotal,
            status: statuses[i % statuses.length],
            paymentStatus,
            paymentGateway: 'razorpay',
            paymentOrderId: `order_dummy_${Date.now()}_${i}`,
            paymentId: paymentStatus === 'verified' ? `pay_dummy_${Date.now()}_${i}` : '',
            shippingAddress: {
                address: `Demo Street ${i + 1}`,
                city: 'Bengaluru',
                state: 'Karnataka',
                pincode: `5600${(10 + (i % 40)).toString().padStart(2, '0')}`,
                phone: `900000${(1000 + i).toString().slice(-4)}`,
            },
            createdAt,
            updatedAt: createdAt,
        });
    }

    return orders;
};

const run = async () => {
    try {
        await connectToMongo();

        const users = await User.find().select('_id name email role').sort({ createdAt: 1 });
        if (!users.length) {
            throw new Error('No users found. Create at least one user/admin before seeding orders.');
        }

        await Promise.all([
            Order.deleteMany({}),
            Product.deleteMany({}),
            Category.deleteMany({}),
        ]);

        const createdCategories = await Category.insertMany(categorySeed);
        const createdProducts = await Product.insertMany(makeProducts());

        const customerUsers = users.filter((u) => u.role !== 'admin');
        const usableUsers = customerUsers.length ? customerUsers : users;

        const orders = createDummyOrders(usableUsers, createdProducts);
        await Order.insertMany(orders);

        const verifiedRevenue = orders
            .filter((o) => o.paymentStatus === 'verified')
            .reduce((sum, o) => sum + o.grandTotal, 0);

        console.log('Demo data seeded successfully.');
        console.log(`Categories: ${createdCategories.length}`);
        console.log(`Products: ${createdProducts.length}`);
        console.log(`Orders: ${orders.length}`);
        console.log(`Verified Revenue (dummy): Rs. ${verifiedRevenue}`);
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
