import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
    label: { type: String, required: true },   // e.g. "1 kg", "2 kg packet", "500 ml"
    price: { type: Number, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    badge: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    stock: { type: Number, default: 100 },
    pricings: { type: [pricingSchema], default: [] }, // optional multi-pricing
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
