import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import ApiError from '../../../utils/ApiError.js';
import ExchangeRequest, { EXCHANGE_REQUEST_STATUS } from '../../../models/ExchangeRequest.model.js';
import Order from '../../../models/Order.model.js';
import Product from '../../../models/Product.model.js';
import Vendor from '../../../models/Vendor.model.js';
import DeliveryBoy from '../../../models/DeliveryBoy.model.js';
import Admin from '../../../models/Admin.model.js';
import { createNotification } from '../../../services/notification.service.js';
import { createNotificationId, sendPushToRecipients } from '../../../services/fcm.service.js';
import { reserveExchangeInventory, releaseExchangeInventory, consumeExchangeInventory } from './exchangeInventory.service.js';
import { updateExchangeStatusAtomic } from './exchangeStatus.service.js';

const normalizeVariantPart = (value) => String(value || '').trim().toLowerCase();
const normalizeAxisName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '_');

const toEntries = (value) => {
    if (!value) return [];
    if (value instanceof Map) return Array.from(value.entries());
    if (typeof value === 'object') return Object.entries(value);
    return [];
};

const variantKeyFromSelection = (variant = {}, product = null) => {
    const dynamic = Object.entries(variant || {})
        .map(([axis, value]) => [normalizeAxisName(axis), normalizeVariantPart(value)])
        .filter(([axis, value]) => axis && value)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([axis, value]) => `${axis}=${value}`)
        .join('|');
    if (dynamic) return dynamic;

    const size = normalizeVariantPart(variant?.size);
    const color = normalizeVariantPart(variant?.color);
    const existing = [
        ...toEntries(product?.variants?.stockMap).map(([key]) => String(key)),
        ...toEntries(product?.variants?.prices).map(([key]) => String(key)),
    ];
    const candidates = [
        `${size}|${color}`,
        `${size}-${color}`,
        `${size}_${color}`,
        `${size}:${color}`,
        size && !color ? size : null,
        color && !size ? color : null,
    ].filter(Boolean);
    for (const candidate of candidates) {
        const exact = existing.find((key) => key === candidate);
        if (exact) return exact;
        const normalized = existing.find((key) => normalizeVariantPart(key) === normalizeVariantPart(candidate));
        if (normalized) return normalized;
    }
    return '';
};

const getRazorpayClient = () => {
    const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!keyId || !keySecret) return null;
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const mapExchangeRequest = (entry) => {
    const raw = typeof entry?.toObject === 'function' ? entry.toObject() : entry;
    return {
        ...raw,
        id: String(raw?._id || ''),
        orderId: raw?.orderId?.orderId || String(raw?.orderId?._id || raw?.orderId || ''),
        orderRefId: raw?.orderId?._id ? String(raw.orderId._id) : null,
        replacementOrderId: raw?.replacementOrderId?.orderId || String(raw?.replacementOrderId?._id || raw?.replacementOrderId || ''),
        replacementOrderRefId: raw?.replacementOrderId?._id ? String(raw.replacementOrderId._id) : null,
        oldProductId: String(raw?.oldProductId?._id || raw?.oldProductId || raw?.oldProduct?.productId || ''),
        newProductId: String(raw?.newProductId?._id || raw?.newProductId || raw?.newProduct?.productId || ''),
        oldVendorId: String(raw?.oldVendorId?._id || raw?.oldVendorId || raw?.oldProduct?.vendorId || ''),
        newVendorId: String(raw?.newVendorId?._id || raw?.newVendorId || raw?.newProduct?.vendorId || ''),
    };
};

const populateExchange = (query) =>
    query
        .populate('orderId', 'orderId status total shippingAddress createdAt deliveredAt')
        .populate('userId', 'name email phone')
        .populate('oldProductId', 'name image price vendorId')
        .populate('newProductId', 'name image price vendorId')
        .populate('oldVendorId', 'storeName email')
        .populate('newVendorId', 'storeName email')
        .populate('replacementOrderId', 'orderId status trackingNumber total deliveredAt')
        .populate('pickupDeliveryBoy', 'name email phone');

