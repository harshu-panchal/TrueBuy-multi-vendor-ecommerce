import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        userEmail: {
            type: String,
            trim: true,
            lowercase: true,
            index: true,
        },
        userName: {
            type: String,
            trim: true,
        },
        activityType: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
        },
        ipAddress: {
            type: String,
            default: '127.0.0.1',
        },
        isSystemAccount: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export { ActivityLog };
export default ActivityLog;
