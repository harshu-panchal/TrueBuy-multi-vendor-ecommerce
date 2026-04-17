import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import mongoose from 'mongoose';
import B2BCart from '../../../models/B2BCart.model.js';
import B2BOrder from '../../../models/B2BOrder.model.js';
import Product from '../../../models/Product.model.js';
import Vendor from '../../../models/Vendor.model.js';
import { createNotification } from '../../../services/notification.service.js';
import { generateB2BOrderNumber } from '../services/b2bOrderNumber.service.js';
import { calculateCartTotals, calculateWholesaleUnitPrice, getWholesaleMoq } from '../services/b2bPricing.service.js';
import { ensureSufficientStock, getAvailableStock } from '../services/b2bInventory.service.js';
import {
    ensureNotSelfPurchase,
    ensureWholesaleProductVisibleToVendors,
    ensureVendorCanBuyWholesale,
    ensureVendorCanSellWholesale,
} from '../services/b2bValidation.service.js';

const buildAddressFromVendor = (vendor, fallbackName = '') => {
    const addr = vendor?.address || {};
    return {
        name: String(vendor?.storeName || vendor?.name || fallbackName || ''),
        email: String(vendor?.email || ''),
        phone: String(vendor?.phone || ''),
        address: String(addr?.street || ''),
        city: String(addr?.city || ''),
        state: String(addr?.state || ''),
        zipCode: String(addr?.zipCode || ''),
        country: String(addr?.country || ''),
    };
};

const normalizeCartItemsForOrder = async ({ cart, buyerVendorId, sellerVendorId }) => {
    const items = [];
    const productIds = (cart.items || []).map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    for (const rawItem of cart.items || []) {
        const product = productMap.get(String(rawItem.productId));
        ensureWholesaleProductVisibleToVendors(product);
        if (String(product.vendorId) !== String(sellerVendorId)) {
            throw new ApiError(400, 'Cart contains items from an invalid seller.');
        }
        ensureNotSelfPurchase({ buyerVendorId, sellerVendorId: product.vendorId });

        const qty = Math.max(1, Math.floor(Number(rawItem.quantity) || 1));
        const moq = getWholesaleMoq(product);
        if (qty < moq) throw new ApiError(400, `Minimum order quantity is ${moq}.`);

        ensureSufficientStock({ product, quantity: qty, variantKey: rawItem.variantKey });

        const { unitPrice, appliedTierMinQty } = calculateWholesaleUnitPrice({ product, quantity: qty });
        items.push({
            productId: product._id,
            sellerVendorId,
            name: String(product.name || ''),
            image: String(product.image || (Array.isArray(product.images) ? product.images[0] : '') || ''),
            unitPrice,
            quantity: qty,
            lineTotal: Number(unitPrice) * Number(qty),
            minOrderQty: moq,
            appliedTierMinQty,
            variant: rawItem.variant || {},
            variantKey: String(rawItem.variantKey || ''),
        });
    }

    if (items.length === 0) throw new ApiError(400, 'Cart is empty.');
    return items;
};

const decrementStockAtomic = async ({ session, product, quantity, variantKey = '' }) => {
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const key = String(variantKey || '').trim();

    if (!key) {
        const result = await Product.updateOne(
            { _id: product._id, stockQuantity: { $gte: qty } },
            { $inc: { stockQuantity: -qty } },
            { session }
        );
        if (result.modifiedCount !== 1) throw new ApiError(409, 'Insufficient stock for this product.');
        return;
    }

    // Variant stock map decrement (best-effort; requires key present)
    const available = getAvailableStock({ product, variantKey: key });
    if (available < qty) throw new ApiError(409, 'Insufficient stock for this product.');

    const update = { $inc: { [`variants.stockMap.${key}`]: -qty } };
    const result = await Product.updateOne(
        { _id: product._id, [`variants.stockMap.${key}`]: { $gte: qty } },
        update,
        { session }
    );
    if (result.modifiedCount !== 1) throw new ApiError(409, 'Insufficient stock for this product.');
};

