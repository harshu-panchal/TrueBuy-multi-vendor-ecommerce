import mongoose from 'mongoose';

const fcmTokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true, unique: true, index: true, trim: true },
        recipientId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        recipientType: {
            type: String,
            enum: ['user', 'vendor', 'delivery', 'admin'],
            required: true,
            index: true,
        },
        platform: {
            type: String,
            enum: ['web', 'android', 'ios', 'mobile', 'unknown'],
            default: 'web',
        },
        deviceId: { type: String, trim: true, default: '' },
        appVersion: { type: String, trim: true, default: '' },
        isActive: { type: Boolean, default: true, index: true },
        lastSeenAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

fcmTokenSchema.index({ recipientType: 1, recipientId: 1, updatedAt: -1 });

const FcmToken = mongoose.model('FcmToken', fcmTokenSchema);
export default FcmToken;
