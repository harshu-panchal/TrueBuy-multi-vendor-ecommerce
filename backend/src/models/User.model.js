import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, index: true },
        password: { type: String, required: true, select: false },
        phone: { type: String, trim: true },
        avatar: { type: String }, // Cloudinary URL
        role: { type: String, enum: ['customer', 'delivery'], default: 'customer' },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        otp: { type: String, select: false },
        otpExpiry: { type: Date, select: false },
        deliveryOtp: { type: String, select: false },
        deliveryOtpGeneratedAt: { type: Date, select: false },
        resetOtp: { type: String, select: false },
        resetOtpExpiry: { type: Date, select: false },
        resetOtpVerified: { type: Boolean, default: false, select: false },
        refreshTokenHash: { type: String, select: false },
        refreshTokenExpiresAt: { type: Date, select: false },
        passwordResetToken: { type: String, select: false },
        passwordResetExpiry: { type: Date, select: false },
        referralCode: { type: String, unique: true, sparse: true, index: true },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        referralPoints: { type: Number, default: 0 },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

// Pre-save hook
userSchema.pre('save', async function (next) {
    if (!this.referralCode) {
        // Generate a simple unique code based on TRB + 6 random alphanumeric chars
        const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.referralCode = `TRB${randomChars}`;
    }

    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export { User };
export default User;
