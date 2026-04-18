import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import ReturnRequest from '../../../models/ReturnRequest.model.js';
import Order from '../../../models/Order.model.js';
import Product from '../../../models/Product.model.js';
import Commission from '../../../models/Commission.model.js';
import User from '../../../models/User.model.js';
import Admin from '../../../models/Admin.model.js';
import { createNotification } from '../../../services/notification.service.js';

const toPlainObject = (value) => (value && typeof value.toObject === 'function' ? value.toObject() : value);

const getImageValue = (source) => {
    const obj = toPlainObject(source) || {};
    if (typeof obj.image === 'string' && obj.image) return obj.image;
    if (typeof obj.thumbnail === 'string' && obj.thumbnail) return obj.thumbnail;
    if (Array.isArray(obj.images) && obj.images.length > 0) return obj.images[0];
    return '';
};

const buildProductSnapshot = (source) => {
    const obj = toPlainObject(source) || {};
    const rawId = obj?._id ?? obj?.id ?? null;
    return {
        id: rawId ? String(rawId) : '',
        name: obj?.name || 'Unknown Product',
        price: Number(obj?.price ?? 0),
        image: getImageValue(obj),
    };
};

const enrichReturnItems = (request) => {
    const orderItems = Array.isArray(request?.orderId?.items) ? request.orderId.items : [];
    const returnItems = Array.isArray(request?.items) ? request.items : [];

    return returnItems.map((item) => {
        const itemObj = toPlainObject(item) || {};
        const itemProductSource = toPlainObject(itemObj?.product) || toPlainObject(itemObj?.productId) || null;
        const itemProductId =
            itemObj?.productId && typeof itemObj.productId === 'object'
                ? itemObj.productId?._id || itemObj.productId?.id
                : itemObj?.productId;
        const productId = String(itemProductId || '');

        const matchedOrderItem = orderItems.find(
            (orderItem) => {
                const orderProductId =
                    orderItem?.productId && typeof orderItem.productId === 'object'
                        ? orderItem.productId?._id || orderItem.productId?.id
                        : orderItem?.productId;
                return String(orderProductId || '') === productId;
            }
        );
        const orderProductSource = toPlainObject(matchedOrderItem?.productId) || null;
        const itemProduct = buildProductSnapshot(itemProductSource || orderProductSource);
        const resolvedName =
            itemObj?.name ||
            itemProductSource?.name ||
            matchedOrderItem?.name ||
            orderProductSource?.name ||
            'Unknown Product';
        const resolvedPrice = Number(
            itemObj?.price ??
                itemProductSource?.price ??
                matchedOrderItem?.price ??
                orderProductSource?.price ??
                0
        );
        const resolvedImage =
            itemObj?.image ||
            getImageValue(itemProductSource) ||
            matchedOrderItem?.image ||
            getImageValue(orderProductSource) ||
            '';

        return {
            ...itemObj,
            productId: itemProductId || itemObj?.productId || null,
            name: resolvedName,
            price: resolvedPrice,
            image: resolvedImage,
            product: {
                ...itemProduct,
                name: resolvedName,
                price: resolvedPrice,
                image: resolvedImage || itemProduct.image,
            },
        };
    });
};

const normalizeReturnRequest = (requestDoc) => {
    const request = requestDoc.toObject ? requestDoc.toObject() : requestDoc;
    const orderOrderId = request.orderId?.orderId;
    const orderRefId = request.orderId?._id ?? request.orderId ?? null;
    const productSource =
        toPlainObject(request?.product) ||
        toPlainObject(request?.productId) ||
        toPlainObject(request?.items?.[0]?.product) ||
        toPlainObject(request?.items?.[0]?.productId) ||
        null;
    const normalizedItems = enrichReturnItems(request);
    const normalizedProduct = buildProductSnapshot(productSource);

    return {
        ...request,
        id: String(request._id),
        customer: request.userId
            ? {
                name: request.userId.name ?? 'Guest',
                email: request.userId.email ?? 'N/A',
                phone: request.userId.phone ?? '',
                address:
                    request.userId.address?.fullAddress ||
                    request.userId.address?.street ||
                    request.userId.address ||
                    '',
            }
            : { name: 'Guest', email: 'N/A', phone: '', address: '' },
        orderId: orderOrderId || String(orderRefId || ''),
        orderRefId: orderRefId ? String(orderRefId) : null,
        requestDate: request.createdAt,
        rejectionReason: request.rejectionReason || request.adminNote || '',
        product: {
            ...normalizedProduct,
            name:
                normalizedProduct.name !== 'Unknown Product'
                    ? normalizedProduct.name
                    : normalizedItems?.[0]?.name || 'Unknown Product',
            price:
                normalizedProduct.price > 0
                    ? normalizedProduct.price
                    : Number(normalizedItems?.[0]?.price ?? request?.refundAmount ?? 0),
            image: normalizedProduct.image || normalizedItems?.[0]?.image || '',
        },
        items: normalizedItems,
    };
};

