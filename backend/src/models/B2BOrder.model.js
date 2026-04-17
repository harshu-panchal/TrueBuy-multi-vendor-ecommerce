import mongoose from 'mongoose';

const b2bOrderItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        sellerVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        name: { type: String, default: '' },
        image: { type: String, default: '' },
        unitPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        lineTotal: { type: Number, required: true, min: 0 },
        minOrderQty: { type: Number, default: 1, min: 1 },
        appliedTierMinQty: { type: Number, default: 0, min: 0 },
        variant: { type: mongoose.Schema.Types.Mixed, default: {} },
        variantKey: { type: String, default: '' },
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: '' },
    },
    { _id: false }
);

const paymentSchema = new mongoose.Schema(
    {
        method: { type: String, enum: ['prepaid'], default: 'prepaid' },
        provider: { type: String, default: 'manual' }, // future: wallet/credit/gateway
        referenceId: { type: String, default: '' },
        paidAt: { type: Date, default: null },
    },
    { _id: false }
);

const b2bOrderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, required: true, unique: true, index: true },
        orderType: { type: String, enum: ['B2B'], default: 'B2B', index: true },
        buyerVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        sellerVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        items: { type: [b2bOrderItemSchema], default: [] },
        subtotal: { type: Number, default: 0, min: 0 },
        totalAmount: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: 'INR' },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered'],
            default: 'pending',
            index: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'paid',
            index: true,
        },
        payment: { type: paymentSchema, default: () => ({}) },
        buyerNote: { type: String, default: '' },
        sellerNote: { type: String, default: '' },
        rejectionReason: { type: String, default: '' },
        acceptedAt: { type: Date, default: null },
        rejectedAt: { type: Date, default: null },
        shippedAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null },
        pickupAddress: { type: addressSchema, default: () => ({}) },
        shippingAddress: { type: addressSchema, default: () => ({}) },
        deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy', index: true, default: null },
        trackingNumber: { type: String, unique: true, sparse: true },
        adminNote: { type: String, default: '' },
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    },
    { timestamps: true }
);

b2bOrderSchema.index({ buyerVendorId: 1, createdAt: -1 });
b2bOrderSchema.index({ sellerVendorId: 1, createdAt: -1 });

const B2BOrder = mongoose.model('B2BOrder', b2bOrderSchema);
export { B2BOrder };
export default B2BOrder;

