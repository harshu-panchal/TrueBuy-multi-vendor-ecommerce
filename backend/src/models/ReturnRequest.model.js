import mongoose from 'mongoose';

const RETURN_REQUEST_STATUS = Object.freeze({
    REQUESTED: 'REQUESTED',
    APPROVED_BY_VENDOR: 'APPROVED_BY_VENDOR',
    REJECTED_BY_VENDOR: 'REJECTED_BY_VENDOR',
    PICKUP_ASSIGNED: 'PICKUP_ASSIGNED',
    PICKED_UP: 'PICKED_UP',
    INSPECTION_PENDING: 'INSPECTION_PENDING',
    COMPLETED: 'COMPLETED',
    REFUND_INITIATED: 'REFUND_INITIATED',
    REFUND_COMPLETED: 'REFUND_COMPLETED',
});

const LEGACY_STATUS_VALUES = ['pending', 'approved', 'processing', 'rejected', 'completed'];
const LEGACY_TO_NEW_STATUS = Object.freeze({
    pending: RETURN_REQUEST_STATUS.REQUESTED,
    approved: RETURN_REQUEST_STATUS.APPROVED_BY_VENDOR,
    processing: RETURN_REQUEST_STATUS.INSPECTION_PENDING,
    rejected: RETURN_REQUEST_STATUS.REJECTED_BY_VENDOR,
    completed: RETURN_REQUEST_STATUS.COMPLETED,
});

const RETURN_REFUND_STATUS = Object.freeze({
    PENDING: 'PENDING',
    INITIATED: 'INITIATED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
});

const LEGACY_REFUND_STATUS_VALUES = ['pending', 'processed', 'failed'];
const LEGACY_TO_NEW_REFUND_STATUS = Object.freeze({
    pending: RETURN_REFUND_STATUS.PENDING,
    processed: RETURN_REFUND_STATUS.COMPLETED,
    failed: RETURN_REFUND_STATUS.FAILED,
});

const normalizeStatusValue = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return RETURN_REQUEST_STATUS.REQUESTED;
    return LEGACY_TO_NEW_STATUS[raw] || raw;
};

const normalizeRefundStatusValue = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return RETURN_REFUND_STATUS.PENDING;
    return LEGACY_TO_NEW_REFUND_STATUS[raw] || raw;
};

const returnTimelineSchema = new mongoose.Schema(
    {
        status: { type: String, required: true },
        note: { type: String, trim: true, default: '' },
        actorRole: { type: String, enum: ['customer', 'vendor', 'admin', 'delivery', 'system'], default: 'system' },
        actorId: { type: mongoose.Schema.Types.ObjectId, default: null },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const returnRequestSchema = new mongoose.Schema(
    {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                name: String,
                quantity: Number,
                reason: String,
            },
        ],
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: [...Object.values(RETURN_REQUEST_STATUS), ...LEGACY_STATUS_VALUES],
            default: RETURN_REQUEST_STATUS.REQUESTED,
            index: true,
            set: normalizeStatusValue,
        },
        timeline: {
            type: [returnTimelineSchema],
            default: [],
        },
        assignedDeliveryBoy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryBoy',
            default: null,
            index: true,
        },
        refundAmount: Number,
        refundStatus: {
            type: String,
            enum: [...Object.values(RETURN_REFUND_STATUS), ...LEGACY_REFUND_STATUS_VALUES],
            default: RETURN_REFUND_STATUS.PENDING,
            set: normalizeRefundStatusValue,
        },
        adminNote: String,
        rejectionReason: String,
        images: [String],
    },
    { timestamps: true }
);

returnRequestSchema.pre('validate', function (next) {
    if (!this.productId) {
        const fallbackProductId = this.items?.[0]?.productId;
        if (fallbackProductId) this.productId = fallbackProductId;
    }

    if (!this.productId && (!Array.isArray(this.items) || this.items.length === 0)) {
        this.invalidate('productId', 'Either productId or items is required.');
    }

    if (!Array.isArray(this.timeline)) this.timeline = [];
    if (this.isNew && this.timeline.length === 0) {
        this.timeline.push({
            status: normalizeStatusValue(this.status),
            note: 'Return request created.',
            actorRole: 'system',
            actorId: this.userId || null,
            createdAt: new Date(),
        });
    }

    next();
});

returnRequestSchema.methods.getNormalizedStatus = function () {
    return normalizeStatusValue(this.status);
};

returnRequestSchema.methods.getNormalizedRefundStatus = function () {
    return normalizeRefundStatusValue(this.refundStatus);
};

returnRequestSchema.index({ userId: 1, createdAt: -1 });
returnRequestSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
returnRequestSchema.index({ assignedDeliveryBoy: 1, status: 1, createdAt: -1 });
returnRequestSchema.index({ orderId: 1, productId: 1, userId: 1 });

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
export {
    RETURN_REQUEST_STATUS,
    RETURN_REFUND_STATUS,
    LEGACY_TO_NEW_STATUS,
    LEGACY_TO_NEW_REFUND_STATUS,
    normalizeStatusValue,
    normalizeRefundStatusValue,
};
export { ReturnRequest };
export default ReturnRequest;