const notifyExchange = async ({ eventType, exchangeRequest, title, body, data = {} }) => {
    const exchangeId = String(exchangeRequest?._id || '');
    const orderDisplay = exchangeRequest?.orderId?.orderId || String(exchangeRequest?.orderId || '');
    const recipients = [];
    if (exchangeRequest?.userId) recipients.push({ recipientId: exchangeRequest.userId._id || exchangeRequest.userId, recipientType: 'user' });
    if (exchangeRequest?.oldVendorId) recipients.push({ recipientId: exchangeRequest.oldVendorId._id || exchangeRequest.oldVendorId, recipientType: 'vendor' });
    if (exchangeRequest?.newVendorId && String(exchangeRequest?.newVendorId?._id || exchangeRequest.newVendorId) !== String(exchangeRequest?.oldVendorId?._id || exchangeRequest.oldVendorId)) {
        recipients.push({ recipientId: exchangeRequest.newVendorId._id || exchangeRequest.newVendorId, recipientType: 'vendor' });
    }
    if (exchangeRequest?.pickupDeliveryBoy) recipients.push({ recipientId: exchangeRequest.pickupDeliveryBoy._id || exchangeRequest.pickupDeliveryBoy, recipientType: 'delivery' });

    const admins = await Admin.find({ isActive: true }).select('_id').lean();
    admins.forEach((admin) => recipients.push({ recipientId: admin._id, recipientType: 'admin' }));

    await Promise.allSettled(recipients.map((recipient) => createNotification({
        recipientId: recipient.recipientId,
        recipientType: recipient.recipientType,
        title,
        message: body,
        type: 'order',
        data: {
            exchangeRequestId: exchangeId,
            orderId: String(orderDisplay || ''),
            eventType,
            ...Object.fromEntries(Object.entries(data || {}).map(([key, value]) => [key, String(value)])),
        },
    })));

    const notificationId = createNotificationId({
        recipientType: 'exchange',
        recipientId: exchangeId,
        title,
        body,
        data: { exchangeRequestId: exchangeId, orderId: String(orderDisplay || ''), eventType, ...data },
        key: eventType,
    });

    await sendPushToRecipients({
        notificationId,
        recipients,
        title,
        body,
        data: { exchangeRequestId: exchangeId, orderId: String(orderDisplay || ''), eventType, ...data },
        type: 'order',
        recipientType: 'broadcast',
    });
};

const calculatePriceDifference = ({ oldItem, newProduct, quantity }) => {
    const oldAmount = Number(oldItem?.price || 0) * Number(quantity || 1);
    const newAmount = Number(newProduct?.price || 0) * Number(quantity || 1);
    return Number((newAmount - oldAmount).toFixed(2));
};

const buildPaymentAdjustment = ({ priceDifference, order, exchangeId }) => {
    if (!priceDifference) {
        return { type: 'NONE', amount: 0, currency: 'INR', gateway: 'razorpay', status: 'not_required', referenceId: '', notes: '' };
    }
    if (priceDifference > 0) {
        return {
            type: 'COLLECT',
            amount: priceDifference,
            currency: 'INR',
            gateway: 'razorpay',
            status: 'pending',
            referenceId: `exc_${String(exchangeId).slice(-20)}`,
            notes: 'Collect price difference before release.',
        };
    }
    const paymentId = String(order?.razorpayPaymentId || '').trim();
    return {
        type: 'REFUND',
        amount: Math.abs(priceDifference),
        currency: 'INR',
        gateway: 'razorpay',
        status: paymentId ? 'pending' : 'manual',
        referenceId: paymentId,
        notes: paymentId ? 'Refund to original payment method.' : 'Manual refund required.',
    };
};

