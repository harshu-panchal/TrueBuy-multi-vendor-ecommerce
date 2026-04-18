import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import {
    createCustomerExchangeRequest,
    getExchangeRequestById as getExchangeByIdService,
    listExchangeRequests,
    vendorReviewExchangeRequest,
    markExchangePickup,
    shipExchangeReplacement,
} from '../services/exchange.service.js';

export const createExchangeRequest = asyncHandler(async (req, res) => {
    const payload = await createCustomerExchangeRequest({
        customerId: req.user.id,
        orderId: req.body.orderId,
        oldProductId: req.body.oldProductId,
        newProductId: req.body.newProductId,
        reason: req.body.reason,
        description: req.body.description,
        images: req.body.images,
        oldVariant: req.body.oldVariant,
        newVariant: req.body.newVariant,
        exchangeWindowDays: req.body.exchangeWindowDays,
    });

    res.status(201).json(new ApiResponse(201, payload, 'Exchange request submitted successfully.'));
});

export const getExchangeRequestById = asyncHandler(async (req, res) => {
    const role = String(req.user?.role || '').toLowerCase();
    const filter = {};

    if (role === 'customer') {
        filter.userId = req.user.id;
    } else if (role === 'vendor') {
        filter.$or = [{ oldVendorId: req.user.id }, { newVendorId: req.user.id }];
    } else if (role === 'delivery') {
        filter.pickupDeliveryBoy = req.user.id;
    } else if (role !== 'admin' && role !== 'superadmin') {
        throw new ApiError(403, 'Access denied.');
    }

    const request = await getExchangeByIdService({ exchangeId: req.params.id, filter });
    res.status(200).json(new ApiResponse(200, request, 'Exchange request fetched.'));
});

export const getMyExchangeRequests = asyncHandler(async (req, res) => {
    const payload = await listExchangeRequests({
        filter: { userId: req.user.id },
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
    });

    res.status(200).json(new ApiResponse(200, payload, 'Exchange requests fetched.'));
});

export const getVendorExchangeRequests = asyncHandler(async (req, res) => {
    const payload = await listExchangeRequests({
        filter: { $or: [{ oldVendorId: req.user.id }, { newVendorId: req.user.id }] },
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
    });

    res.status(200).json(new ApiResponse(200, payload, 'Exchange requests fetched.'));
});

export const getAdminExchangeRequests = asyncHandler(async (req, res) => {
    const payload = await listExchangeRequests({
        filter: {},
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
    });

    res.status(200).json(new ApiResponse(200, payload, 'Exchange requests fetched.'));
});

export const approveExchangeRequest = asyncHandler(async (req, res) => {
    const payload = await vendorReviewExchangeRequest({
        exchangeId: req.params.id,
        vendorId: req.user.id,
        actorRole: req.user.role,
        approved: true,
        note: req.body.note,
    });
    res.status(200).json(new ApiResponse(200, payload, 'Exchange request approved.'));
});

export const rejectExchangeRequest = asyncHandler(async (req, res) => {
    const payload = await vendorReviewExchangeRequest({
        exchangeId: req.params.id,
        vendorId: req.user.id,
        actorRole: req.user.role,
        approved: false,
        note: req.body.note,
        rejectionReason: req.body.rejectionReason,
    });
    res.status(200).json(new ApiResponse(200, payload, 'Exchange request rejected.'));
});

export const pickupExchangeRequest = asyncHandler(async (req, res) => {
    const payload = await markExchangePickup({
        exchangeId: req.params.id,
        actorId: req.user.id,
        deliveryBoyId: req.body.deliveryBoyId || req.user.id,
        proofImages: req.body.proofImages,
        note: req.body.note,
        failureReason: req.body.failureReason,
        success: req.body.success,
    });
    res.status(200).json(new ApiResponse(200, payload, req.body.success ? 'Exchange pickup completed.' : 'Pickup failure recorded.'));
});

export const shipExchangeRequest = asyncHandler(async (req, res) => {
    const payload = await shipExchangeReplacement({
        exchangeId: req.params.id,
        actorId: req.user.id,
        trackingNumber: req.body.trackingNumber,
        note: req.body.note,
    });
    res.status(200).json(new ApiResponse(200, payload, 'Replacement order created.'));
});
