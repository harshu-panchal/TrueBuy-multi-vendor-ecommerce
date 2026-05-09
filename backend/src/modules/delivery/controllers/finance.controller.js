import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import WithdrawRequest from '../../../models/WithdrawRequest.model.js';
import Order from '../../../models/Order.model.js';
import DeliveryBoy from '../../../models/DeliveryBoy.model.js';
import mongoose from 'mongoose';

// GET /api/delivery/finance/summary
export const getFinanceSummary = asyncHandler(async (req, res) => {
    const deliveryBoyId = req.user.id;

    const [earningsStats, withdrawRequests] = await Promise.all([
        Order.aggregate([
            {
                $match: {
                    deliveryBoyId: new mongoose.Types.ObjectId(deliveryBoyId),
                    isDeleted: { $ne: true },
                    status: 'delivered',
                },
            },
            {
                $group: {
                    _id: null,
                    totalEarned: { $sum: { $ifNull: ['$shipping', 0] } },
                },
            },
        ]),
        WithdrawRequest.find({ userId: deliveryBoyId, userType: 'delivery_boy' }).select('amount status'),
    ]);

    const totalEarned = earningsStats[0]?.totalEarned || 0;
    
    const totalWithdrawn = withdrawRequests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const pendingWithdrawal = withdrawRequests
        .filter(r => r.status === 'pending' || r.status === 'approved')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

    const withdrawableBalance = Math.max(0, totalEarned - totalWithdrawn - pendingWithdrawal);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                totalEarned,
                totalWithdrawn,
                pendingWithdrawal,
                withdrawableBalance,
            },
            'Finance summary fetched.'
        )
    );
});

// POST /api/delivery/finance/withdraw-request
export const createWithdrawRequest = asyncHandler(async (req, res) => {
    const { amount, notes, bankDetails } = req.body;
    const deliveryBoyId = req.user.id;

    if (!amount || amount <= 0) throw new ApiError(400, 'Invalid withdrawal amount.');

    // 1. Calculate available balance
    const earningsStats = await Order.aggregate([
        {
            $match: {
                deliveryBoyId: new mongoose.Types.ObjectId(deliveryBoyId),
                isDeleted: { $ne: true },
                status: 'delivered',
            },
        },
        {
            $group: {
                _id: null,
                totalEarned: { $sum: { $ifNull: ['$shipping', 0] } },
            },
        },
    ]);

    const totalEarned = earningsStats[0]?.totalEarned || 0;
    
    const withdrawRequests = await WithdrawRequest.find({ userId: deliveryBoyId, userType: 'delivery_boy' }).select('amount status');
    
    const totalWithdrawn = withdrawRequests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const pendingWithdrawal = withdrawRequests
        .filter(r => r.status === 'pending' || r.status === 'approved')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

    const available = totalEarned - totalWithdrawn - pendingWithdrawal;

    if (amount > available) {
        throw new ApiError(400, `Insufficient balance. Available: ${available}`);
    }

    // 2. Validate bank details (DeliveryBoy model might not have them, so we can take from body or add to model)
    // For now, let's assume they provide it in the request if not in model.
    if (!bankDetails || !bankDetails.accountNumber) {
        throw new ApiError(400, 'Bank details are required.');
    }

    const request = await WithdrawRequest.create({
        userType: 'delivery_boy',
        userId: deliveryBoyId,
        userModel: 'DeliveryBoy',
        amount,
        notes,
        bankDetails: {
            accountName: bankDetails.accountName,
            accountNumber: bankDetails.accountNumber,
            bankName: bankDetails.bankName,
            ifscCode: bankDetails.ifscCode,
        },
    });

    res.status(201).json(new ApiResponse(201, request, 'Withdrawal request submitted successfully.'));
});

// GET /api/delivery/finance/withdraw-requests
export const getMyWithdrawRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
        WithdrawRequest.find({ userId: req.user.id, userType: 'delivery_boy' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        WithdrawRequest.countDocuments({ userId: req.user.id, userType: 'delivery_boy' }),
    ]);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                requests,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / limit),
                },
            },
            'Withdrawal requests fetched.'
        )
    );
});
