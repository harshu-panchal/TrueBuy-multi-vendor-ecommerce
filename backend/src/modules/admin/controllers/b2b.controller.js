import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import mongoose from 'mongoose';
import B2BOrder from '../../../models/B2BOrder.model.js';
import Product from '../../../models/Product.model.js';
import Vendor from '../../../models/Vendor.model.js';
import DeliveryBoy from '../../../models/DeliveryBoy.model.js';
import { createNotification } from '../../../services/notification.service.js';

// GET /api/admin/b2b/orders
export const getAllB2BOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status = 'all', search = '', sellerVendorId, buyerVendorId } = req.query;
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (numericPage - 1) * numericLimit;

    const filter = { isDeleted: { $ne: true } };
    if (status && status !== 'all') filter.status = status;
    if (sellerVendorId) filter.sellerVendorId = sellerVendorId;
    if (buyerVendorId) filter.buyerVendorId = buyerVendorId;
    if (search) {
        const regex = new RegExp(String(search).trim(), 'i');
        filter.$or = [{ orderNumber: regex }];
    }

    const [orders, total] = await Promise.all([
        B2BOrder.find(filter)
            .populate('buyerVendorId', 'storeName email phone')
            .populate('sellerVendorId', 'storeName email phone')
            .populate('deliveryBoyId', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        B2BOrder.countDocuments(filter),
    ]);

    res.status(200).json(new ApiResponse(200, { orders, total, page: numericPage, pages: Math.ceil(total / numericLimit) }, 'B2B orders fetched.'));
});

// GET /api/admin/b2b/orders/:id
export const getB2BOrderById = asyncHandler(async (req, res) => {
    const id = String(req.params.id || '').trim();
    const or = [{ orderNumber: id }];
    if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });

    const order = await B2BOrder.findOne({ $or: or, isDeleted: { $ne: true } })
        .populate('buyerVendorId', 'storeName email phone address')
        .populate('sellerVendorId', 'storeName email phone address')
        .populate('deliveryBoyId', 'name phone email vehicleType vehicleNumber')
        .lean();

    if (!order) throw new ApiError(404, 'Order not found.');
    res.status(200).json(new ApiResponse(200, order, 'B2B order fetched.'));
});

