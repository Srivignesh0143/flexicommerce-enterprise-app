import mongoose from 'mongoose';

const contactQuerySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    status: { type: String, default: 'new', enum: ['new', 'read', 'resolved'] },
}, { timestamps: true });

export default mongoose.model('ContactQuery', contactQuerySchema);
