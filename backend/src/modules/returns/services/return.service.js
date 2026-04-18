import mongoose from 'mongoose';
import ApiError from '../../../utils/ApiError.js';
import ReturnRequest, {
    RETURN_REFUND_STATUS,
    RETURN_REQUEST_STATUS,
    normalizeStatusValue,
} from '../../../models/ReturnRequest.model.js';
import Order from '../../../models/Order.model.js';
import DeliveryBoy from '../../../models/DeliveryBoy.model.js';
import { updateReturnStatusAtomic } from './returnStatus.service.js';
import { triggerReturnNotifications } from './returnNotification.service.js';
import { logReturnInfo } from './returnLogger.service.js';
import { getStorageStatusesForCanonical } from './returnStatus.service.js';

const sanitizePaging = ({ page = 1, limit = 20 }) => {
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    return { numericPage, numericLimit };
};

const mapReturnRequest = (entry) => {
    const raw = typeof entry?.toObject === 'function' ? entry.toObject() : entry;
    return {
        ...raw,
        id: String(raw?._id || ''),
        status: normalizeStatusValue(raw?.status),
        orderId: raw?.orderId?.orderId || String(raw?.orderId?._id || raw?.orderId || ''),
        orderRefId: raw?.orderId?._id ? String(raw.orderId._id) : null,
    };
};

const openWorkflowStatuses = [
    RETURN_REQUEST_STATUS.REQUESTED,
    RETURN_REQUEST_STATUS.APPROVED_BY_VENDOR,
    RETURN_REQUEST_STATUS.PICKUP_ASSIGNED,
    RETURN_REQUEST_STATUS.PICKED_UP,
    RETURN_REQUEST_STATUS.INSPECTION_PENDING,
    RETURN_REQUEST_STATUS.COMPLETED,
    RETURN_REQUEST_STATUS.REFUND_INITIATED,
    'pending',
    'approved',
    'processing',
];

const resolveOrderByAnyIdForCustomer = async ({ orderRef, customerId }) => {
    const orFilter = [{ orderId: orderRef }];
    if (mongoose.Types.ObjectId.isValid(orderRef)) {
        orFilter.push({ _id: orderRef });
    }
    return Order.findOne({ userId: customerId, $or: orFilter });
};

const getOrderItem = (order, productId) => {
    const orderItems = Array.isArray(order?.items) ? order.items : [];
    return orderItems.find((item) => String(item?.productId || '') === String(productId));
};

export const createCustomerReturnRequest = async ({
    customerId,
    orderId,
    productId,
    reason,
    images = [],
}) => {
    const order = await resolveOrderByAnyIdForCustomer({
        orderRef: String(orderId || '').trim(),
        customerId,
    });
    if (!order) throw new ApiError(404, 'Order not found for this customer.');
    if (order.status !== 'delivered') {
        throw new ApiError(409, 'Returns can only be created for delivered orders.');
    }

    const item = getOrderItem(order, productId);
    if (!item) {
        throw new ApiError(400, 'Selected product does not belong to this order.');
    }

    const vendorId = item?.vendorId ? String(item.vendorId) : null;
    if (!vendorId) {
        throw new ApiError(400, 'Vendor information missing for this product.');
    }

    const existingOpen = await ReturnRequest.findOne({
        orderId: order._id,
        productId,
        userId: customerId,
        status: { $in: openWorkflowStatuses },
    }).lean();
    if (existingOpen) {
        throw new ApiError(409, 'An active return request already exists for this order item.');
    }

    const created = await ReturnRequest.create({
        orderId: order._id,
        productId,
        userId: customerId,
        vendorId,
        reason: String(reason || '').trim(),
        images: Array.isArray(images) ? images : [],
        status: RETURN_REQUEST_STATUS.REQUESTED,
        refundStatus: RETURN_REFUND_STATUS.PENDING,
        items: [
            {
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                reason: String(reason || '').trim(),
            },
        ],
        refundAmount: (item.price || 0) * (item.quantity || 1),
    });

    const populated = await ReturnRequest.findById(created._id)
        .populate('orderId', 'orderId status total')
        .populate('productId', 'name image')
        .populate('userId', 'name email phone')
        .populate('vendorId', 'storeName email')
        .populate('assignedDeliveryBoy', 'name email phone');

    await triggerReturnNotifications({
        eventType: 'RETURN_CREATED',
        returnRequest: populated,
        actorRole: 'customer',
    });

    logReturnInfo('Return request created', {
        returnRequestId: String(populated?._id || ''),
        customerId: String(customerId),
        productId: String(productId),
    });

    return mapReturnRequest(populated);
};

