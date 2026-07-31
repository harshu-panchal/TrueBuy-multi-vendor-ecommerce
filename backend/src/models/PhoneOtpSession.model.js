import mongoose from 'mongoose';

const phoneOtpSessionSchema = new mongoose.Schema(
    {
        phone: { type: String, required: true, unique: true, index: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Auto-delete documents after expiry (TTL index)
phoneOtpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PhoneOtpSession = mongoose.model('PhoneOtpSession', phoneOtpSessionSchema);
export { PhoneOtpSession };
export default PhoneOtpSession;
