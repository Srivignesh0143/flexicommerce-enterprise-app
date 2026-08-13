import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
    try {
        const [userCount, productCount, orderCount, categoryCount, orders, recentOrders, recentUsers, allUsers, allProducts] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
            Category.countDocuments(),
            Order.find(),
            Order.find().sort({ createdAt: 1 }).limit(10),
            User.find().select('name email createdAt').sort({ createdAt: -1 }).limit(10),
            User.find().select('createdAt'),
            Product.find().select('name price stock category'),
        ]);

        // ── Revenue ──────────────────────────────────────────────────────────
        const verifiedOrders = orders.filter(o => o.paymentStatus === 'verified');
        const totalRevenue = verifiedOrders.reduce((s, o) => s + (o.grandTotal || 0), 0);
        const avgOrderValue = verifiedOrders.length > 0
            ? Math.round(totalRevenue / verifiedOrders.length)
            : 0;

        // ── Order status counts ──────────────────────────────────────────────
        const pendingOrders   = orders.filter(o => o.status === 'pending').length;
        const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
        const shippedOrders   = orders.filter(o => o.status === 'shipped').length;
        const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

        // ── Payment status counts ────────────────────────────────────────────
        const paymentVerified = orders.filter(o => o.paymentStatus === 'verified').length;
        const paymentPending  = orders.filter(o => o.paymentStatus === 'pending').length;
        const paymentFailed   = orders.filter(o => o.paymentStatus === 'failed').length;

        // ── Payment method split ─────────────────────────────────────────────
        const codOrders    = orders.filter(o => o.paymentMethod === 'cod').length;
        const onlineOrders = orders.filter(o => o.paymentMethod === 'online').length;
        const codRevenue   = orders
            .filter(o => o.paymentMethod === 'cod' && o.paymentStatus === 'verified')
            .reduce((s, o) => s + (o.grandTotal || 0), 0);
        const onlineRevenue = orders
            .filter(o => o.paymentMethod === 'online' && o.paymentStatus === 'verified')
            .reduce((s, o) => s + (o.grandTotal || 0), 0);

        // ── Monthly data – last 6 months ─────────────────────────────────────
        const monthlyData = [];
        const userMonthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - i);
            const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

            const mo = orders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end);
            const revenue = mo.filter(o => o.paymentStatus === 'verified').reduce((s, o) => s + (o.grandTotal || 0), 0);
            monthlyData.push({ month: label, orders: mo.length, revenue });

            const mu = allUsers.filter(u => new Date(u.createdAt) >= start && new Date(u.createdAt) <= end).length;
            userMonthlyData.push({ month: label, users: mu });
        }

        // ── Daily data – last 30 days ────────────────────────────────────────
        const dailyData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
            const dayOrders = orders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end);
            const revenue = dayOrders.filter(o => o.paymentStatus === 'verified').reduce((s, o) => s + (o.grandTotal || 0), 0);
            dailyData.push({
                date: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                revenue,
                orders: dayOrders.length,
            });
        }

        // ── Category distribution (products) ────────────────────────────────
        const catMap = {};
        allProducts.forEach(p => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
        const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

        // ── Category revenue (from verified order items) ─────────────────────
        const catRevMap = {};
        verifiedOrders.forEach(order => {
            (order.items || []).forEach(item => {
                const prod = allProducts.find(p => p._id.toString() === (item.productId || '').toString());
                const cat  = prod ? prod.category : (item.name ? 'Other' : null);
                if (!cat) return;
                catRevMap[cat] = (catRevMap[cat] || 0) + (item.price || 0) * (item.quantity || 0);
            });
        });
        const categoryRevenue = Object.entries(catRevMap)
            .map(([name, revenue]) => ({ name, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 8);

        // ── Top selling products ─────────────────────────────────────────────
        const prodMap = {};
        verifiedOrders.forEach(order => {
            (order.items || []).forEach(item => {
                const key = item.name || 'Unknown';
                if (!prodMap[key]) prodMap[key] = { name: key, revenue: 0, quantity: 0 };
                prodMap[key].revenue  += (item.price || 0) * (item.quantity || 0);
                prodMap[key].quantity += (item.quantity || 0);
            });
        });
        const topProducts = Object.values(prodMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // ── Top customers ────────────────────────────────────────────────────
        const custMap = {};
        verifiedOrders.forEach(o => {
            const key = o.userEmail || o.userName;
            if (!custMap[key]) custMap[key] = { name: o.userName, email: o.userEmail, totalSpend: 0, orderCount: 0 };
            custMap[key].totalSpend += o.grandTotal || 0;
            custMap[key].orderCount += 1;
        });
        const topCustomers = Object.values(custMap)
            .sort((a, b) => b.totalSpend - a.totalSpend)
            .slice(0, 5);

        // ── Low stock products ───────────────────────────────────────────────
        const lowStockProducts = allProducts
            .filter(p => typeof p.stock === 'number' && p.stock <= 15)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 6)
            .map(p => ({ _id: p._id, name: p.name, stock: p.stock, category: p.category }));

        res.json({
            userCount,
            productCount,
            orderCount,
            categoryCount,
            totalRevenue,
            avgOrderValue,
            orderStatus: { pendingOrders, confirmedOrders, shippedOrders, deliveredOrders, cancelledOrders },
            paymentStatus: { paymentVerified, paymentPending, paymentFailed },
            paymentMethodSplit: { codOrders, onlineOrders, codRevenue, onlineRevenue },
            monthlyData,
            userMonthlyData,
            dailyData,
            categoryData,
            categoryRevenue,
            topProducts,
            topCustomers,
            lowStockProducts,
            recentOrders,
            recentUsers,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch admin stats.' });
    }
});

export default router;
