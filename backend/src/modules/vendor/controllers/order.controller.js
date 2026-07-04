import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Order from '../../../models/Order.model.js';
import Commission from '../../../models/Commission.model.js';
import Settlement from '../../../models/Settlement.model.js';
import mongoose from 'mongoose';
import { createNotification } from '../../../services/notification.service.js';
import { completeExchangeAfterDelivery } from '../../exchange/services/exchange.service.js';

import SubOrder from '../../../models/SubOrder.model.js';
import { syncOrderStatusFromSubOrders } from '../../user/services/orderStatusAggregator.service.js';
import { ensureUserStaticDeliveryOtp } from '../../delivery/controllers/order.controller.js';

// GET /api/vendor/orders
export const getVendorOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.max(1, Number(limit) || 20);
    const skip = (numericPage - 1) * numericLimit;

    const filter = { vendorId: req.user.id };
    if (status && status !== 'all') {
        filter.status = status;
    }

    const subOrders = await SubOrder.find(filter)
        .populate('parentOrderId', 'orderId shippingAddress paymentMethod paymentStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numericLimit)
        .lean();
        
    const total = await SubOrder.countDocuments(filter);
    res.status(200).json(new ApiResponse(200, { orders: subOrders, total, page: numericPage, pages: Math.ceil(total / numericLimit) }, 'Orders fetched.'));
});

// GET /api/vendor/orders/:id
export const getVendorOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const idFilter = [{ subOrderId: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
        idFilter.push({ _id: id });
    }

    const subOrder = await SubOrder.findOne({
        $or: idFilter,
        vendorId: req.user.id,
    }).populate('parentOrderId', 'orderId shippingAddress paymentMethod paymentStatus userId');
    
    if (!subOrder) throw new ApiError(404, 'Order not found.');

    res.status(200).json(new ApiResponse(200, subOrder, 'Order fetched.'));
});

// PATCH /api/vendor/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'assigned_for_delivery', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);
    const transitionMap = {
        pending: ['pending', 'processing', 'cancelled'],
        processing: ['processing', 'assigned_for_delivery', 'shipped', 'cancelled'],
        assigned_for_delivery: ['assigned_for_delivery', 'shipped', 'cancelled'],
        shipped: ['shipped', 'delivered'],
        delivered: ['delivered'],
        cancelled: ['cancelled'],
    };

    const { id } = req.params;
    const idFilter = [{ subOrderId: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
        idFilter.push({ _id: id });
    }

    const subOrder = await SubOrder.findOne({
        $or: idFilter,
        vendorId: req.user.id,
    }).populate('parentOrderId');
    
    if (!subOrder) throw new ApiError(404, 'SubOrder not found.');

    const currentStatus = String(subOrder.status || 'pending');
    const allowedNextStatuses = transitionMap[currentStatus] || [];
    if (!allowedNextStatuses.includes(status)) {
        throw new ApiError(409, `Cannot move order from ${currentStatus} to ${status}.`);
    }

    subOrder.status = status;
    if (status === 'delivered') subOrder.deliveredAt = new Date();
    if (status === 'cancelled') subOrder.cancelledAt = new Date();

    if (status === 'shipped' || status === 'in-transit') {
        await ensureUserStaticDeliveryOtp(subOrder);
    }

    subOrder.statusTimeline.push({
        status,
        updatedByType: 'Vendor',
    });

    await subOrder.save();
    
    // Sync main order
    await syncOrderStatusFromSubOrders(subOrder.parentOrderId);
    
    const order = await Order.findById(subOrder.parentOrderId);

    if (status === 'delivered' && String(order.sourceType || '') === 'exchange_replacement') {
        await completeExchangeAfterDelivery({
            replacementOrderId: order._id,
            actorId: req.user.id,
            note: 'Replacement delivered via vendor workflow.',
        });
    }

    const notificationTasks = [];
    if (order && order.userId) {
        notificationTasks.push(
            createNotification({
                recipientId: order.userId,
                recipientType: 'user',
                title: 'Order item status updated',
                message: `An item in your order ${subOrder.subOrderId} is now ${status}.`,
                type: 'order',
                data: {
                    orderId: String(subOrder.subOrderId),
                    status: String(status),
                    scope: 'vendor_item',
                },
            })
        );
    }

    notificationTasks.push(
        createNotification({
            recipientId: req.user.id,
            recipientType: 'vendor',
            title: 'Order status updated',
            message: `Order ${subOrder.subOrderId} moved to ${status}.`,
            type: 'order',
            data: {
                orderId: String(subOrder.subOrderId),
                status: String(status),
            },
        })
    );

    if (notificationTasks.length > 0) {
        await Promise.allSettled(notificationTasks);
    }

    res.status(200).json(new ApiResponse(200, subOrder, 'Status updated successfully.'));
});

