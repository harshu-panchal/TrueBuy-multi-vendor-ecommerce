import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import {
    createCustomerReturnRequest,
    listReturnRequests,
} from '../services/return.service.js';

export const createReturnRequest = asyncHandler(async (req, res) => {
    // Frontend sends `items: [{ id: '...' }]` or `items: ['...']`
    // We map it to productId if missing
    let productId = req.body.productId;
    if (!productId && Array.isArray(req.body.items) && req.body.items.length > 0) {
        productId = req.body.items[0].id || req.body.items[0];
    }

    const payload = await createCustomerReturnRequest({
        customerId: req.user.id,
        ...req.body,
        productId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, payload, 'Return request submitted successfully.'));
});

export const getMyReturnRequests = asyncHandler(async (req, res) => {
    const data = await listReturnRequests({
        filter: { userId: req.user.id },
        ...req.query,
    });

    return res.status(200).json(new ApiResponse(200, data, 'Return requests fetched.'));
});

export const getReturnRequestByOrderId = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const data = await listReturnRequests({
        filter: { userId: req.user.id, orderId },
        limit: 100 // Get all for that order
    });

    return res.status(200).json(new ApiResponse(200, data.returnRequests, 'Return requests fetched for order.'));
});

