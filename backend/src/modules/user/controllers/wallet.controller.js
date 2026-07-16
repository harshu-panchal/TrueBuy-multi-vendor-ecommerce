import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import User from '../../../models/User.model.js';
import WalletTransaction from '../../../models/WalletTransaction.model.js';
import ApiError from '../../../utils/ApiError.js';
import WithdrawRequest from '../../../models/WithdrawRequest.model.js';
import mongoose from 'mongoose';

// GET /api/user/wallet
export const getWalletBalanceAndHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('walletBalance');
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, 'User not found.'));
    }

    const transactions = await WalletTransaction.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50); // Get last 50 transactions

    res.status(200).json(
        new ApiResponse(
            200,
            {
                balance: user.walletBalance || 0,
                transactions
            },
            'Wallet fetched successfully.'
        )
    );
});

// POST /api/user/wallet/withdraw
export const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount, bankDetails } = req.body;

    if (!amount || amount <= 0) {
        throw new ApiError(400, 'Invalid amount.');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(req.user.id).session(session);
        if (!user) {
            throw new ApiError(404, 'User not found.');
        }

        if ((user.walletBalance || 0) < amount) {
            throw new ApiError(400, 'Insufficient wallet balance.');
        }

        user.walletBalance -= amount;
        await user.save({ session });

        const withdrawRequest = new WithdrawRequest({
            userType: 'user',
            userModel: 'User',
            userId: user._id,
            amount,
            bankDetails,
            status: 'pending'
        });
        await withdrawRequest.save({ session });

        const transaction = new WalletTransaction({
            user: user._id,
            amount,
            type: 'debit',
            description: `Withdrawal request for ${amount}`,
            referenceModel: 'Withdrawal',
            referenceId: withdrawRequest._id,
            balanceAfter: user.walletBalance
        });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(new ApiResponse(201, withdrawRequest, 'Withdrawal request submitted successfully.'));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});