const resolveOrderByCustomer = async ({ orderRef, customerId }) => {
    const filter = { userId: customerId, $or: [{ orderId: orderRef }] };
    if (mongoose.Types.ObjectId.isValid(orderRef)) filter.$or.push({ _id: orderRef });
    return Order.findOne(filter);
};

const resolveOrderByAny = async (orderRef) => {
    const filter = { $or: [{ orderId: orderRef }] };
    if (mongoose.Types.ObjectId.isValid(orderRef)) filter.$or.push({ _id: orderRef });
    return Order.findOne(filter);
};

const getOrderItem = (order, productId) => {
    const orderItems = Array.isArray(order?.items) ? order.items : [];
    const match = orderItems.find((item) => String(item?.productId || '') === String(productId || ''));
    if (!match) throw new ApiError(400, 'Selected product does not belong to this order.');
    return match;
};

export const getExchangeRequestById = async ({ exchangeId, filter = {} }) => {
    const request = await populateExchange(ExchangeRequest.findOne({ _id: exchangeId, ...filter }));
    if (!request) throw new ApiError(404, 'Exchange request not found.');
    return mapExchangeRequest(request);
};

export const listExchangeRequests = async ({ filter = {}, page = 1, limit = 20, status }) => {
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const query = { ...filter };
    if (status && status !== 'all') {
        query.status = status;
    }

    const [rows, total] = await Promise.all([
        populateExchange(
            ExchangeRequest.find(query)
        ).sort({ createdAt: -1 }).skip((numericPage - 1) * numericLimit).limit(numericLimit),
        ExchangeRequest.countDocuments(query),
    ]);

    return {
        exchangeRequests: rows.map(mapExchangeRequest),
        pagination: {
            total,
            page: numericPage,
            limit: numericLimit,
            pages: Math.max(1, Math.ceil(total / numericLimit)),
        },
    };
};

