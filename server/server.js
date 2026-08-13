import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import categoryRoutes from './routes/categories.js';
import brandingRoutes from './routes/branding.js';
import contactRoutes from './routes/contact.js';
import deliveryRoutes from './routes/delivery.js';

const app = express();
const PORT = process.env.PORT || 5000;
const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/flexicommerce';

// Middleware — 50mb limit for base64 image uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/delivery', deliveryRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

const migrateOrderIds = async () => {
    try {
        const Order = mongoose.model('Order');
        const Counter = mongoose.model('Counter');
        
        const oldOrders = await Order.find({
            $or: [
                { orderId: { $exists: false } },
                { orderId: { $not: /^ORD-/ } }
            ]
        }).sort({ createdAt: 1 });

        if (oldOrders.length > 0) {
            console.log(`Migrating ${oldOrders.length} orders to have the new ORD-YYYYMMDD-XXXX format...`);
            
            let counter = await Counter.findById('orderId');
            let seq = counter ? counter.seq : 0;
            
            for (const order of oldOrders) {
                let orderSeq = seq;
                const currentId = order.orderId;
                const numericId = parseInt(currentId, 10);
                
                if (!isNaN(numericId) && numericId > 0) {
                    orderSeq = numericId;
                    if (orderSeq > seq) {
                        seq = orderSeq;
                    }
                } else {
                    seq += 1;
                    orderSeq = seq;
                }
                
                const date = order.createdAt ? new Date(order.createdAt) : new Date();
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const dateStr = `${yyyy}${mm}${dd}`;
                
                order.orderId = `ORD-${dateStr}-${String(orderSeq).padStart(4, '0')}`;
                await order.save();
            }
            
            await Counter.findByIdAndUpdate(
                { _id: 'orderId' },
                { $set: { seq } },
                { new: true, upsert: true }
            );
            console.log(`Successfully migrated orders. Last seq is ${seq}`);
        }
    } catch (err) {
        console.error('Error migrating orderIds:', err);
    }
};

const isSrvDnsError = (err) => {
    const message = (err?.message || '').toLowerCase();
    return message.includes('querysrv enotfound') || (message.includes('enotfound') && message.includes('mongodb.net'));
};

const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB (Atlas)');
        await migrateOrderIds();
        return;
    } catch (err) {
        if (!isSrvDnsError(err)) {
            throw err;
        }

        console.warn('Atlas DNS lookup failed, attempting local MongoDB fallback...');
        await mongoose.connect(LOCAL_MONGODB_URI);
        console.log('Connected to MongoDB (Local Fallback)');
        await migrateOrderIds();
    }
};

// Connect to MongoDB and start server
connectToMongo()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });
