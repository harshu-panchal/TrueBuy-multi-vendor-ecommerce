import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { listReturnRequests, updateDeliveryReturnStatus } from '../services/return.service.js';

export const getAssignedReturnPickups = asyncHandler(async (req, res) => {
    const data = await listReturnRequests({
        filter: { assignedDeliveryBoy: req.user.id },
        ...req.query,
    });
    return res.status(200).json(new ApiResponse(200, data, 'Assigned return pickups fetched.'));
});

export const updateAssignedReturnStatus = asyncHandler(async (req, res) => {
    const payload = await updateDeliveryReturnStatus({
        returnId: req.params.id,
        deliveryBoyId: req.user.id,
        status: req.body.status,
        note: req.body.note,
    });
    return res.status(200).json(new ApiResponse(200, payload, 'Return pickup status updated.'));
});

