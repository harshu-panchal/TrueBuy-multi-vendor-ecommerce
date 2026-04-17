import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { adminAssignDeliveryForReturn, listReturnRequests } from '../services/return.service.js';
import mongoose from 'mongoose';

export const getAdminReturns = asyncHandler(async (req, res) => {
    const data = await listReturnRequests({
        filter: {},
        ...req.query,
    });
    return res.status(200).json(new ApiResponse(200, data, 'Return requests fetched.'));
});

export const assignReturnPickup = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json(new ApiResponse(404, null, 'Return request not found.'));
    }

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

export const getAdminReturnById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json(new ApiResponse(404, null, 'Return request not found.'));
    }

    const data = await listReturnRequests({
        filter: { _id: req.params.id },
        limit: 1
    });

    if (!data.returnRequests.length) {
        return res.status(404).json(new ApiResponse(404, null, 'Return request not found.'));
    }

    return res.status(200).json(new ApiResponse(200, data.returnRequests[0], 'Return request fetched.'));
});

import { updateReturnStatusAtomic } from '../services/returnStatus.service.js';

export const updateAdminReturnStatus = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json(new ApiResponse(404, null, 'Return request not found.'));
    }

    const { status, adminNote, note, refundStatus } = req.body;
    const setFields = {};
    if (refundStatus) setFields.refundStatus = refundStatus;

    const payload = await updateReturnStatusAtomic({
        returnRequestId: req.params.id,
        actorRole: 'admin',
        actorId: req.user.id,
        targetStatus: status,
        note: adminNote || note,
        setFields
    });

    return res.status(200).json(new ApiResponse(200, payload, 'Return status updated.'));
});

