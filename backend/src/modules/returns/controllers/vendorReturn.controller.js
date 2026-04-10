import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import { listReturnRequests, vendorReviewReturnRequest } from '../services/return.service.js';

export const getVendorReturns = asyncHandler(async (req, res) => {
    const data = await listReturnRequests({
        filter: { vendorId: req.user.id },
        ...req.query,
    });
    return res.status(200).json(new ApiResponse(200, data, 'Vendor return requests fetched.'));
});

export const reviewVendorReturn = asyncHandler(async (req, res) => {
    const approved = req.body.action === 'APPROVE';
    const payload = await vendorReviewReturnRequest({
        returnId: req.params.id,
        vendorId: req.user.id,
        approved,
        note: req.body.note,
        rejectionReason: req.body.rejectionReason,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, payload, 'Return request updated by vendor.'));
});