export const createCustomerExchangeRequest = async ({
    customerId,
    orderId,
    oldProductId,
    newProductId,
    reason,
    description = '',
    images = [],
    oldVariant = {},
    newVariant = {},
    exchangeWindowDays = 7,
}) => {
    const order = await resolveOrderByCustomer({ orderRef: String(orderId || '').trim(), customerId });
    if (!order) throw new ApiError(404, 'Order not found for this customer.');
    if (String(order.status || '').toLowerCase() !== 'delivered') {
        throw new ApiError(409, 'Exchanges can only be requested for delivered orders.');
    }

    const orderItem = getOrderItem(order, oldProductId);
    const requestedWindow = Math.max(1, Number(exchangeWindowDays) || 7);
    const anchorDate = order.deliveredAt || order.updatedAt || order.createdAt;
    const deadline = new Date(new Date(anchorDate).getTime() + requestedWindow * 24 * 60 * 60 * 1000);
    if (Date.now() > deadline.getTime()) {
        throw new ApiError(409, 'Exchange window has expired for this order item.');
    }

    const oldProduct = await Product.findById(oldProductId).populate('vendorId', 'storeName email').lean();
    if (!oldProduct) throw new ApiError(404, 'Original product not found.');
    const newProduct = await Product.findById(newProductId).populate('vendorId', 'storeName email').lean();
    if (!newProduct) throw new ApiError(404, 'Replacement product not found.');

    const oldVendorId = String(orderItem.vendorId || oldProduct.vendorId?._id || oldProduct.vendorId || '');
    const newVendorId = String(newProduct.vendorId?._id || newProduct.vendorId || '');
    if (!oldVendorId || !newVendorId) throw new ApiError(400, 'Unable to resolve vendor mapping.');

    const existingOpen = await ExchangeRequest.findOne({
        orderId: order._id,
        oldProductId,
        userId: customerId,
        status: { $in: [EXCHANGE_REQUEST_STATUS.REQUESTED, EXCHANGE_REQUEST_STATUS.APPROVED, EXCHANGE_REQUEST_STATUS.PICKUP, EXCHANGE_REQUEST_STATUS.REPLACEMENT] },
    }).lean();
    if (existingOpen) throw new ApiError(409, 'An active exchange request already exists for this order item.');

    const session = await mongoose.startSession();
    let created = null;
    try {
        await session.withTransaction(async () => {
            const reserve = await reserveExchangeInventory({
                productId: newProductId,
                quantity: Number(orderItem.quantity || 1),
                variant: newVariant,
                session,
            });

            const priceDifference = calculatePriceDifference({ oldItem: orderItem, newProduct, quantity: Number(orderItem.quantity || 1) });
            const [doc] = await ExchangeRequest.create([{
                orderId: order._id,
                userId: customerId,
                oldProductId,
                newProductId,
                oldVendorId,
                newVendorId,
                oldProduct: {
                    productId: oldProduct._id,
                    vendorId: oldVendorId,
                    name: oldProduct.name || '',
                    image: oldProduct.image || oldProduct.images?.[0] || '',
                    price: Number(orderItem.price || oldProduct.price || 0),
                    quantity: Number(orderItem.quantity || 1),
                    variant: oldVariant || orderItem.variant || {},
                    variantKey: String(orderItem.variantKey || ''),
                },
                newProduct: {
                    productId: newProduct._id,
                    vendorId: newVendorId,
                    name: newProduct.name || '',
                    image: newProduct.image || newProduct.images?.[0] || '',
                    price: Number(newProduct.price || 0),
                    quantity: Number(orderItem.quantity || 1),
                    variant: newVariant || {},
                    variantKey: reserve.reservation.variantKey || variantKeyFromSelection(newVariant, newProduct),
                },
                vendorMap: {
                    oldVendorId,
                    newVendorId,
                    oldVendorName: oldProduct.vendorId?.storeName || '',
                    newVendorName: newProduct.vendorId?.storeName || '',
                },
                reason: String(reason || '').trim(),
                description: String(description || '').trim(),
                images: Array.isArray(images) ? images : [],
                priceDifference,
                paymentAdjustment: buildPaymentAdjustment({ priceDifference, order, exchangeId: null }),
                inventoryReserved: true,
                inventoryReservation: {
                    productId: reserve.reservation.productId,
                    variantKey: reserve.reservation.variantKey,
                    quantity: reserve.reservation.quantity,
                    reservedAt: reserve.reservation.reservedAt,
                    releasedAt: null,
                    consumedAt: null,
                },
                exchangeWindowDays: requestedWindow,
            }], { session });
            created = doc;
        });
    } catch (error) {
        throw error;
    } finally {
        await session.endSession();
    }

    const populated = await populateExchange(ExchangeRequest.findById(created._id));
    await notifyExchange({
        eventType: 'EXCHANGE_CREATED',
        exchangeRequest: populated,
        title: 'Exchange request submitted',
        body: `Exchange request for order ${order.orderId} is awaiting review.`,
        data: { status: EXCHANGE_REQUEST_STATUS.REQUESTED },
    });

    return mapExchangeRequest(populated);
};

