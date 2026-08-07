import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email address is required'],
            trim: true,
            lowercase: true,
            unique: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        store: {
            type: String,
            default: 'Main Store',
            trim: true,
        },
        roles: {
            type: [String],
            default: ['Guest'],
        },
    },
    { timestamps: true }
);

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
export { NewsletterSubscriber };
export default NewsletterSubscriber;