// POST /api/b2b/orders
export const placeOrder = asyncHandler(async (req, res) => {
    const buyerVendorId = req.user.id;
    const { sellerVendorId, buyerNote = '' } = req.body;
    ensureNotSelfPurchase({ buyerVendorId, sellerVendorId });

    const [buyerVendor, sellerVendor, cart] = await Promise.all([
        Vendor.findById(buyerVendorId).select('b2bPermissions storeName name email phone address').lean(),
        Vendor.findById(sellerVendorId).select('b2bPermissions storeName name email phone address status isVerified').lean(),
        B2BCart.findOne({ cartType: 'B2B', buyerVendorId, sellerVendorId }),
    ]);
    ensureVendorCanBuyWholesale(buyerVendor);
    ensureVendorCanSellWholesale(sellerVendor);
    if (!cart) throw new ApiError(404, 'Cart not found.');

    const orderItems = await normalizeCartItemsForOrder({ cart, buyerVendorId, sellerVendorId });
    const totals = calculateCartTotals(orderItems);
    const orderNumber = generateB2BOrderNumber();

    const pickupAddress = buildAddressFromVendor(sellerVendor, 'Seller');
    const shippingAddress = buildAddressFromVendor(buyerVendor, 'Buyer');

    const order = await B2BOrder.create({
        orderNumber,
        orderType: 'B2B',
        buyerVendorId,
        sellerVendorId,
        items: orderItems,
        subtotal: totals.subtotal,
        totalAmount: totals.totalAmount,
        status: 'pending',
        paymentStatus: 'paid', // prepaid only (initial version)
        payment: { method: 'prepaid', provider: 'manual', paidAt: new Date() },
        buyerNote: String(buyerNote || '').trim(),
        pickupAddress,
        shippingAddress,
    });

    await cart.deleteOne();

    const [buyerDisplay, sellerDisplay] = await Promise.all([
        Vendor.findById(buyerVendorId).select('_id storeName storeLogo email phone').lean(),
        Vendor.findById(sellerVendorId).select('_id storeName storeLogo email phone').lean(),
    ]);

    await Promise.allSettled([
        createNotification({
            recipientId: sellerVendorId,
            recipientType: 'vendor',
            title: 'New wholesale order',
            message: `You received a new B2B order ${order.orderNumber}.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id) },
        }),
        createNotification({
            recipientId: buyerVendorId,
            recipientType: 'vendor',
            title: 'Wholesale order placed',
            message: `Your B2B order ${order.orderNumber} is pending seller approval.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id) },
        }),
    ]);

    const raw = typeof order?.toObject === 'function' ? order.toObject() : order;
    res.status(201).json(new ApiResponse(201, { ...raw, buyerVendor: buyerDisplay || null, sellerVendor: sellerDisplay || null }, 'B2B order placed.'));
});

// GET /api/b2b/orders
export const listOrders = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const { page = 1, limit = 20, view = 'all', status } = req.query;
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (numericPage - 1) * numericLimit;

    const filter = { isDeleted: { $ne: true } };
    if (view === 'buy') filter.buyerVendorId = vendorId;
    else if (view === 'sell') filter.sellerVendorId = vendorId;
    else filter.$or = [{ buyerVendorId: vendorId }, { sellerVendorId: vendorId }];
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
        B2BOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(numericLimit).lean(),
        B2BOrder.countDocuments(filter),
    ]);

    const vendorIds = [
        ...new Set(
            (orders || [])
                .flatMap((o) => [o?.buyerVendorId, o?.sellerVendorId])
                .map((id) => String(id || '').trim())
                .filter(Boolean)
        ),
    ];
    const vendors = vendorIds.length
        ? await Vendor.find({ _id: { $in: vendorIds } }).select('_id storeName storeLogo email phone').lean()
        : [];
    const vendorMap = new Map((vendors || []).map((v) => [String(v._id), v]));

    const enriched = (orders || []).map((o) => ({
        ...o,
        buyerVendor: vendorMap.get(String(o.buyerVendorId)) || null,
        sellerVendor: vendorMap.get(String(o.sellerVendorId)) || null,
    }));

    res.status(200).json(new ApiResponse(200, { orders: enriched, total, page: numericPage, pages: Math.ceil(total / numericLimit) }, 'B2B orders fetched.'));
});