// PATCH /api/admin/b2b/orders/:id/assign-delivery
export const assignB2BDeliveryBoy = asyncHandler(async (req, res) => {
    const { deliveryBoyId } = req.body;
    const id = String(req.params.id || '').trim();
    const or = [{ orderNumber: id }];
    if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).select('name isActive applicationStatus');
    if (!deliveryBoy) throw new ApiError(404, 'Delivery boy not found.');
    if (!deliveryBoy.isActive) throw new ApiError(400, 'Delivery boy is inactive.');
    if (deliveryBoy.applicationStatus !== 'approved') {
        throw new ApiError(400, 'Delivery boy is not approved.');
    }

    const order = await B2BOrder.findOne({ $or: or, isDeleted: { $ne: true } });
    if (!order) throw new ApiError(404, 'Order not found.');
    if (['rejected', 'delivered'].includes(String(order.status || ''))) {
        throw new ApiError(409, `Cannot assign delivery for ${order.status} order.`);
    }
    if (String(order.status) !== 'accepted' && String(order.status) !== 'shipped') {
        throw new ApiError(409, 'Delivery can only be assigned after seller accepts the order.');
    }

    const wasAssigned = Boolean(order.deliveryBoyId);
    order.deliveryBoyId = deliveryBoyId;
    await order.save();

    await Promise.allSettled([
        createNotification({
            recipientId: deliveryBoy._id,
            recipientType: 'delivery',
            title: wasAssigned ? 'B2B order reassigned' : 'New B2B order assigned',
            message: `${order.orderNumber} has been assigned to you.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id) },
        }),
        createNotification({
            recipientId: order.buyerVendorId,
            recipientType: 'vendor',
            title: 'Delivery assigned',
            message: `Delivery partner assigned for B2B order ${order.orderNumber}.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id), deliveryBoyId: String(deliveryBoy._id) },
        }),
        createNotification({
            recipientId: order.sellerVendorId,
            recipientType: 'vendor',
            title: 'Delivery assigned',
            message: `Delivery partner assigned for B2B order ${order.orderNumber}.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id), deliveryBoyId: String(deliveryBoy._id) },
        }),
    ]);

    res.status(200).json(new ApiResponse(200, order, 'Delivery boy assigned.'));
});

// GET /api/admin/b2b/products
export const getWholesaleProductsForApproval = asyncHandler(async (req, res) => {
    const { status = 'pending', page = 1, limit = 20, search = '', vendorId } = req.query;
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (numericPage - 1) * numericLimit;

    const filter = { isWholesale: true };
    if (status && status !== 'all') filter.wholesaleApprovalStatus = status;
    if (vendorId) filter.vendorId = vendorId;
    if (search) {
        const regex = new RegExp(String(search).trim(), 'i');
        filter.$or = [{ name: regex }, { slug: regex }];
    }

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('vendorId', 'storeName email phone')
            .sort({ wholesaleRequestedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        Product.countDocuments(filter),
    ]);

    res.status(200).json(new ApiResponse(200, { products, total, page: numericPage, pages: Math.ceil(total / numericLimit) }, 'Wholesale products fetched.'));
});

// PATCH /api/admin/b2b/products/:id/status
export const updateWholesaleProductStatus = asyncHandler(async (req, res) => {
    const { action, reason = '' } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found.');
    if (product.isWholesale !== true) throw new ApiError(400, 'Product is not a wholesale product.');

    if (action === 'reject') {
        product.wholesaleApprovalStatus = 'rejected';
        product.wholesaleRejectedAt = new Date();
        product.wholesaleRejectionReason = String(reason || '').trim();
        product.wholesaleApprovedAt = null;
        await product.save();

        await createNotification({
            recipientId: product.vendorId,
            recipientType: 'vendor',
            title: 'Wholesale product rejected',
            message: `Wholesale listing for "${product.name}" was rejected.`,
            type: 'b2b_product',
            data: { productId: String(product._id), status: 'rejected' },
        });

        return res.status(200).json(new ApiResponse(200, product, 'Wholesale product rejected.'));
    }

    product.wholesaleApprovalStatus = 'approved';
    product.wholesaleApprovedAt = new Date();
    product.wholesaleRejectedAt = null;
    product.wholesaleRejectionReason = '';
    if (!product.wholesaleRequestedAt) product.wholesaleRequestedAt = new Date();
    await product.save();

    await createNotification({
        recipientId: product.vendorId,
        recipientType: 'vendor',
        title: 'Wholesale product approved',
        message: `Wholesale listing for "${product.name}" was approved.`,
        type: 'b2b_product',
        data: { productId: String(product._id), status: 'approved' },
    });

    return res.status(200).json(new ApiResponse(200, product, 'Wholesale product approved.'));
});

// PATCH /api/admin/b2b/vendors/:id/permissions
export const updateVendorB2BPermissions = asyncHandler(async (req, res) => {
    const { canBuyWholesale, canSellWholesale } = req.body;
    const update = {};
    if (typeof canBuyWholesale !== 'undefined') update['b2bPermissions.canBuyWholesale'] = Boolean(canBuyWholesale);
    if (typeof canSellWholesale !== 'undefined') update['b2bPermissions.canSellWholesale'] = Boolean(canSellWholesale);
    if (Object.keys(update).length === 0) throw new ApiError(400, 'No permission fields provided.');

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean();
    if (!vendor) throw new ApiError(404, 'Vendor not found.');

    res.status(200).json(new ApiResponse(200, vendor, 'Vendor B2B permissions updated.'));
});

