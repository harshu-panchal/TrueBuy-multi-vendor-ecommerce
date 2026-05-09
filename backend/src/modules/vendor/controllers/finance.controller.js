import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import WithdrawRequest from '../../../models/WithdrawRequest.model.js';
import Commission from '../../../models/Commission.model.js';
import Vendor from '../../../models/Vendor.model.js';

// GET /api/vendor/finance/summary
export const getFinanceSummary = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;

    const [commissions, withdrawRequests] = await Promise.all([
        Commission.find({ vendorId, status: { $ne: 'cancelled' } }).select('vendorEarnings status'),
        WithdrawRequest.find({ userId: vendorId, userType: 'vendor' }).select('amount status'),
    ]);

    const totalEarned = commissions.reduce((sum, c) => sum + (c.vendorEarnings || 0), 0);
    const pendingCommissions = commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + (c.vendorEarnings || 0), 0);
    
    const totalWithdrawn = withdrawRequests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const pendingWithdrawal = withdrawRequests
        .filter(r => r.status === 'pending' || r.status === 'approved')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

    const withdrawableBalance = Math.max(0, pendingCommissions - pendingWithdrawal);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                totalEarned,
                pendingCommissions,
                totalWithdrawn,
                pendingWithdrawal,
                withdrawableBalance,
            },
            'Finance summary fetched.'
        )
    );
});

// POST /api/vendor/finance/withdraw-request
export const createWithdrawRequest = asyncHandler(async (req, res) => {
    const { amount, notes } = req.body;
    const vendorId = req.user.id;

    if (!amount || amount <= 0) throw new ApiError(400, 'Invalid withdrawal amount.');

    // 1. Check if vendor has enough balance
    const commissions = await Commission.find({ 
        vendorId, 
        status: 'pending' 
    }).select('vendorEarnings');
    
    const pendingEarnings = commissions.reduce((sum, c) => sum + (c.vendorEarnings || 0), 0);
    
    const pendingRequests = await WithdrawRequest.find({
        userId: vendorId,
        userType: 'vendor',
        status: { $in: ['pending', 'approved'] }
    }).select('amount');
    
    const lockedAmount = pendingRequests.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const available = pendingEarnings - lockedAmount;

    if (amount > available) {
        throw new ApiError(400, `Insufficient balance. Available: ${available}`);
    }

    // 2. Get bank details from Vendor model
    const vendor = await Vendor.findById(vendorId).select('+bankDetails');
    if (!vendor.bankDetails || !vendor.bankDetails.accountNumber) {
        throw new ApiError(400, 'Please update your bank details before requesting a withdrawal.');
    }

    const request = await WithdrawRequest.create({
        userType: 'vendor',
        userId: vendorId,
        userModel: 'Vendor',
        amount,
        notes,
        bankDetails: {
            accountName: vendor.bankDetails.accountName,
            accountNumber: vendor.bankDetails.accountNumber,
            bankName: vendor.bankDetails.bankName,
            ifscCode: vendor.bankDetails.ifscCode,
        },
    });

    res.status(201).json(new ApiResponse(201, request, 'Withdrawal request submitted successfully.'));
});

// GET /api/vendor/finance/withdraw-requests
export const getMyWithdrawRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
        WithdrawRequest.find({ userId: req.user.id, userType: 'vendor' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        WithdrawRequest.countDocuments({ userId: req.user.id, userType: 'vendor' }),
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