// GET /api/vendor/earnings
export const getEarnings = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 50,
        settlementsPage = 1,
        settlementsLimit = 50,
    } = req.query;
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.max(1, Number(limit) || 50);
    const commissionSkip = (numericPage - 1) * numericLimit;
    const numericSettlementsPage = Math.max(1, Number(settlementsPage) || 1);
    const numericSettlementsLimit = Math.max(1, Number(settlementsLimit) || 50);
    const settlementSkip = (numericSettlementsPage - 1) * numericSettlementsLimit;

    const [commissionDocs, totalCommissions, settlements, totalSettlements] = await Promise.all([
        Commission.find({ vendorId: req.user.id })
            .populate('orderId', 'orderId status')
            .sort({ createdAt: -1 })
            .skip(commissionSkip)
            .limit(numericLimit),
        Commission.countDocuments({ vendorId: req.user.id }),
        Settlement.find({ vendorId: req.user.id })
            .sort({ createdAt: -1 })
            .skip(settlementSkip)
            .limit(numericSettlementsLimit),
        Settlement.countDocuments({ vendorId: req.user.id }),
    ]);
    const allCommissionsForSummary = await Commission.find({ vendorId: req.user.id })
        .populate('orderId', 'orderId status')
        .sort({ createdAt: -1 });

    const commissions = commissionDocs.map((doc) => {
        const commission = doc.toObject();
        const orderRef = commission.orderId?._id || commission.orderId;
        const orderDisplayId = commission.orderId?.orderId || String(orderRef || '');
        const orderStatus = String(commission.orderId?.status || '').toLowerCase();
        const effectiveStatus = (orderStatus === 'cancelled' || orderStatus === 'returned')
            ? 'cancelled'
            : (String(commission.status || 'pending') === 'paid' || orderStatus === 'delivered' ? 'paid' : 'pending');
        return {
            ...commission,
            orderRef,
            orderDisplayId,
            effectiveStatus,
        };
    });

    const summary = allCommissionsForSummary.reduce((acc, doc) => {
        const c = doc.toObject();
        const status = String(c.status || 'pending');
        const orderStatus = String(c.orderId?.status || '').toLowerCase();
        const effectiveStatus = (orderStatus === 'cancelled' || orderStatus === 'returned')
            ? 'cancelled'
            : (status === 'paid' || orderStatus === 'delivered' ? 'paid' : 'pending');
        const earnings = Number(c.vendorEarnings || 0);
        const commissionAmount = Number(c.commission || 0);

        // Cancelled/Returned commissions should not contribute to active earnings totals.
        if (effectiveStatus !== 'cancelled') {
            acc.totalEarnings += earnings;
            acc.totalCommission += commissionAmount;
            acc.totalOrders += 1;
        }

        if (effectiveStatus === 'pending') acc.pendingEarnings += earnings;
        if (effectiveStatus === 'paid') acc.paidEarnings += earnings;
        if (effectiveStatus === 'cancelled') acc.cancelledEarnings += earnings;
        return acc;
    }, {
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
        cancelledEarnings: 0,
        totalCommission: 0,
        totalOrders: 0
    });

    res.status(200).json(
        new ApiResponse(
            200,
            {
                summary,
                commissions,
                settlements,
                pagination: {
                    totalCommissions,
                    page: numericPage,
                    limit: numericLimit,
                    pages: Math.max(1, Math.ceil(totalCommissions / numericLimit)),
                },
                settlementsPagination: {
                    totalSettlements,
                    page: numericSettlementsPage,
                    limit: numericSettlementsLimit,
                    pages: Math.max(1, Math.ceil(totalSettlements / numericSettlementsLimit)),
                },
            },
            'Earnings fetched.'
        )
    );
});
