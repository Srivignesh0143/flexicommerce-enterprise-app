import express from 'express';
import ContactQuery from '../models/ContactQuery.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/contact - Public submission of a contact query
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required.' });
        }

        const query = await ContactQuery.create({
            name,
            email,
            subject: subject || 'No Subject',
            message
        });

        res.status(201).json({ message: 'Query submitted successfully!', query });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to submit query.' });
    }
});

// GET /api/contact - Admin only: get all contact queries
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const queries = await ContactQuery.find().sort({ createdAt: -1 });
        res.json(queries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch customer queries.' });
    }
});

// PUT /api/contact/:id - Admin only: update query status (e.g., mark as read/resolved)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['new', 'read', 'resolved'].includes(status)) {
            return res.status(400).json({ message: 'Valid status is required.' });
        }

        const query = await ContactQuery.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!query) {
            return res.status(404).json({ message: 'Query not found.' });
        }

        res.json(query);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update query.' });
    }
});

// DELETE /api/contact/:id - Admin only: delete a query
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const query = await ContactQuery.findByIdAndDelete(req.params.id);
        if (!query) {
            return res.status(404).json({ message: 'Query not found.' });
        }
        res.json({ message: 'Query deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete query.' });
    }
});

export default router;
