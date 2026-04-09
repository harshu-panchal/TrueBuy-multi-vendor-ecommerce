import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
    {
        notificationId: { type: String, required: true, unique: true, index: true, trim: true },
        channel: { type: String, enum: ['push', 'in_app', 'test'], default: 'push', index: true },
        recipientType: {
            type: String,
            enum: ['user', 'vendor', 'delivery', 'admin', 'broadcast'],
            required: true,
            index: true,
        },
        recipientId: { type: mongoose.Schema.Types.ObjectId, index: true },
        title: { type: String, required: true },
        body: { type: String, required: true },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
        tokenCount: { type: Number, default: 0 },
        sentTokenCount: { type: Number, default: 0 },
        failedTokenCount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed', 'skipped'],
            default: 'pending',
            index: true,
        },
        error: { type: String, default: '' },
        providerResponse: { type: mongoose.Schema.Types.Mixed, default: null },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
            index: { expires: 0 },
        },
    },
    { timestamps: true }
);

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);
export default NotificationLog;
