import express from 'express';
import BrandingSettings from '../models/BrandingSettings.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

async function getSettings() {
    let doc = await BrandingSettings.findOne({ docId: 'singleton' });
    if (!doc) doc = await BrandingSettings.create({ docId: 'singleton' });
    return doc;
}

// GET /api/branding  — public (used by Landing page to apply theme)
router.get('/', async (req, res) => {
    try {
        const s = await getSettings();
        res.json(s);
    } catch (err) {
        console.error('[branding] GET:', err);
        res.status(500).json({ message: 'Failed to fetch branding settings.' });
    }
});

// PUT /api/branding  — admin only, saves all settings
router.put('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const updates = { ...req.body };
        // Strip protected fields
        ['_id','__v','docId','createdAt','updatedAt'].forEach(k => delete updates[k]);

        const updated = await BrandingSettings.findOneAndUpdate(
            { docId: 'singleton' },
            updates,
            { new: true, runValidators: true, upsert: true }
        );
        res.json({ message: 'Settings saved.', settings: updated });
    } catch (err) {
        console.error('[branding] PUT:', err);
        res.status(500).json({ message: 'Failed to save settings.' });
    }
});

// POST /api/branding/reset  — admin, reset to schema defaults
router.post('/reset', verifyToken, isAdmin, async (req, res) => {
    try {
        await BrandingSettings.deleteOne({ docId: 'singleton' });
        const fresh = await BrandingSettings.create({ docId: 'singleton' });
        res.json({ message: 'Reset to defaults.', settings: fresh });
    } catch (err) {
        console.error('[branding] RESET:', err);
        res.status(500).json({ message: 'Failed to reset.' });
    }
});

export default router;
