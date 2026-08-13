import mongoose from 'mongoose';
import Counter from './Counter.js';

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    pricing: String,
    size: String,
    color: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    paymentGateway: { type: String, default: 'razorpay' },
    paymentOrderId: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
    deliveryOtp: { type: String, default: null },
    deliveryOtpExpiry: { type: Date, default: null },
    shippingAddress: {
        address: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedToName: { type: String, default: '' },
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const doc = this;
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'orderId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}${mm}${dd}`;
            
            doc.orderId = `ORD-${dateStr}-${String(counter.seq).padStart(4, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

export default mongoose.model('Order', orderSchema);
