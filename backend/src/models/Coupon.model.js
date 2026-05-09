import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        name: { type: String },
        type: { type: String, enum: ['percentage', 'fixed', 'freeship'], required: true },
        value: { type: Number, required: true, min: 0 },
        minOrderValue: { type: Number, default: 0 },
        maxDiscount: { type: Number }, // cap for percentage coupons
        usageLimit: { type: Number }, // null = unlimited
        usedCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        startsAt: { type: Date },
        expiresAt: { type: Date },
        countdownThreshold: { type: Number, default: 24, min: 0 },
    },
    { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export { Coupon };
export default Coupon;
