import mongoose from 'mongoose';

const affiliateSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            unique: true,
            index: true,
        },
        company: {
            type: String,
            trim: true,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        fax: {
            type: String,
            trim: true,
            default: '',
        },
        address1: {
            type: String,
            trim: true,
            default: '',
        },
        address2: {
            type: String,
            trim: true,
            default: '',
        },
        city: {
            type: String,
            trim: true,
            default: '',
        },
        state: {
            type: String,
            trim: true,
            default: '',
        },
        country: {
            type: String,
            trim: true,
            default: 'India',
        },
        zipCode: {
            type: String,
            trim: true,
            default: '',
        },
        friendlyUrlName: {
            type: String,
            trim: true,
            index: true,
        },
        commissionRate: {
            type: Number,
            default: 5, // percentage
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        ordersCount: {
            type: Number,
            default: 0,
        },
        totalCommission: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Auto-generate friendlyUrlName if missing
affiliateSchema.pre('save', function (next) {
    if (!this.friendlyUrlName) {
        const slug = `${this.firstName}-${this.lastName}`.toLowerCase().replace(/[^a-z0-0]/g, '');
        this.friendlyUrlName = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    next();
});

const Affiliate = mongoose.model('Affiliate', affiliateSchema);
export { Affiliate };
export default Affiliate;
