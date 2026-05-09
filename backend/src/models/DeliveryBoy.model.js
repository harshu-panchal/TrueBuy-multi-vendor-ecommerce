import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const deliveryBoySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, select: false },
        phone: { type: String, required: true },
        address: { type: String, trim: true },
        vehicleType: { type: String, trim: true },
        vehicleNumber: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    // Format: 2 letters, 2 digits, 1-2 letters, 4 digits (e.g. MH01AB1234 or MH01A1234)
                    return !v || /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/i.test(v);
                },
                message: (props) => `${props.value} is not a valid vehicle number! Format: MH01AB1234`,
            },
        },
        avatar: { type: String },
        applicationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
        rejectionReason: { type: String, trim: true },
        documents: {
            drivingLicense: { type: String, trim: true },
            aadharCard: { type: String, trim: true },
        },
        resetOtp: { type: String, select: false },
        resetOtpExpiry: { type: Date, select: false },
        resetOtpVerified: { type: Boolean, default: false, select: false },
        refreshTokenHash: { type: String, select: false },
        refreshTokenExpiresAt: { type: Date, select: false },
        isActive: { type: Boolean, default: true },
        isAvailable: { type: Boolean, default: true },
        status: {
            type: String,
            enum: ['available', 'busy', 'offline'],
            default: 'available',
        },
        currentLocation: {
            lat: { type: Number },
            lng: { type: Number },
        },
        totalDeliveries: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        cashCollected: { type: Number, default: 0 },
        bankDetails: {
            accountHolderName: { type: String, trim: true },
            accountNumber: { type: String, trim: true },
            ifscCode: { type: String, trim: true },
            bankName: { type: String, trim: true },
        },
    },
    { timestamps: true }
);

deliveryBoySchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

deliveryBoySchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const DeliveryBoy = mongoose.model('DeliveryBoy', deliveryBoySchema);
export default DeliveryBoy;
