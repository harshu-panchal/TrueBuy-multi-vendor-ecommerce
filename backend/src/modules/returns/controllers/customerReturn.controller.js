import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import {
    createCustomerReturnRequest,
    listReturnRequests,
} from '../services/return.service.js';

export const createReturnRequest = asyncHandler(async (req, res) => {
    const payload = await createCustomerReturnRequest({
        customerId: req.user.id,
        ...req.body,
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

