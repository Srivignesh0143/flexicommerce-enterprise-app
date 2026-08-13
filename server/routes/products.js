import express from 'express';
import Product from '../models/Product.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch products.' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch product.' });
    }
});

// POST /api/products (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, price, originalPrice, category, image, description, badge, rating, reviews, stock, isFeatured } = req.body;
        if (!name || !price || !originalPrice || !category || !image) {
            return res.status(400).json({ message: 'Name, price, originalPrice, category, and image are required.' });
        }
        const product = await Product.create({
            name, price, originalPrice, category, image,
            description: description || '',
            badge: badge || '',
            rating: rating || 0,
            reviews: reviews || 0,
            stock: stock ?? 100,
            isFeatured: !!isFeatured,
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create product.' });
    }
});

// PUT /api/products/:id (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update product.' });
    }
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete product.' });
    }
});

export default router;
