import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { adminAssignDeliveryForReturn, listReturnRequests } from '../services/return.service.js';

export const getAdminReturns = asyncHandler(async (req, res) => {
    const data = await listReturnRequests({
        filter: {},
        ...req.query,
    });
    return res.status(200).json(new ApiResponse(200, data, 'Return requests fetched.'));
});

export const assignReturnPickup = asyncHandler(async (req, res) => {
    const payload = await adminAssignDeliveryForReturn({
        returnId: req.params.id,
        adminId: req.user.id,
        deliveryBoyId: req.body.deliveryBoyId,
        note: req.body.note,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, payload, 'Delivery assigned for return pickup.'));
});

