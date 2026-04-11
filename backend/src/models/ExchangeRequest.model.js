import mongoose from 'mongoose';

export const EXCHANGE_REQUEST_STATUS = Object.freeze({
    REQUESTED: 'REQUESTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PICKUP: 'PICKUP',
    REPLACEMENT: 'REPLACEMENT',
    COMPLETED: 'COMPLETED',
});

const exchangeLogSchema = new mongoose.Schema(
    {
        status: { type: String, required: true },
        note: { type: String, trim: true, default: '' },
        actorRole: {
            type: String,
            enum: ['customer', 'vendor', 'admin', 'delivery', 'system'],
            default: 'system',
        },
        actorId: { type: mongoose.Schema.Types.ObjectId, default: null },
        meta: { type: mongoose.Schema.Types.Mixed, default: {} },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const exchangeProductSnapshotSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
        name: { type: String, trim: true, default: '' },
        image: { type: String, trim: true, default: '' },
        price: { type: Number, default: 0 },
        quantity: { type: Number, default: 1 },
        variant: { type: mongoose.Schema.Types.Mixed, default: {} },
        variantKey: { type: String, trim: true, default: '' },
    },
    { _id: false }
);

const exchangeRequestSchema = new mongoose.Schema(
    {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        oldProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        newProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        oldVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        newVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        oldProduct: { type: exchangeProductSnapshotSchema, required: true },
        newProduct: { type: exchangeProductSnapshotSchema, required: true },
        vendorMap: {
            oldVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
            newVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
            oldVendorName: { type: String, trim: true, default: '' },
            newVendorName: { type: String, trim: true, default: '' },
        },
        reason: { type: String, trim: true, required: true },
        description: { type: String, trim: true, default: '' },
        images: { type: [String], default: [] },
        status: {
            type: String,
            enum: Object.values(EXCHANGE_REQUEST_STATUS),
            default: EXCHANGE_REQUEST_STATUS.REQUESTED,
            index: true,
        },
        priceDifference: { type: Number, default: 0 },
        paymentAdjustment: {
            type: {
                type: String,
                enum: ['NONE', 'COLLECT', 'REFUND'],
                default: 'NONE',
            },
            amount: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' },
            gateway: { type: String, default: 'razorpay' },
            status: {
                type: String,
                enum: ['not_required', 'pending', 'initiated', 'paid', 'refunded', 'failed', 'manual'],
                default: 'not_required',
            },
            referenceId: { type: String, default: '' },
            notes: { type: String, trim: true, default: '' },
        },
        inventoryReserved: { type: Boolean, default: false, index: true },
        inventoryReservation: {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
            variantKey: { type: String, trim: true, default: '' },
            quantity: { type: Number, default: 1 },
            reservedAt: { type: Date, default: null },
            releasedAt: { type: Date, default: null },
            consumedAt: { type: Date, default: null },
        },
        pickupDeliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy', default: null, index: true },
        pickupProofImages: { type: [String], default: [] },
        pickupFailureReason: { type: String, trim: true, default: '' },
        pickupAttemptCount: { type: Number, default: 0 },
        pickupAt: { type: Date, default: null },
        replacementOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null, index: true },
        replacementOrderNumber: { type: String, trim: true, default: '' },
        replacementTrackingNumber: { type: String, trim: true, default: '' },
        replacementShippedAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        rejectionReason: { type: String, trim: true, default: '' },
        vendorNote: { type: String, trim: true, default: '' },
        adminNote: { type: String, trim: true, default: '' },
        exchangeWindowDays: { type: Number, default: 7 },
        logs: { type: [exchangeLogSchema], default: [] },
    },
    { timestamps: true }
);

exchangeRequestSchema.pre('validate', function (next) {
    if (!Array.isArray(this.logs)) this.logs = [];
    if (this.isNew && this.logs.length === 0) {
        this.logs.push({
            status: EXCHANGE_REQUEST_STATUS.REQUESTED,
            note: 'Exchange request created.',
            actorRole: 'system',
            actorId: this.userId || null,
            meta: {},
            createdAt: new Date(),
        });
    }
    next();
});

exchangeRequestSchema.index({ userId: 1, createdAt: -1 });
exchangeRequestSchema.index({ oldVendorId: 1, status: 1, createdAt: -1 });
exchangeRequestSchema.index({ newVendorId: 1, status: 1, createdAt: -1 });
exchangeRequestSchema.index({ orderId: 1, oldProductId: 1, newProductId: 1, userId: 1 });

const ExchangeRequest = mongoose.model('ExchangeRequest', exchangeRequestSchema);

export default ExchangeRequest;
