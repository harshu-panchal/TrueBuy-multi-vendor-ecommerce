import mongoose from 'mongoose';

const b2bCartItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        sellerVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        name: { type: String, default: '' },
        image: { type: String, default: '' },
        unitPrice: { type: Number, default: 0, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        lineTotal: { type: Number, default: 0, min: 0 },
        minOrderQty: { type: Number, default: 1, min: 1 },
        appliedTierMinQty: { type: Number, default: 0, min: 0 },
        variant: { type: mongoose.Schema.Types.Mixed, default: {} },
        variantKey: { type: String, default: '' },
    },
    { _id: false }
);

const b2bCartSchema = new mongoose.Schema(
    {
        cartType: { type: String, enum: ['B2B'], default: 'B2B', index: true },
        buyerVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        sellerVendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        items: { type: [b2bCartItemSchema], default: [] },
        subtotal: { type: Number, default: 0, min: 0 },
        totalAmount: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: 'INR' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
    },
    { timestamps: true }
);

b2bCartSchema.index(
    { cartType: 1, buyerVendorId: 1, sellerVendorId: 1 },
    { unique: true }
);

const B2BCart = mongoose.model('B2BCart', b2bCartSchema);
export { B2BCart };
export default B2BCart;

