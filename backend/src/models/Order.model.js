import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    variant: { type: mongoose.Schema.Types.Mixed, default: {} },
    variantKey: String,
});

const orderSchema = new mongoose.Schema(
    {
        orderId: { type: String, required: true, unique: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
        guestInfo: { name: String, email: String, phone: String },
        items: [orderItemSchema], // We keep items here for easy aggregate calculations/display, but vendor grouping moves to SubOrder
        
        shippingAddress: {
            name: String,
            email: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
            lat: Number,
            lng: Number,
        },
        paymentMethod: { type: String, enum: ['card', 'cash', 'bank', 'wallet', 'upi', 'cod'] },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentGateway: {
            type: String,
            enum: ['razorpay'],
        },
        razorpayOrderId: { type: String, index: true, sparse: true },
        razorpayPaymentId: { type: String, index: true, sparse: true },
        razorpaySignature: { type: String },
        paidAt: Date,
        
        // This status is now an aggregation of all SubOrder statuses
        status: {
            type: String,
            enum: ['pending', 'processing', 'assigned_for_delivery', 'partially_delivered', 'shipped', 'delivered', 'cancelled', 'returned'],
            default: 'pending',
            index: true,
        },
        
        subtotal: { type: Number, default: 0, min: 0 },
        shipping: { type: Number, default: 0, min: 0 },
        tax: { type: Number, default: 0, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 },
        
        couponCode: { type: String },
        couponDiscount: { type: Number, default: 0, min: 0 },
        
        idempotencyKey: { type: String, sparse: true },
        idempotencyScope: { type: String, sparse: true },
        
        sourceType: {
            type: String,
            enum: ['standard', 'exchange_replacement'],
            default: 'standard',
            index: true,
        },
        sourceReferenceId: { type: String, default: '', index: true },
        exchangeRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', default: null, index: true },
        isShadowOrder: { type: Boolean, default: false, index: true },
        
        isCashSettled: { type: Boolean, default: false },
        settledAt: Date,
        
        cancelledAt: Date,
        cancellationReason: String,
        
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: Date,
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
);

// Prevent duplicate order creation for the same retry key per actor (user/guest).
orderSchema.index(
    { idempotencyScope: 1, idempotencyKey: 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: {
            idempotencyScope: { $exists: true, $type: 'string' },
            idempotencyKey: { $exists: true, $type: 'string' },
        },
    }
);

const Order = mongoose.model('Order', orderSchema);
export { Order };
export default Order;