// GET /api/b2b/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const id = String(req.params.id || '').trim();
    const or = [{ orderNumber: id }];
    if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });

    const order = await B2BOrder.findOne({
        $and: [
            { $or: or },
            { isDeleted: { $ne: true } },
            { $or: [{ buyerVendorId: vendorId }, { sellerVendorId: vendorId }] },
        ],
    }).lean();
    if (!order) throw new ApiError(404, 'Order not found.');
    const [buyerDisplay, sellerDisplay] = await Promise.all([
        Vendor.findById(order.buyerVendorId).select('_id storeName storeLogo email phone').lean(),
        Vendor.findById(order.sellerVendorId).select('_id storeName storeLogo email phone').lean(),
    ]);
    res.status(200).json(new ApiResponse(200, { ...order, buyerVendor: buyerDisplay || null, sellerVendor: sellerDisplay || null }, 'B2B order fetched.'));
});

// PATCH /api/b2b/orders/:id/respond
export const respondToOrder = asyncHandler(async (req, res) => {
    const sellerVendorId = req.user.id;
    const id = String(req.params.id || '').trim();
    const { action, reason = '' } = req.body;
    const or = [{ orderNumber: id }];
    if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });

    const order = await B2BOrder.findOne({ $or: or, sellerVendorId, isDeleted: { $ne: true } });
    if (!order) throw new ApiError(404, 'Order not found.');
    if (order.status !== 'pending') throw new ApiError(409, 'Only pending orders can be accepted or rejected.');

    const sellerVendor = await Vendor.findById(sellerVendorId).select('b2bPermissions').lean();
    ensureVendorCanSellWholesale(sellerVendor);

    if (action === 'reject') {
        order.status = 'rejected';
        order.rejectionReason = String(reason || '').trim();
        order.rejectedAt = new Date();
        await order.save();

        await Promise.allSettled([
            createNotification({
                recipientId: order.buyerVendorId,
                recipientType: 'vendor',
                title: 'Wholesale order rejected',
                message: `B2B order ${order.orderNumber} was rejected by the seller.`,
                type: 'b2b_order',
                data: { orderNumber: String(order.orderNumber), orderId: String(order._id) },
            }),
            createNotification({
                recipientId: sellerVendorId,
                recipientType: 'vendor',
                title: 'Wholesale order rejected',
                message: `You rejected B2B order ${order.orderNumber}.`,
                type: 'b2b_order',
                data: { orderNumber: String(order.orderNumber), orderId: String(order._id) },
            }),
        ]);

        return res.status(200).json(new ApiResponse(200, order, 'Order rejected.'));
    }

    // accept -> stock decrement + accepted
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const products = await Product.find({ _id: { $in: order.items.map((i) => i.productId) } }).session(session);
            const map = new Map(products.map((p) => [String(p._id), p]));

            for (const item of order.items || []) {
                const product = map.get(String(item.productId));
                ensureWholesaleProductVisibleToVendors(product?.toObject ? product.toObject() : product);
                if (String(product.vendorId) !== String(order.sellerVendorId)) {
                    throw new ApiError(400, 'Order contains invalid seller items.');
                }
                const moq = getWholesaleMoq(product);
                if (Number(item.quantity) < moq) throw new ApiError(400, `Minimum order quantity is ${moq}.`);
                ensureSufficientStock({ product, quantity: item.quantity, variantKey: item.variantKey });
                await decrementStockAtomic({ session, product, quantity: item.quantity, variantKey: item.variantKey });
            }

            order.status = 'accepted';
            order.acceptedAt = new Date();
            order.rejectionReason = '';
            await order.save({ session });
        });
    } finally {
        await session.endSession();
    }

    await Promise.allSettled([
        createNotification({
            recipientId: order.buyerVendorId,
            recipientType: 'vendor',
            title: 'Wholesale order accepted',
            message: `B2B order ${order.orderNumber} was accepted by the seller.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id), status: 'accepted' },
        }),
        createNotification({
            recipientId: sellerVendorId,
            recipientType: 'vendor',
            title: 'Wholesale order accepted',
            message: `You accepted B2B order ${order.orderNumber}.`,
            type: 'b2b_order',
            data: { orderNumber: String(order.orderNumber), orderId: String(order._id), status: 'accepted' },
        }),
    ]);

    return res.status(200).json(new ApiResponse(200, order, 'Order accepted.'));
});
