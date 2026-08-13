import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { verifyToken, isAdmin, isDelivery } from '../middleware/auth.js';
import { sendDeliveryOtpEmail, sendOrderDeliveredEmail, sendOrderOutForDeliveryEmail } from '../utils/emailService.js';

const router = express.Router();

// GET /api/delivery/orders — assigned orders for this delivery partner
router.get('/orders', verifyToken, isDelivery, async (req, res) => {
    try {
        const query = req.user.role === 'admin'
            ? {}
            : { assignedTo: req.user.id };
        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch orders.' });
    }
});

// PUT /api/delivery/orders/:id/status
router.put('/orders/:id/status', verifyToken, isDelivery, async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['out_for_delivery'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Delivery partners can only set status to out_for_delivery. Use OTP to mark delivered.' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        // Verify ownership
        if (req.user.role !== 'admin' && String(order.assignedTo) !== req.user.id) {
            return res.status(403).json({ message: 'Not assigned to this order.' });
        }

        order.status = status;
        await order.save();

        if (status === 'out_for_delivery') {
            const displayOrderId = order.orderId || order._id.toString().slice(-8);
            sendOrderOutForDeliveryEmail(order.userEmail, order.userName, displayOrderId, order.shippingAddress)
                .catch(err => console.error('Failed to send out for delivery email:', err));
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update status.' });
    }
});

// POST /api/delivery/orders/:id/send-otp
router.post('/orders/:id/send-otp', verifyToken, isDelivery, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (order.status === 'delivered') return res.status(400).json({ message: 'Order already delivered.' });

        if (req.user.role !== 'admin' && String(order.assignedTo) !== req.user.id) {
            return res.status(403).json({ message: 'Not assigned to this order.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        order.deliveryOtp = otp;
        order.deliveryOtpExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await order.save();

        const displayOrderId = order.orderId || order._id.toString().slice(-8);
        const emailRes = await sendDeliveryOtpEmail(order.userEmail, order.userName, otp, displayOrderId);
        if (!emailRes.success) {
            return res.status(500).json({ message: `Failed to send OTP: ${emailRes.error}` });
        }

        res.json({ message: 'OTP sent to customer.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to send OTP.' });
    }
});

// POST /api/delivery/orders/:id/verify-otp
router.post('/orders/:id/verify-otp', verifyToken, isDelivery, async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: 'OTP is required.' });

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (order.status === 'delivered') return res.status(400).json({ message: 'Already delivered.' });

        if (req.user.role !== 'admin' && String(order.assignedTo) !== req.user.id) {
            return res.status(403).json({ message: 'Not assigned to this order.' });
        }

        if (!order.deliveryOtp || order.deliveryOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }
        if (!order.deliveryOtpExpiry || new Date() > new Date(order.deliveryOtpExpiry)) {
            return res.status(400).json({ message: 'OTP expired. Send a new one.' });
        }

        order.status = 'delivered';
        order.deliveryOtp = null;
        order.deliveryOtpExpiry = null;
        if (order.paymentMethod === 'cod') order.paymentStatus = 'verified';
        await order.save();

        const displayOrderId = order.orderId || order._id.toString().slice(-8);
        sendOrderDeliveredEmail(order.userEmail, order.userName, displayOrderId, order.grandTotal)
            .catch(err => console.error('Failed to send delivered email:', err));

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
});

// ===== ADMIN: Delivery Partner Management =====

// GET /api/delivery/partners — list all delivery partners
router.get('/partners', verifyToken, isAdmin, async (req, res) => {
    try {
        const partners = await User.find({ role: 'delivery' }).select('-password');
        // Attach order counts
        const enriched = await Promise.all(partners.map(async (p) => {
            const total = await Order.countDocuments({ assignedTo: p._id });
            const active = await Order.countDocuments({ assignedTo: p._id, status: { $nin: ['delivered', 'cancelled'] } });
            const delivered = await Order.countDocuments({ assignedTo: p._id, status: 'delivered' });
            return { ...p.toObject(), orderCount: total, activeCount: active, deliveredCount: delivered };
        }));
        res.json(enriched);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch delivery partners.' });
    }
});

// POST /api/delivery/partners — create delivery partner
router.post('/partners', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required.' });
        }
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ message: 'Email already registered.' });

        const partner = await User.create({ name, email, password, role: 'delivery' });
        const { password: _, ...safe } = partner.toObject();
        res.status(201).json(safe);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create delivery partner.' });
    }
});

// DELETE /api/delivery/partners/:id
router.delete('/partners/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const partner = await User.findById(req.params.id);
        if (!partner || partner.role !== 'delivery') {
            return res.status(404).json({ message: 'Delivery partner not found.' });
        }
        // Unassign orders
        await Order.updateMany({ assignedTo: req.params.id }, { $set: { assignedTo: null, assignedToName: '' } });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Delivery partner removed.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove partner.' });
    }
});

// PUT /api/delivery/orders/:id/assign (admin only — assign to delivery partner)
router.put('/orders/:id/assign', verifyToken, isAdmin, async (req, res) => {
    try {
        const { partnerId } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        if (!partnerId) {
            order.assignedTo = null;
            order.assignedToName = '';
        } else {
            const partner = await User.findById(partnerId);
            if (!partner || partner.role !== 'delivery') {
                return res.status(404).json({ message: 'Delivery partner not found.' });
            }
            order.assignedTo = partner._id;
            order.assignedToName = partner.name;
        }
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Failed to assign order.' });
    }
});

export default router;