// GET /api/vendor/return-requests
export const getVendorReturnRequests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search = '', status } = req.query;
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.max(1, Number(limit) || 20);

    const filter = { vendorId: req.user.id };
    if (status && status !== 'all') {
        filter.status = status;
    }

    if (search) {
        const regex = new RegExp(search, 'i');
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

        const [matchedOrders, matchedUsers] = await Promise.all([
            Order.find({ orderId: regex }).select('_id').lean(),
            User.find({
                $or: [{ name: regex }, { email: regex }, { phone: regex }],
            })
                .select('_id')
                .limit(200)
                .lean(),
        ]);

        const matchedOrderIds = matchedOrders.map((o) => o._id);
        const matchedUserIds = matchedUsers.map((u) => u._id);

        const orFilters = [
            { reason: regex },
            { 'items.name': regex },
            ...(matchedOrderIds.length > 0 ? [{ orderId: { $in: matchedOrderIds } }] : []),
            ...(matchedUserIds.length > 0 ? [{ userId: { $in: matchedUserIds } }] : []),
        ];

        if (isObjectId) {
            orFilters.push({ _id: search }, { orderId: search });
        }

        filter.$or = orFilters;
    }

    const [requests, total] = await Promise.all([
        ReturnRequest.find(filter)
            .populate('userId', 'name email phone')
            .populate('productId', 'name price image images')
            .populate('items.productId', 'name price image images')
            .populate('orderId', 'orderId total items vendorItems status paymentStatus')
            .sort({ createdAt: -1 })
            .skip((numericPage - 1) * numericLimit)
            .limit(numericLimit),
        ReturnRequest.countDocuments(filter),
    ]);

    const normalized = requests.map(normalizeReturnRequest);
    res.status(200).json(
        new ApiResponse(
            200,
            {
                returnRequests: normalized,
                pagination: {
                    total,
                    page: numericPage,
                    limit: numericLimit,
                    pages: Math.ceil(total / numericLimit),
                },
            },
            'Return requests fetched.'
        )
    );
});

// GET /api/vendor/return-requests/:id
export const getVendorReturnRequestById = asyncHandler(async (req, res) => {
    const request = await ReturnRequest.findOne({
        _id: req.params.id,
        vendorId: req.user.id,
    })
        .populate('userId', 'name email phone')
        .populate('productId', 'name price image images')
        .populate('items.productId', 'name price image images')
        .populate('orderId', 'orderId total createdAt items vendorItems status paymentStatus');

    if (!request) throw new ApiError(404, 'Return request not found.');

    res.status(200).json(
        new ApiResponse(200, normalizeReturnRequest(request), 'Return request fetched.')
    );
});

