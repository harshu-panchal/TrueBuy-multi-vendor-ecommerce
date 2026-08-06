import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        image: { type: String },
        attributes: { type: Map, of: String },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
        },
    },
    { _id: true }
);

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        items: {
            type: [cartItemSchema],
            default: [],
        },
        subtotal: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastActivity: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    { timestamps: true }
);

cartSchema.pre('save', function (next) {
    let sum = 0;
    (this.items || []).forEach((item) => {
        sum += (item.price || 0) * (item.quantity || 1);
    });
    this.subtotal = sum;
    this.totalAmount = sum;
    this.lastActivity = new Date();
    next();
});

const Cart = mongoose.model('Cart', cartSchema);
export { Cart };
export default Cart;
