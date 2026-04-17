import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { listReturnRequests, vendorReviewReturnRequest } from '../services/return.service.js';
import mongoose from 'mongoose';

export const getVendorReturns = asyncHandler(async (req, res) => {
    const data = await listReturnRequests({
        filter: { vendorId: req.user.id },
        ...req.query,
    });
    return res.status(200).json(new ApiResponse(200, data, 'Vendor return requests fetched.'));
});

import { updateReturnStatusAtomic } from '../services/returnStatus.service.js';

export const reviewVendorReturn = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json(new ApiResponse(404, null, 'Return request not found.'));
    }

    const { action, status, note, rejectionReason } = req.body;
    
    let payload;
    if (status) {
        payload = await updateReturnStatusAtomic({
            returnRequestId: req.params.id,
            actorRole: 'vendor',
            actorId: req.user.id,
            targetStatus: status,
            note: note,
        });
    } else {
        const approved = action === 'APPROVE';
        payload = await vendorReviewReturnRequest({
            returnId: req.params.id,
            vendorId: req.user.id,
            approved,
            note: note,
            rejectionReason: rejectionReason,
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, payload, 'Return request updated by vendor.'));
});