export const vendorReviewExchangeRequest = async ({
    exchangeId,
    vendorId,
    actorRole = 'vendor',
    approved,
    note = '',
    rejectionReason = '',
}) => {
    const isAdminOverride = ['admin', 'superadmin'].includes(String(actorRole || '').toLowerCase());
    const request = await ExchangeRequest.findOne(
        isAdminOverride
            ? { _id: exchangeId }
            : {
                  _id: exchangeId,
                  $or: [{ oldVendorId: vendorId }, { newVendorId: vendorId }],
              }
    );
    if (!request) throw new ApiError(404, 'Exchange request not found.');

    if (!approved) {
        await releaseExchangeInventory({
            productId: request.newProductId,
            quantity: Number(request.newProduct?.quantity || 1),
            variantKey: String(request.inventoryReservation?.variantKey || ''),
        });
        const updated = await updateExchangeStatusAtomic({
            exchangeRequestId: request._id,
            actorRole,
            actorId: vendorId,
            targetStatus: EXCHANGE_REQUEST_STATUS.REJECTED,
            note,
            extraFilter: isAdminOverride ? {} : { $or: [{ oldVendorId: vendorId }, { newVendorId: vendorId }] },
            setFields: {
                rejectionReason: String(rejectionReason || note || 'Rejected by vendor').trim(),
                inventoryReserved: false,
                'inventoryReservation.releasedAt': new Date(),
            },
            logMeta: { approved: false },
        });
        await notifyExchange({
            eventType: 'EXCHANGE_REJECTED',
            exchangeRequest: updated,
            title: 'Exchange request rejected',
            body: `Exchange request for order ${updated.orderId?.orderId || updated.orderId} was rejected.`,
            data: { status: EXCHANGE_REQUEST_STATUS.REJECTED },
        });
        return mapExchangeRequest(updated);
    }

    const updated = await updateExchangeStatusAtomic({
        exchangeRequestId: request._id,
        actorRole,
        actorId: vendorId,
        targetStatus: EXCHANGE_REQUEST_STATUS.APPROVED,
        note,
        extraFilter: isAdminOverride ? {} : { $or: [{ oldVendorId: vendorId }, { newVendorId: vendorId }] },
        setFields: { rejectionReason: '', vendorNote: String(note || '').trim() },
        logMeta: { approved: true },
    });

    await notifyExchange({
        eventType: 'EXCHANGE_APPROVED',
        exchangeRequest: updated,
        title: 'Exchange request approved',
        body: `Exchange request for order ${updated.orderId?.orderId || updated.orderId} has been approved.`,
        data: { status: EXCHANGE_REQUEST_STATUS.APPROVED },
    });

    return mapExchangeRequest(updated);
};

export const markExchangePickup = async ({ exchangeId, actorId, deliveryBoyId = null, proofImages = [], note = '', failureReason = '', success = true }) => {
    const request = await ExchangeRequest.findById(exchangeId);
    if (!request) throw new ApiError(404, 'Exchange request not found.');

    if (!success) {
        request.pickupAttemptCount = Number(request.pickupAttemptCount || 0) + 1;
        request.pickupFailureReason = String(failureReason || note || 'Pickup failed').trim();
        request.logs.push({
            status: request.status,
            note: request.pickupFailureReason,
            actorRole: 'delivery',
            actorId,
            meta: { success: false, pickupAttemptCount: request.pickupAttemptCount },
            createdAt: new Date(),
        });
        await request.save();
        await notifyExchange({
            eventType: 'EXCHANGE_PICKUP_FAILED',
            exchangeRequest: request,
            title: 'Exchange pickup failed',
            body: `Pickup for exchange ${request.orderId?.orderId || request.orderId} failed.`,
            data: { status: request.status, failureReason: request.pickupFailureReason },
        });
        return mapExchangeRequest(request);
    }

    if (deliveryBoyId) {
        const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).select('applicationStatus isActive');
        if (!deliveryBoy) throw new ApiError(404, 'Delivery agent not found.');
        if (deliveryBoy.applicationStatus !== 'approved' || !deliveryBoy.isActive) {
            throw new ApiError(409, 'Selected delivery agent is not active.');
        }
    }

    const updated = await updateExchangeStatusAtomic({
        exchangeRequestId: request._id,
        actorRole: 'delivery',
        actorId,
        targetStatus: EXCHANGE_REQUEST_STATUS.PICKUP,
        note,
        setFields: {
            pickupDeliveryBoy: deliveryBoyId || request.pickupDeliveryBoy || null,
            pickupProofImages: Array.isArray(proofImages) ? proofImages : [],
            pickupAt: new Date(),
            pickupFailureReason: '',
        },
        logMeta: { pickup: true },
    });

    await notifyExchange({
        eventType: 'EXCHANGE_PICKED_UP',
        exchangeRequest: updated,
        title: 'Exchange pickup completed',
        body: `Exchange item for order ${updated.orderId?.orderId || updated.orderId} has been picked up.`,
        data: { status: EXCHANGE_REQUEST_STATUS.PICKUP },
    });

    return mapExchangeRequest(updated);
};

