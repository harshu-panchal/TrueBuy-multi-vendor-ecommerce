import ReturnRequest from '../../../models/ReturnRequest.model.js';
import Order from '../../../models/Order.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import WalletTransaction from '../../../models/WalletTransaction.model.js';
import User from '../../../models/User.model.js';

export const getAssignedReturns = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const query = { assignedDeliveryBoy: req.user.id };
    if (status && status !== 'all') {
        query.status = status;
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: [
            { path: 'userId', select: 'name email phone' },
            { path: 'orderId', select: 'orderId total items shippingAddress' },
            { path: 'productId', select: 'name title image price' },
            { path: 'vendorId', select: 'name storeName shopName pickupAddress address phone' },
        ],
    };

    const requests = await ReturnRequest.paginate(query, options);

    const mappedReturns = requests.docs.map(req => {
        const doc = req.toObject(); // use toObject to get plain object with populated fields
        return {
            ...doc,
            id: doc._id,
            customer: req.userId ? {
                name: req.userId.name,
                phone: req.userId.phone,
            } : null,
            vendor: req.vendorId ? {
                name: req.vendorId.name || req.vendorId.storeName,
                pickupAddress: req.vendorId.pickupAddress,
                address: req.vendorId.address,
                phone: req.vendorId.phone,
            } : null,
            pickupAddress: req.pickupAddress || (req.orderId && req.orderId.shippingAddress) || null,
        };
    });

    console.log("---- mappedReturns payload ----");
    console.dir(mappedReturns, { depth: null });

    res.status(200).json(
        new ApiResponse(200, {
            returnRequests: mappedReturns,
            pagination: {
                total: requests.totalDocs,
                page: requests.page,
                limit: requests.limit,
                pages: requests.totalPages,
            }
        }, 'Assigned returns fetched successfully')
    );
});

export const updateReturnStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    
    if (!status) {
        throw new ApiError(400, 'Status is required');
    }

    const request = await ReturnRequest.findOne({
        _id: req.params.id,
        assignedDeliveryBoy: req.user.id
    });

    if (!request) {
        throw new ApiError(404, 'Return request not found or not assigned to you');
    }

    request.status = status;
    
    // Auto-refund logic for normal returns when delivered to seller (COMPLETED)
    if (status === 'COMPLETED' && request.type !== 'exchange' && request.refundStatus === 'pending') {
        const order = await Order.findById(request.orderId);
        const user = await User.findById(request.userId);
        
        if (order && user) {
            const refundAmount = request.refundAmount || request.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Refund to wallet
            user.walletBalance = (user.walletBalance || 0) + refundAmount;
            await user.save();

            // Create Wallet Transaction
            await WalletTransaction.create({
                userId: user._id,
                type: 'credit',
                amount: refundAmount,
                description: `Refund for Return Request ${request._id}`,
                balanceAfter: user.walletBalance,
                status: 'completed',
                referenceId: request._id,
                referenceModel: 'ReturnRequest'
            });

            request.refundStatus = 'processed';
        }
    }

    request.timeline.push({
        status,
        note: note || `Status updated to ${status} by delivery partner`,
        actorRole: 'delivery',
        actorId: req.user.id,
        createdAt: new Date(),
    });

    await request.save();

    res.status(200).json(
        new ApiResponse(200, request, 'Return status updated successfully')
    );
});
