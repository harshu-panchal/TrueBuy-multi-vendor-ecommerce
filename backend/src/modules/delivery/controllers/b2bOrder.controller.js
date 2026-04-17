import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import mongoose from 'mongoose';
import B2BOrder from '../../../models/B2BOrder.model.js';
import { createNotification } from '../../../services/notification.service.js';

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

// GET /api/delivery/b2b/orders
export const getAssignedB2BOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = { deliveryBoyId: req.user.id, isDeleted: { $ne: true } };
    const normalized = normalizeStatus(status);

    if (normalized === 'open') {
        filter.status = { $in: ['accepted', 'shipped'] };
    } else if (normalized) {
        filter.status = normalized;
    }

    const orders = await B2BOrder.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json(new ApiResponse(200, orders, 'Assigned B2B orders fetched.'));
});

// GET /api/delivery/b2b/orders/:id
export const getB2BOrderDetail = asyncHandler(async (req, res) => {
    const id = String(req.params.id || '').trim();
    const or = [{ orderNumber: id }];
    if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });

    const order = await B2BOrder.findOne({
        $or: or,
        deliveryBoyId: req.user.id,
        isDeleted: { $ne: true },
    }).lean();

    if (!order) throw new ApiError(404, 'Order not found.');
    res.status(200).json(new ApiResponse(200, order, 'B2B order fetched.'));
});

// PATCH /api/delivery/b2b/orders/:id/status
export const updateB2BDeliveryStatus = asyncHandler(async (req, res) => {
    const id = String(req.params.id || '').trim();
    const next = normalizeStatus(req.body?.status);
    const allowed = ['shipped', 'delivered'];
    if (!allowed.includes(next)) throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);

    const or = [{ orderNumber: id }];
    if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });

    const order = await B2BOrder.findOne({
        $or: or,
        deliveryBoyId: req.user.id,
        isDeleted: { $ne: true },
    });
    if (!order) throw new ApiError(404, 'Order not found.');

    const current = normalizeStatus(order.status);
    const transitions = {
        accepted: ['shipped'],
        shipped: ['delivered'],
        delivered: [],
        rejected: [],
        pending: [],
    };
    const nextAllowed = transitions[current] || [];
    if (!nextAllowed.includes(next)) {
        throw new ApiError(409, `Cannot move order from ${current} to ${next}.`);
    }

    order.status = next;
    if (next === 'shipped') {
        order.shippedAt = new Date();
    }
    if (next === 'delivered') {
        order.deliveredAt = new Date();
    }
    await order.save();

    await Promise.allSettled([
        createNotification({
            recipientId: order.buyerVendorId,
            recipientType: 'vendor',
            title: 'B2B delivery update',
            message: `B2B order ${order.orderNumber} moved to ${next}.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id), status: String(next) },
        }),
        createNotification({
            recipientId: order.sellerVendorId,
            recipientType: 'vendor',
            title: 'B2B delivery update',
            message: `B2B order ${order.orderNumber} moved to ${next}.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id), status: String(next) },
        }),
        createNotification({
            recipientId: req.user.id,
            recipientType: 'delivery',
            title: 'B2B status updated',
            message: `B2B order ${order.orderNumber} moved to ${next}.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id), status: String(next) },
        }),
    ]);

    res.status(200).json(new ApiResponse(200, order, 'B2B delivery status updated.'));
});

