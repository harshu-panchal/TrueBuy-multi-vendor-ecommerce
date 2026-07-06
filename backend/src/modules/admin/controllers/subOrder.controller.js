import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import SubOrder from '../../../models/SubOrder.model.js';
import Order from '../../../models/Order.model.js';
import DeliveryBoy from '../../../models/DeliveryBoy.model.js';
import { syncOrderStatusFromSubOrders } from '../../user/services/orderStatusAggregator.service.js';

// GET /api/admin/suborders
export const getAllSubOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20, search, startDate, endDate, vendorId, deliveryBoyId } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 20;
    const skip = (numericPage - 1) * numericLimit;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (String(req.query.onlyUnassigned || '') === 'true') {
        filter.deliveryBoyId = null;
    }
    if (vendorId) filter.vendorId = vendorId;
    if (deliveryBoyId) filter.deliveryBoyId = deliveryBoyId;

    if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
            { subOrderId: regex },
            { vendorName: regex }
        ];
    }
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const [subOrders, total] = await Promise.all([
        SubOrder.find(filter)
            .populate('parentOrderId', 'orderId shippingAddress paymentMethod paymentStatus')
            .populate('vendorId', 'name storeName address')
            .populate('deliveryBoyId', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        SubOrder.countDocuments(filter),
    ]);

    res.status(200).json(new ApiResponse(200, {
        subOrders,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'SubOrders fetched.'));
});

// PATCH /api/admin/suborders/:id/delivery
export const assignDeliveryBoy = asyncHandler(async (req, res) => {
    const { deliveryBoyId } = req.body;
    
    const query = {
        $or: [{ subOrderId: req.params.id }]
    };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: req.params.id });
    }
    const subOrder = await SubOrder.findOne(query);
    if (!subOrder) throw new ApiError(404, 'SubOrder not found.');
    
    if (['delivered', 'cancelled', 'returned'].includes(subOrder.status)) {
        throw new ApiError(400, 'Cannot assign delivery boy to completed or cancelled orders.');
    }

    if (deliveryBoyId) {
        const boy = await DeliveryBoy.findById(deliveryBoyId);
        if (!boy) throw new ApiError(404, 'Delivery boy not found.');
        
        subOrder.deliveryBoyId = deliveryBoyId;
        subOrder.status = 'assigned_for_delivery';
        
        // Generate a 6-digit OTP for vendor pickup if not already generated
        if (!subOrder.vendorPickupOtp) {
            subOrder.vendorPickupOtp = Math.floor(100000 + Math.random() * 900000).toString();
        }

        subOrder.statusTimeline.push({
            status: subOrder.status,
            updatedByType: 'Admin',
            note: `Assigned delivery to ${boy.name}`
        });
    } else {
        subOrder.deliveryBoyId = null;
        subOrder.status = 'ready'; // Revert back to ready
        subOrder.statusTimeline.push({
            status: subOrder.status,
            updatedByType: 'Admin',
            note: 'Delivery assignment removed'
        });
    }

    await subOrder.save();
    await syncOrderStatusFromSubOrders(subOrder.parentOrderId);

    res.status(200).json(new ApiResponse(200, subOrder, 'Delivery assigned.'));
});

// PATCH /api/admin/suborders/:id/status
export const updateSubOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    const allowed = ['pending', 'processing', 'assigned_for_delivery', 'ready', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
    if (!allowed.includes(status)) throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);

    const query = {
        $or: [{ subOrderId: req.params.id }]
    };
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: req.params.id });
    }
    const subOrder = await SubOrder.findOne(query);
    if (!subOrder) throw new ApiError(404, 'SubOrder not found.');

    subOrder.status = status;
    
    if (status === 'delivered') subOrder.deliveredAt = new Date();
    if (status === 'cancelled') subOrder.cancelledAt = new Date();

    subOrder.statusTimeline.push({
        status,
        updatedByType: 'Admin',
    });

    await subOrder.save();
    await syncOrderStatusFromSubOrders(subOrder.parentOrderId);

    res.status(200).json(new ApiResponse(200, subOrder, 'Status updated.'));
});
