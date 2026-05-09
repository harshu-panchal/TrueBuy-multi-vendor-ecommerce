import mongoose from 'mongoose';

const withdrawRequestSchema = new mongoose.Schema(
    {
        userType: {
            type: String,
            enum: ['vendor', 'delivery_boy'],
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
            refPath: 'userModel',
        },
        userModel: {
            type: String,
            required: true,
            enum: ['Vendor', 'DeliveryBoy'],
        },
        amount: {
            type: Number,
            required: true,
            min: [1, 'Minimum withdrawal amount is 1'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending',
            index: true,
        },
        bankDetails: {
            accountName: String,
            accountNumber: String,
            bankName: String,
            ifscCode: String,
        },
        rejectionReason: String,
        transactionId: String,
        notes: String,
        processedAt: Date,
    },
    { timestamps: true }
);

const WithdrawRequest = mongoose.model('WithdrawRequest', withdrawRequestSchema);
export default WithdrawRequest;
