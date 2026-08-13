import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendPasswordResetOtpEmail } from '../utils/emailService.js';

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id || 'admin', email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Check admin credentials from env first
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = generateToken({ _id: 'admin', email, name: 'Admin', role: 'admin' });
            return res.json({
                token,
                user: { id: 'admin', name: 'Admin', email, role: 'admin' }
            });
        }

        // Check database users
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user);
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Admin from env
        if (decoded.id === 'admin') {
            return res.json({ id: 'admin', name: 'Admin', email: decoded.email, role: 'admin' });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email address.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
        await user.save();

        // Send OTP Email
        const emailRes = await sendPasswordResetOtpEmail(user.email, user.name, otp);
        if (!emailRes.success) {
            console.error('Failed to send reset OTP email:', emailRes.error);
        }

        res.json({ message: 'Password reset OTP has been sent to your registered email.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/verify-reset-otp
router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        if (new Date() > user.resetOtpExpiry) {
            return res.status(400).json({ message: 'Verification code has expired.' });
        }

        res.json({ message: 'OTP verified successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        if (new Date() > user.resetOtpExpiry) {
            return res.status(400).json({ message: 'Verification code has expired.' });
        }

        // Update password and clear OTP fields
        user.password = newPassword;
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        await user.save();

        res.json({ message: 'Password updated successfully. You can now log in.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

export default router;
