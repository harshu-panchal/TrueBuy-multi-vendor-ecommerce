import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import WithdrawRequest from '../../../models/WithdrawRequest.model.js';
import Commission from '../../../models/Commission.model.js';
import Order from '../../../models/Order.model.js';
import mongoose from 'mongoose';

// GET /api/admin/finance/withdraw-requests
export const getWithdrawRequests = asyncHandler(async (req, res) => {
    const { status, userType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userType) filter.userType = userType;

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
        WithdrawRequest.find(filter)
            .populate('userId', 'name email storeName phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        WithdrawRequest.countDocuments(filter),
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

// PATCH /api/admin/finance/withdraw-requests/:id
export const updateWithdrawRequestStatus = asyncHandler(async (req, res) => {
    const { status, rejectionReason, transactionId, notes } = req.body;
    const request = await WithdrawRequest.findById(req.params.id);

    if (!request) throw new ApiError(404, 'Withdrawal request not found.');

    if (request.status === 'completed' || request.status === 'rejected') {
        throw new ApiError(400, `Cannot update request already in ${request.status} status.`);
    }

    if (status === 'rejected' && !rejectionReason) {
        throw new ApiError(400, 'Rejection reason is required.');
    }

    request.status = status;
    if (rejectionReason) request.rejectionReason = rejectionReason;
    if (transactionId) request.transactionId = transactionId;
    if (notes) request.notes = notes;
    
    if (status === 'completed') {
        request.processedAt = new Date();
        
        // If it's a vendor, we might want to mark related commissions as paid.
        // However, since withdrawal amount might not map 1:1 to orders, 
        // we usually just track the withdrawal itself.
        // But if the user wants "Paid Balance" to update, we need logic here.
        
        // Logic for Vendor:
        if (request.userType === 'vendor') {
            // Find pending commissions for this vendor and mark them as paid 
            // up to the withdrawn amount? Or just mark all that were included.
            // For simplicity, we'll just let the withdrawal request stand as the "Paid" record.
        }
    }

    await request.save();

    res.status(200).json(new ApiResponse(200, request, `Withdrawal request ${status}.`));
});

// GET /api/admin/finance/stats
export const getFinanceStats = asyncHandler(async (req, res) => {
    const [pendingVendor, pendingDelivery, totalPaid] = await Promise.all([
        WithdrawRequest.aggregate([
            { $match: { userType: 'vendor', status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        WithdrawRequest.aggregate([
            { $match: { userType: 'delivery_boy', status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        WithdrawRequest.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
    ]);

    res.status(200).json(new ApiResponse(200, {
        pendingVendorWithdrawal: pendingVendor[0]?.total || 0,
        pendingDeliveryWithdrawal: pendingDelivery[0]?.total || 0,
        totalPaidOut: totalPaid[0]?.total || 0
    }, 'Finance stats fetched.'));
});
