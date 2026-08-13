import express from 'express';
import Category from '../models/Category.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch categories.' });
    }
});

// POST /api/categories (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, icon, color } = req.body;
        if (!name) return res.status(400).json({ message: 'Category name is required.' });

        const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) return res.status(400).json({ message: 'Category already exists.' });

        const category = await Category.create({ name, icon: icon || 'Package', color: color || '#2563eb' });
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create category.' });
    }
});

// PUT /api/categories/:id (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: 'Category not found.' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update category.' });
    }
});

// DELETE /api/categories/:id (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found.' });
        res.json({ message: 'Category deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete category.' });
    }
});

export default router;
