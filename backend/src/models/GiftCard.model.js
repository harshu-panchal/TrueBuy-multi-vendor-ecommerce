import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema(
    {
        couponCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['Virtual', 'Physical'],
            default: 'Virtual',
        },
        initialValue: {
            type: Number,
            required: true,
            min: 0,
        },
        remainingAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        isActivated: {
            type: Boolean,
            default: true,
            index: true,
        },
        recipientName: {
            type: String,
            trim: true,
        },
        recipientEmail: {
            type: String,
            lowercase: true,
            trim: true,
        },
        senderName: {
            type: String,
            trim: true,
        },
        senderEmail: {
            type: String,
            lowercase: true,
            trim: true,
        },
        message: {
            type: String,
            trim: true,
        },
        expiresAt: {
            type: Date,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

giftCardSchema.pre('validate', function (next) {
    if (this.isNew && this.remainingAmount === undefined) {
        this.remainingAmount = this.initialValue;
    }
    next();
});

const GiftCard = mongoose.model('GiftCard', giftCardSchema);
export { GiftCard };
export default GiftCard;