export const shipExchangeReplacement = async ({ exchangeId, actorId, trackingNumber = '', note = '' }) => {
    const session = await mongoose.startSession();
    let replacementOrder = null;
    let updatedExchange = null;
    try {
        await session.withTransaction(async () => {
            const request = await ExchangeRequest.findById(exchangeId).session(session);
            if (!request) throw new ApiError(404, 'Exchange request not found.');
            if (request.status !== EXCHANGE_REQUEST_STATUS.PICKUP) {
                throw new ApiError(409, 'Replacement can only be created after pickup.');
            }

            const originalOrder = await Order.findById(request.orderId).session(session);

            const existingReplacement = request.replacementOrderId ? await Order.findById(request.replacementOrderId).session(session) : null;
            if (existingReplacement) {
                replacementOrder = existingReplacement;
            } else {
                const newProduct = await Product.findById(request.newProductId)
                    .populate('vendorId', 'storeName shippingEnabled defaultShippingRate freeShippingThreshold')
                    .session(session);
                if (!newProduct) throw new ApiError(404, 'Replacement product not found.');

                const paymentAdjustment = buildPaymentAdjustment({
                    priceDifference: Number(request.priceDifference || 0),
                    order: originalOrder,
                    exchangeId: request._id,
                });

                const [created] = await Order.create([{
                    orderId: `REP-${String(new mongoose.Types.ObjectId())}`.replace(/[^A-Z0-9-]/gi, '').slice(0, 24),
                    userId: request.userId,
                    items: [{
                        productId: newProduct._id,
                        vendorId: newProduct.vendorId?._id || newProduct.vendorId,
                        name: newProduct.name,
                        image: newProduct.image || newProduct.images?.[0] || '',
                        price: Number(newProduct.price || 0),
                        quantity: Number(request.newProduct?.quantity || 1),
                        variant: request.newProduct?.variant || {},
                        variantKey: request.newProduct?.variantKey || '',
                    }],
                    vendorItems: [{
                        vendorId: newProduct.vendorId?._id || newProduct.vendorId,
                        vendorName: newProduct.vendorId?.storeName || '',
                        items: [{
                            productId: newProduct._id,
                            vendorId: newProduct.vendorId?._id || newProduct.vendorId,
                            name: newProduct.name,
                            image: newProduct.image || newProduct.images?.[0] || '',
                            price: Number(newProduct.price || 0),
                            quantity: Number(request.newProduct?.quantity || 1),
                            variant: request.newProduct?.variant || {},
                            variantKey: request.newProduct?.variantKey || '',
                        }],
                        subtotal: Number(newProduct.price || 0) * Number(request.newProduct?.quantity || 1),
                        shipping: 0,
                        tax: 0,
                        discount: 0,
                        status: 'pending',
                    }],
                    shippingAddress: originalOrder?.shippingAddress || {},
                    paymentMethod: originalOrder?.paymentMethod || 'card',
                    paymentStatus: paymentAdjustment.type === 'COLLECT' ? 'pending' : 'paid',
                    paymentGateway: paymentAdjustment.type === 'COLLECT' ? 'razorpay' : originalOrder?.paymentGateway || undefined,
                    status: 'pending',
                    subtotal: Number(newProduct.price || 0) * Number(request.newProduct?.quantity || 1),
                    shipping: 0,
                    tax: 0,
                    discount: 0,
                    total: Number(newProduct.price || 0) * Number(request.newProduct?.quantity || 1),
                    trackingNumber: trackingNumber || undefined,
                    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    sourceType: 'exchange_replacement',
                    sourceReferenceId: String(request._id),
                    exchangeRequestId: request._id,
                    isShadowOrder: true,
                }], { session });
                replacementOrder = created;

                request.replacementOrderId = created._id;
                request.replacementOrderNumber = created.orderId;
                request.replacementTrackingNumber = String(trackingNumber || '').trim();
                request.paymentAdjustment = paymentAdjustment;
            }

            request.replacementShippedAt = new Date();
            request.status = EXCHANGE_REQUEST_STATUS.REPLACEMENT;
            request.adminNote = String(note || '').trim();
            request.logs.push({
                status: EXCHANGE_REQUEST_STATUS.REPLACEMENT,
                note: String(note || '').trim(),
                actorRole: 'vendor',
                actorId,
                meta: { trackingNumber: String(trackingNumber || '').trim() },
                createdAt: new Date(),
            });
            await request.save({ session });
            updatedExchange = request;
        });
    } finally {
        await session.endSession();
    }

    const populated = await populateExchange(ExchangeRequest.findById(updatedExchange._id));
    await notifyExchange({
        eventType: 'EXCHANGE_SHIPPED',
        exchangeRequest: populated,
        title: 'Replacement shipped',
        body: `Replacement order for exchange ${populated.orderId?.orderId || populated.orderId} has been shipped.`,
        data: { status: EXCHANGE_REQUEST_STATUS.REPLACEMENT, replacementOrderId: String(populated.replacementOrderId?._id || populated.replacementOrderId || '') },
    });

    if (replacementOrder?.paymentGateway === 'razorpay' && populated.paymentAdjustment?.type === 'COLLECT') {
        const client = getRazorpayClient();
        if (client) {
            try {
                const amount = Math.round(Number(populated.paymentAdjustment.amount || 0) * 100);
                const razorpayOrder = await client.orders.create({
                    amount,
                    currency: 'INR',
                    receipt: `exc_${String(populated._id).slice(-20)}`,
                    notes: {
                        exchangeRequestId: String(populated._id),
                        orderId: String(populated.orderId?.orderId || populated.orderId || ''),
                    },
                });
                await ExchangeRequest.updateOne({ _id: populated._id }, { $set: { 'paymentAdjustment.referenceId': razorpayOrder.id, 'paymentAdjustment.status': 'initiated' } });
            } catch (error) {
                await ExchangeRequest.updateOne({ _id: populated._id }, { $set: { 'paymentAdjustment.status': 'failed', 'paymentAdjustment.notes': error?.message || 'Failed to create Razorpay order.' } });
            }
        }
    }

    return { exchangeRequest: mapExchangeRequest(populated), replacementOrder: replacementOrder ? replacementOrder.toObject() : null };
};