// PATCH /api/vendor/return-requests/:id/status
export const updateVendorReturnRequestStatus = asyncHandler(async (req, res) => {
    const { status, refundStatus, rejectionReason } = req.body;
    const allowedStatuses = ['pending', 'approved', 'processing', 'rejected', 'completed'];
    const allowedRefundStatuses = ['pending', 'processed', 'failed'];
    const statusTransitions = {
        pending: ['approved', 'rejected'],
        approved: ['processing', 'completed'],
        processing: ['completed'],
        rejected: [],
        completed: [],
    };
    const refundTransitions = {
        pending: ['processed', 'failed'],
        failed: ['processed'],
        processed: [],
    };

    if (status && !allowedStatuses.includes(status)) {
        throw new ApiError(400, `Status must be one of: ${allowedStatuses.join(', ')}`);
    }
    if (refundStatus && !allowedRefundStatuses.includes(refundStatus)) {
        throw new ApiError(
            400,
            `Refund status must be one of: ${allowedRefundStatuses.join(', ')}`
        );
    }

    const request = await ReturnRequest.findOne({
        _id: req.params.id,
        vendorId: req.user.id,
    })
        .populate('userId', 'name email phone')
        .populate('productId', 'name price image images')
        .populate('items.productId', 'name price image images')
        .populate('orderId', 'orderId total items vendorItems status paymentStatus');
    if (!request) throw new ApiError(404, 'Return request not found.');

    const nextStatus = status || request.status;
    const nextRefundStatus = refundStatus || request.refundStatus;
    const nextRejectionReason = rejectionReason !== undefined
        ? String(rejectionReason || '').trim()
        : String(request.rejectionReason || '');
    const statusUnchanged = !status || status === request.status;
    const refundUnchanged = !refundStatus || refundStatus === request.refundStatus;
    const rejectionReasonUnchanged =
        rejectionReason === undefined || nextRejectionReason === String(request.rejectionReason || '');

    if (statusUnchanged && refundUnchanged && rejectionReasonUnchanged) {
        return res.status(200).json(
            new ApiResponse(200, normalizeReturnRequest(request), 'No changes applied.')
        );
    }

    if (status && status !== request.status) {
        const allowedNext = statusTransitions[request.status] || [];
        if (!allowedNext.includes(status)) {
            throw new ApiError(409, `Cannot move return request from ${request.status} to ${status}.`);
        }
    }

    const currentRefundStatus = request.refundStatus || 'pending';
    if (refundStatus && refundStatus !== request.refundStatus) {
        const allowedRefundNext = refundTransitions[currentRefundStatus] || [];
        if (!allowedRefundNext.includes(refundStatus)) {
            throw new ApiError(409, `Cannot move refund status from ${currentRefundStatus} to ${refundStatus}.`);
        }
    }

    request.status = nextStatus;
    if (refundStatus) request.refundStatus = nextRefundStatus;
    if (rejectionReason !== undefined) request.rejectionReason = nextRejectionReason;
    if (status !== 'rejected' && request.rejectionReason) request.rejectionReason = '';
    await request.save();

    // Keep lifecycle effects consistent when vendor processes returns.
    if (status === 'approved' || status === 'completed') {
        const linkedOrderId = request.orderId?._id || request.orderId;
        if (linkedOrderId) {
            const order = await Order.findById(linkedOrderId);
            if (order && order.isDeleted !== true) {
                const vendorGroups = Array.isArray(order.vendorItems) ? order.vendorItems : [];
                const uniqueVendorIds = [
                    ...new Set(vendorGroups.map((group) => String(group?.vendorId || '')).filter(Boolean)),
                ];
                const isSingleVendorOrder = uniqueVendorIds.length <= 1;

                if (status === 'approved' && isSingleVendorOrder && !['cancelled', 'returned'].includes(order.status)) {
                    order.status = 'returned';
                    await order.save();
                }
                if (status === 'completed') {
                    const stockRestores = (request.items || []).map(async (item) => {
                        const qty = Number(item?.quantity || 0);
                        if (!item?.productId || qty <= 0) return;
                        const product = await Product.findById(item.productId);
                        if (!product) return;
                        product.stockQuantity += qty;
                        if (product.stockQuantity <= 0) product.stock = 'out_of_stock';
                        else if (product.stockQuantity <= product.lowStockThreshold) product.stock = 'low_stock';
                        else product.stock = 'in_stock';
                        await product.save();
                    });
                    await Promise.all(stockRestores);

                    // Reverse this vendor's commission on completed return.
                    await Commission.updateMany(
                        {
                            orderId: order._id,
                            vendorId: req.user.id,
                            status: { $ne: 'cancelled' },
                        },
                        {
                            $set: {
                                status: 'cancelled',
                                paidAt: null,
                                settlementId: null,
                            },
                        }
                    );

                    // Mark full order returned/refunded only when every vendor in this order completed returns.
                    const completedReturns = await ReturnRequest.find({
                        orderId: order._id,
                        status: 'completed',
                    })
                        .select('vendorId')
                        .lean();

                    const completedVendorSet = new Set(
                        completedReturns.map((entry) => String(entry?.vendorId || '')).filter(Boolean)
                    );
                    const allVendorsCompleted =
                        uniqueVendorIds.length > 0 && uniqueVendorIds.every((vendorId) => completedVendorSet.has(vendorId));

                    if (allVendorsCompleted) {
                        if (order.status !== 'cancelled') {
                            order.status = 'returned';
                        }
                        order.paymentStatus = 'refunded';
                        await order.save();
                    }
                }
            }
        }
    }

    const notificationTasks = [
        createNotification({
            recipientId: req.user.id,
            recipientType: 'vendor',
            title: 'Return request updated',
            message: `Return request for order ${request.orderId?.orderId || request.orderId} updated.`,
            type: 'order',
            data: {
                returnRequestId: String(request._id),
                orderId: String(request.orderId?.orderId || request.orderId || ''),
                status: String(request.status),
                refundStatus: String(request.refundStatus || ''),
            },
        }),
    ];

    if (request.userId?._id) {
        notificationTasks.push(
            createNotification({
                recipientId: request.userId._id,
                recipientType: 'user',
                title: 'Return request status updated',
                message: `Your return request for order ${request.orderId?.orderId || request.orderId} is now ${request.status}.`,
                type: 'order',
                data: {
                    returnRequestId: String(request._id),
                    orderId: String(request.orderId?.orderId || request.orderId || ''),
                    status: String(request.status),
                    refundStatus: String(request.refundStatus || ''),
                },
            })
        );
    }

    const admins = await Admin.find({ isActive: true }).select('_id').lean();
    admins.forEach((admin) => {
        notificationTasks.push(
            createNotification({
                recipientId: admin._id,
                recipientType: 'admin',
                title: 'Return request updated',
                message: `Return request for order ${request.orderId?.orderId || request.orderId} moved to ${request.status}.`,
                type: 'order',
                data: {
                    returnRequestId: String(request._id),
                    orderId: String(request.orderId?.orderId || request.orderId || ''),
                    status: String(request.status),
                    refundStatus: String(request.refundStatus || ''),
                },
            })
        );
    });

    await Promise.allSettled(notificationTasks);

    res.status(200).json(
        new ApiResponse(
            200,
            normalizeReturnRequest(request),
            'Return request status updated.'
        )
    );
});