export const listReturnRequests = async ({ filter = {}, page = 1, limit = 20, status }) => {
    const { numericPage, numericLimit } = sanitizePaging({ page, limit });
    const query = { ...filter };
    if (status && status !== 'all') {
        query.status = { $in: getStorageStatusesForCanonical(status) };
    }

    const [rows, total] = await Promise.all([
        ReturnRequest.find(query)
            .populate('orderId', 'orderId status total')
            .populate('productId', 'name image price')
            .populate('userId', 'name email phone')
            .populate('vendorId', 'storeName email')
            .populate('assignedDeliveryBoy', 'name email phone')
            .sort({ createdAt: -1 })
            .skip((numericPage - 1) * numericLimit)
            .limit(numericLimit),
        ReturnRequest.countDocuments(query),
    ]);

    return {
        returnRequests: rows.map(mapReturnRequest),
        pagination: {
            total,
            page: numericPage,
            limit: numericLimit,
            pages: Math.max(1, Math.ceil(total / numericLimit)),
        },
    };
};

export const vendorReviewReturnRequest = async ({
    returnId,
    vendorId,
    approved,
    note = '',
    rejectionReason = '',
}) => {
    const nextStatus = approved
        ? RETURN_REQUEST_STATUS.APPROVED_BY_VENDOR
        : RETURN_REQUEST_STATUS.REJECTED_BY_VENDOR;
    const setFields = approved
        ? { rejectionReason: '' }
        : { rejectionReason: String(rejectionReason || note || 'Rejected by vendor').trim() };

    const updated = await updateReturnStatusAtomic({
        returnRequestId: returnId,
        actorRole: 'vendor',
        actorId: vendorId,
        targetStatus: nextStatus,
        note,
        extraFilter: { vendorId },
        setFields,
    });

    await triggerReturnNotifications({
        eventType: approved ? 'RETURN_VENDOR_APPROVED' : 'RETURN_VENDOR_REJECTED',
        returnRequest: updated,
        actorRole: 'vendor',
    });

    return mapReturnRequest(updated);
};

export const adminAssignDeliveryForReturn = async ({
    returnId,
    adminId,
    deliveryBoyId,
    note = '',
}) => {
    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).lean();
    if (!deliveryBoy) throw new ApiError(404, 'Delivery agent not found.');
    if (deliveryBoy.applicationStatus !== 'approved' || !deliveryBoy.isActive) {
        throw new ApiError(409, 'Selected delivery agent is not active.');
    }

    const updated = await updateReturnStatusAtomic({
        returnRequestId: returnId,
        actorRole: 'admin',
        actorId: adminId,
        targetStatus: RETURN_REQUEST_STATUS.PICKUP_ASSIGNED,
        note,
        setFields: {
            assignedDeliveryBoy: deliveryBoyId,
        },
    });

    await triggerReturnNotifications({
        eventType: 'RETURN_PICKUP_ASSIGNED',
        returnRequest: updated,
        actorRole: 'admin',
    });

    return mapReturnRequest(updated);
};

const deliveryAllowedStatuses = new Set([
    RETURN_REQUEST_STATUS.PICKED_UP,
    RETURN_REQUEST_STATUS.INSPECTION_PENDING,
    RETURN_REQUEST_STATUS.COMPLETED,
    RETURN_REQUEST_STATUS.REFUND_INITIATED,
    RETURN_REQUEST_STATUS.REFUND_COMPLETED,
]);

export const updateDeliveryReturnStatus = async ({
    returnId,
    deliveryBoyId,
    status,
    note = '',
}) => {
    if (!deliveryAllowedStatuses.has(status)) {
        throw new ApiError(400, `Delivery cannot set status to ${status}.`);
    }

    const nextRefundStatus =
        status === RETURN_REQUEST_STATUS.REFUND_INITIATED
            ? RETURN_REFUND_STATUS.INITIATED
            : status === RETURN_REQUEST_STATUS.REFUND_COMPLETED
                ? RETURN_REFUND_STATUS.COMPLETED
                : undefined;

    const updated = await updateReturnStatusAtomic({
        returnRequestId: returnId,
        actorRole: 'delivery',
        actorId: deliveryBoyId,
        targetStatus: status,
        note,
        extraFilter: { assignedDeliveryBoy: deliveryBoyId },
        setFields: nextRefundStatus ? { refundStatus: nextRefundStatus } : {},
    });

    await triggerReturnNotifications({
        eventType: 'RETURN_DELIVERY_UPDATED',
        returnRequest: updated,
        actorRole: 'delivery',
    });

    return mapReturnRequest(updated);
};