export const completeExchangeAfterDelivery = async ({ replacementOrderId, actorId = null, note = '' }) => {
    const request = await ExchangeRequest.findOne({ replacementOrderId });
    if (!request) return null;
    if (request.status === EXCHANGE_REQUEST_STATUS.COMPLETED) return mapExchangeRequest(request);

    const updated = await updateExchangeStatusAtomic({
        exchangeRequestId: request._id,
        actorRole: 'delivery',
        actorId,
        targetStatus: EXCHANGE_REQUEST_STATUS.COMPLETED,
        note,
        setFields: {
            deliveredAt: new Date(),
            completedAt: new Date(),
            inventoryReserved: false,
            'inventoryReservation.consumedAt': new Date(),
        },
        logMeta: { completed: true },
    });

    await consumeExchangeInventory({
        productId: request.newProductId,
        quantity: Number(request.newProduct?.quantity || 1),
        variantKey: String(request.inventoryReservation?.variantKey || ''),
    });

    await notifyExchange({
        eventType: 'EXCHANGE_COMPLETED',
        exchangeRequest: updated,
        title: 'Exchange completed',
        body: `Exchange for order ${updated.orderId?.orderId || updated.orderId} completed successfully.`,
        data: { status: EXCHANGE_REQUEST_STATUS.COMPLETED },
    });

    return mapExchangeRequest(updated);
};
