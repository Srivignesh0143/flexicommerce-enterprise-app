import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { sendDeliveryOtpEmail, sendOrderDeliveredEmail, sendOrderOutForDeliveryEmail } from '../utils/emailService.js';

const router = express.Router();

let razorpayClient = null;

const getRazorpayClient = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return null;
    }

    if (!razorpayClient) {
        razorpayClient = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    return razorpayClient;
};

const isRazorpayReady = () => {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

// POST /api/orders/razorpay/create-order (auth required)
router.post('/razorpay/create-order', verifyToken, async (req, res) => {
    try {
        if (!isRazorpayReady()) {
            return res.status(500).json({ message: 'Razorpay test credentials are not configured.' });
        }

        const { amount } = req.body;
        const amountInPaise = Number(amount);

        if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount.' });
        }

        const client = getRazorpayClient();
        if (!client) {
            return res.status(500).json({ message: 'Razorpay test credentials are not configured.' });
        }

        const order = await client.orders.create({
            amount: Math.round(amountInPaise),
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            payment_capture: 1,
        });

        return res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to create Razorpay order.' });
    }
});

// POST /api/orders/razorpay/verify (auth required)
router.post('/razorpay/verify', verifyToken, (req, res) => {
    try {
        if (!isRazorpayReady()) {
            return res.status(500).json({ message: 'Razorpay test credentials are not configured.' });
        }

        const {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
        } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ message: 'Missing Razorpay payment fields.' });
        }

        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const verified = expectedSignature === razorpaySignature;
        if (!verified) {
            return res.status(400).json({ verified: false, message: 'Invalid Razorpay signature.' });
        }

        return res.json({ verified: true });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to verify Razorpay payment.' });
    }
});

// POST /api/orders (auth required)
router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            items,
            total,
            shipping,
            grandTotal,
            shippingAddress,
            paymentMethod = 'cod',
            paymentOrderId = '',
            paymentId = '',
        } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item.' });
        }

        if (!['cod', 'online'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method.' });
        }

        const isOnline = paymentMethod === 'online';

        const order = await Order.create({
            userId: req.user.id,
            userName: req.user.name,
            userEmail: req.user.email,
            items,
            total,
            shipping,
            grandTotal,
            shippingAddress,
            paymentMethod,
            paymentGateway: isOnline ? 'razorpay' : 'cod',
            paymentStatus: isOnline ? 'verified' : 'pending',
            paymentOrderId: isOnline ? paymentOrderId : '',
            paymentId: isOnline ? paymentId : '',
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create order.' });
    }
});

// GET /api/orders (admin: all, user: own)
router.get('/', verifyToken, async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'admin') {
            orders = await Order.find().sort({ createdAt: 1 });
        } else {
            orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        }
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch orders.' });
    }
});

// PUT /api/orders/:id/status (admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (status === 'delivered') {
            return res.status(400).json({ message: 'Delivery status can only be set via OTP verification.' });
        }
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        // Send out for delivery email automatically
        if (status === 'out_for_delivery') {
            const displayOrderId = order.orderId || order._id.toString().slice(-8);
            sendOrderOutForDeliveryEmail(
                order.userEmail,
                order.userName,
                displayOrderId,
                order.shippingAddress
            ).catch(err => console.error('Failed to send out for delivery email:', err));
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update order status.' });
    }
});

// POST /api/orders/:id/send-delivery-otp (admin only)
router.post('/:id/send-delivery-otp', verifyToken, isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (order.status === 'delivered') {
            return res.status(400).json({ message: 'Order is already delivered.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        order.deliveryOtp = otp;
        order.deliveryOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await order.save();

        const displayOrderId = order.orderId || order._id.toString().slice(-8);
        const emailRes = await sendDeliveryOtpEmail(
            order.userEmail,
            order.userName,
            otp,
            displayOrderId
        );

        if (!emailRes.success) {
            console.error('Failed to send OTP email:', emailRes.error);
            return res.status(500).json({ message: `Failed to send OTP email: ${emailRes.error}` });
        }

        res.json({ message: 'Delivery verification OTP sent to customer.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send delivery OTP.' });
    }
});

// POST /api/orders/:id/verify-delivery-otp (admin only)
router.post('/:id/verify-delivery-otp', verifyToken, isAdmin, async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: 'OTP is required.' });

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (order.status === 'delivered') {
            return res.status(400).json({ message: 'Order is already delivered.' });
        }

        if (!order.deliveryOtp || order.deliveryOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }

        if (!order.deliveryOtpExpiry || new Date() > new Date(order.deliveryOtpExpiry)) {
            return res.status(400).json({ message: 'OTP has expired. Please send a new OTP.' });
        }

        // OTP is valid! Mark as delivered
        order.status = 'delivered';
        order.deliveryOtp = null;
        order.deliveryOtpExpiry = null;
        
        // If COD, also mark payment as verified
        if (order.paymentMethod === 'cod') {
            order.paymentStatus = 'verified';
        }

        await order.save();

        // Send order delivered confirmation email
        const displayOrderId = order.orderId || order._id.toString().slice(-8);
        sendOrderDeliveredEmail(
            order.userEmail,
            order.userName,
            displayOrderId,
            order.grandTotal
        ).catch(err => console.error('Failed to send delivery confirmation email:', err));

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
});

// PUT /api/orders/:id/payment (admin only)
router.put('/:id/payment', verifyToken, isAdmin, async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update payment status.' });
    }
});

export default router;
