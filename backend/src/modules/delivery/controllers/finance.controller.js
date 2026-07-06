import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import WithdrawRequest from '../../../models/WithdrawRequest.model.js';
import SubOrder from '../../../models/SubOrder.model.js';
import DeliveryBoy from '../../../models/DeliveryBoy.model.js';
import mongoose from 'mongoose';

// GET /api/delivery/finance/summary
export const getFinanceSummary = asyncHandler(async (req, res) => {
    const deliveryBoyId = req.user.id;

    const [earningsStats, withdrawRequests] = await Promise.all([
        SubOrder.aggregate([
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
                    totalEarned: { $sum: { $ifNull: ['$deliveryEarnings', 0] } },
                },
            },
        ]),
        WithdrawRequest.find({ userId: deliveryBoyId, userType: 'delivery_boy' }).select('amount status createdAt updatedAt').sort({ updatedAt: -1 }),
    ]);

    const totalEarned = earningsStats[0]?.totalEarned || 0;
    
    const completedRequests = withdrawRequests.filter(r => r.status === 'completed');
    const totalWithdrawn = completedRequests.reduce((sum, r) => sum + (r.amount || 0), 0);
    const lastWithdrawalAmount = completedRequests.length > 0 ? completedRequests[0].amount : 0;
    
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
                lastWithdrawalAmount,
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
    const earningsStats = await SubOrder.aggregate([
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
                totalEarned: { $sum: { $ifNull: ['$deliveryEarnings', 0] } },
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

    // 2. Validate bank details
    // We check if bank details were passed in the request body; if not, we use the ones from the DeliveryBoy profile
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    const finalBankDetails = bankDetails || deliveryBoy?.bankDetails;

    if (!finalBankDetails || !finalBankDetails.accountNumber) {
        throw new ApiError(400, 'Bank details are required. Please update them in your profile or provide them with the request.');
    }

    const request = await WithdrawRequest.create({
        userType: 'delivery_boy',
        userId: deliveryBoyId,
        userModel: 'DeliveryBoy',
        amount,
        notes,
        bankDetails: {
            accountName: finalBankDetails.accountHolderName || finalBankDetails.accountName || deliveryBoy?.name,
            accountNumber: finalBankDetails.accountNumber,
            bankName: finalBankDetails.bankName,
            ifscCode: finalBankDetails.ifscCode,
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
