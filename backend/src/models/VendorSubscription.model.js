import mongoose from 'mongoose';

const vendorSubscriptionSchema = new mongoose.Schema(
    {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
        amountPaid: { type: Number, required: true, min: 0 },
        productLimit: { type: Number, required: true, min: 1 },
        purchaseDate: { type: Date, default: Date.now, required: true },
        expiryDate: { type: Date, required: true, index: true },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'completed',
        },
        paymentId: { type: String },
        transactionId: { type: String },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

const VendorSubscription = mongoose.model('VendorSubscription', vendorSubscriptionSchema);
export { VendorSubscription };
export default VendorSubscription;
