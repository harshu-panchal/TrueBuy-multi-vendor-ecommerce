import asyncHandler from '../../../utils/asyncHandler.js';
import ApiError from '../../../utils/ApiError.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { listReturnRequests, vendorReviewReturnRequest } from '../services/return.service.js';
import { normalizeStatusValue } from '../../../models/ReturnRequest.model.js';

export const getVendorReturns = asyncHandler(async (req, res) => {
    const data = await listReturnRequests({
        filter: { vendorId: req.user.id },
        ...req.query,
    });
    return res.status(200).json(new ApiResponse(200, data, 'Vendor return requests fetched.'));
});

import { updateReturnStatusAtomic } from '../services/returnStatus.service.js';

export const reviewVendorReturn = asyncHandler(async (req, res) => {
    const { action, status, note, rejectionReason } = req.body;
    
    let payload;
    // Backward compatible: frontend may send both `action` + legacy `status` ("approved"/"rejected").
    // Prefer action path so we preserve rejectionReason behavior and existing flow.
    if (action) {
        const approved = action === 'APPROVE';
        payload = await vendorReviewReturnRequest({
            returnId: req.params.id,
            vendorId: req.user.id,
            approved,
            note: note,
            rejectionReason: rejectionReason,
        });
    } else if (status) {
        const targetStatus = normalizeStatusValue(status);
        payload = await updateReturnStatusAtomic({
            returnRequestId: req.params.id,
            actorRole: 'vendor',
            actorId: req.user.id,
            targetStatus,
            note: note,
        });
    } else {
        // Defensive: validate() should prevent this, but keep a clear message in case middleware is bypassed.
        throw new ApiError(400, 'Missing required field: provide either "action" or "status".');
    }

    return res
        .status(200)
        .json(new ApiResponse(200, payload, 'Return request updated by vendor.'));
});
