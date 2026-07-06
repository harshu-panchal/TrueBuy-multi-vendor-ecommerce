import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Order from '../../../models/Order.model.js';
import SubOrder from '../../../models/SubOrder.model.js';
import User from '../../../models/User.model.js';
import Settings from '../../../models/Settings.model.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendEmail } from '../../../services/email.service.js';
import { createNotification } from '../../../services/notification.service.js';
import { completeExchangeAfterDelivery } from '../../exchange/services/exchange.service.js';
import { calculateDistanceKm } from '../../../utils/distance.js';

const DELIVERY_OTP_TTL_MS = 10 * 60 * 1000;
const DELIVERY_OTP_MAX_ATTEMPTS = 5;
const DELIVERY_OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const IS_PRODUCTION = String(process.env.NODE_ENV || '').toLowerCase() === 'production';

const hashDeliveryOtp = (otp) => {
    const secret = process.env.JWT_SECRET || 'delivery-otp-secret';
    return crypto.createHash('sha256').update(`${String(otp)}:${secret}`).digest('hex');
};

const generateDeliveryOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const isValidSixDigitOtp = (otp) => /^\d{6}$/.test(String(otp || '').trim());

const getCustomerEmail = (order) => {
    return (
        String(order?.shippingAddress?.email || '').trim().toLowerCase() ||
        String(order?.guestInfo?.email || '').trim().toLowerCase()
    );
};

const sendDeliveryOtpEmail = async (order, otp) => {
    const to = getCustomerEmail(order);
    if (!to) return false;

    await sendEmail({
        to,
        subject: `Delivery OTP for order ${order.orderId || order._id}`,
        text: `Your delivery verification OTP is ${otp}. Share it with the delivery partner only after receiving your order. It expires in 10 minutes.`,
        html: `<p>Your delivery verification OTP is <strong>${otp}</strong>.</p><p>Share it with the delivery partner only after receiving your order.</p><p>This OTP expires in 10 minutes.</p>`,
    });

    return true;
};

const clearLegacyOrderOtpState = (order) => {
    order.deliveryOtpHash = undefined;
    order.deliveryOtpExpiry = undefined;
    order.deliveryOtpSentAt = undefined;
    order.deliveryOtpAttempts = 0;
    order.deliveryOtpDebug = undefined;
};

export const ensureUserStaticDeliveryOtp = async (order) => {
    const userId = order.userId || (order.parentOrderId && order.parentOrderId.userId);
    let user = null;

    if (userId) {
        user = await User.findById(userId).select('+deliveryOtp +deliveryOtpGeneratedAt email');
    } else if (order.dropoffAddress && order.dropoffAddress.email) {
        user = await User.findOne({ email: order.dropoffAddress.email.toLowerCase() }).select('+deliveryOtp +deliveryOtpGeneratedAt email');
    }

    if (!user) return { mode: 'legacy', otp: null };

    const existingOtp = String(user.deliveryOtp || '').trim();
    if (isValidSixDigitOtp(existingOtp)) {
        return { mode: 'static', otp: existingOtp };
    }

    const generatedOtp = generateDeliveryOtp();
    user.deliveryOtp = generatedOtp;
    user.deliveryOtpGeneratedAt = new Date();
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            to: user.email,
            subject: 'Your Delivery Verification OTP',
            text: `Your static 6-digit delivery OTP is ${generatedOtp}. Share this OTP with delivery partner only after receiving your order.`,
            html: `<p>Your static 6-digit delivery OTP is <strong>${generatedOtp}</strong>.</p><p>Share this OTP with delivery partner only after receiving your order.</p>`,
        });
    } catch (err) {
        console.warn(`[Delivery OTP] Failed to email static OTP to user ${user.email}: ${err.message}`);
    }

    if (!IS_PRODUCTION) {
        console.log(`CUSTOMER STATIC DELIVERY OTP for ${user.email}:`, generatedOtp);
    }

    return { mode: 'static', otp: generatedOtp };
};

const verifyLegacyOrderOtp = async (order, normalizedOtp) => {
    if (!order.deliveryOtpHash || !order.deliveryOtpExpiry) {
        throw new ApiError(400, 'Delivery OTP was not generated. Re-mark order as shipped first.');
    }

    if (order.deliveryOtpExpiry < new Date()) {
        throw new ApiError(400, 'Delivery OTP has expired. Please resend OTP.');
    }

    const attempts = Number(order.deliveryOtpAttempts || 0);
    if (attempts >= DELIVERY_OTP_MAX_ATTEMPTS) {
        throw new ApiError(429, 'Maximum OTP attempts reached. Please resend OTP.');
    }

    const isMatch = order.deliveryOtpHash === hashDeliveryOtp(normalizedOtp);
    if (!isMatch) {
        order.deliveryOtpAttempts = attempts + 1;
        await order.save();
        throw new ApiError(400, 'Invalid delivery OTP.');
    }

    order.deliveryOtpVerifiedAt = new Date();
    clearLegacyOrderOtpState(order);
};

// GET /api/delivery/orders
export const getAssignedOrders = asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const filter = { deliveryBoyId: req.user.id, isDeleted: { $ne: true } };
    if (status === 'open') {
        filter.status = { $in: ['pending', 'processing'] };
    } else if (status) {
        filter.status = status;
    }

    const hasPaginationParams = page !== undefined || limit !== undefined;

    if (!hasPaginationParams) {
        const orders = await SubOrder.find(filter)
            .populate('vendorId', 'name storeName address phone')
            .populate('parentOrderId', 'userId shippingAddress guestInfo')
            .sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, orders, 'Assigned orders fetched.'));
    }

    const numericPage = Math.max(1, Number(page) || 1);
    const requestedLimit = Number(limit) || 20;
    const numericLimit = Math.min(Math.max(1, requestedLimit), 100);
    const skip = (numericPage - 1) * numericLimit;

    const [orders, total] = await Promise.all([
        SubOrder.find(filter)
            .populate('vendorId', 'name storeName address phone')
            .populate('parentOrderId', 'userId shippingAddress guestInfo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit),
        SubOrder.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orders,
                pagination: {
                    total,
                    page: numericPage,
                    limit: numericLimit,
                    pages: Math.ceil(total / numericLimit) || 1,
                },
            },
            'Assigned orders fetched.'
        )
    );
});

// GET /api/delivery/orders/dashboard-summary
export const getDashboardSummary = asyncHandler(async (req, res) => {
    const deliveryBoyId = req.user.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [statusStats, completedTodayCount, earningsStats, recentOrders, shippingSettings] = await Promise.all([
        SubOrder.aggregate([
            { $match: { deliveryBoyId: new mongoose.Types.ObjectId(deliveryBoyId), isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]),
        SubOrder.countDocuments({
            deliveryBoyId,
            isDeleted: { $ne: true },
            status: 'delivered',
            $or: [
                { deliveredAt: { $gte: todayStart } },
                { deliveredAt: { $exists: false }, updatedAt: { $gte: todayStart } },
                { deliveredAt: null, updatedAt: { $gte: todayStart } },
            ],
        }),
        SubOrder.aggregate([
            {
                $match: {
                    deliveryBoyId: new mongoose.Types.ObjectId(deliveryBoyId),
                    isDeleted: { $ne: true },
                    status: 'delivered',
                },
            },
            {
                $group: {
                    _id: null,
                    totalDeliveries: { $sum: 1 },
                    totalEarnings: { $sum: { $ifNull: ['$deliveryEarnings', 0] } },
                },
            },
        ]),
        SubOrder.find({ deliveryBoyId, isDeleted: { $ne: true } })
            .populate('vendorId', 'name storeName address phone')
            .populate('parentOrderId', 'userId shippingAddress guestInfo')
            .sort({ createdAt: -1 })
            .limit(3),
        Settings.findOne({ key: 'shipping' }).lean(),
    ]);

    const baseFee = shippingSettings?.value?.deliveryBaseFee != null ? Number(shippingSettings.value.deliveryBaseFee) : 40;

    const countByStatus = statusStats.reduce((acc, row) => {
        acc[String(row?._id || '')] = Number(row?.count || 0);
        return acc;
    }, {});

    const summary = {
        totalOrders:
            Number(countByStatus.pending || 0) +
            Number(countByStatus.processing || 0) +
            Number(countByStatus.shipped || 0) +
            Number(countByStatus.delivered || 0) +
            Number(countByStatus.cancelled || 0) +
            Number(countByStatus.returned || 0),
        completedToday: Number(completedTodayCount || 0),
        pendingOrders: Number(countByStatus.pending || 0) + Number(countByStatus.processing || 0),
        earnings: Number(earningsStats?.[0]?.totalEarnings || 0),
        recentOrders,
    };

    return res.status(200).json(new ApiResponse(200, summary, 'Dashboard summary fetched.'));
});

// GET /api/delivery/orders/profile-summary
export const getProfileSummary = asyncHandler(async (req, res) => {
    const deliveryBoyId = req.user.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [deliveredStats, completedTodayCount, shippingSettings] = await Promise.all([
        SubOrder.aggregate([
            {
                $match: {
                    deliveryBoyId: new mongoose.Types.ObjectId(deliveryBoyId),
                    isDeleted: { $ne: true },
                    status: 'delivered',
                },
            },
            {
                $group: {
                    _id: null,
                    totalDeliveries: { $sum: 1 },
                    totalEarnings: { $sum: { $ifNull: ['$deliveryEarnings', 0] } },
                },
            },
        ]),
        SubOrder.countDocuments({
            deliveryBoyId,
            isDeleted: { $ne: true },
            status: 'delivered',
            $or: [
                { deliveredAt: { $gte: todayStart } },
                { deliveredAt: { $exists: false }, updatedAt: { $gte: todayStart } },
                { deliveredAt: null, updatedAt: { $gte: todayStart } },
            ],
        }),
        Settings.findOne({ key: 'shipping' }).lean(),
    ]);

    const baseFee = shippingSettings?.value?.deliveryBaseFee != null ? Number(shippingSettings.value.deliveryBaseFee) : 40;

    const row = deliveredStats?.[0] || {};
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalDeliveries: Number(row.totalDeliveries || 0),
                completedToday: Number(completedTodayCount || 0),
                earnings: Number(row.totalEarnings || 0),
            },
            'Profile summary fetched.'
        )
    );
});

// GET /api/delivery/orders/:id
export const getOrderDetail = asyncHandler(async (req, res) => {
    const query = {
        deliveryBoyId: req.user.id,
        isDeleted: { $ne: true },
        $or: [{ subOrderId: req.params.id }],
    };
    if (mongoose.isValidObjectId(req.params.id)) {
        query.$or.push({ _id: req.params.id });
    }

    const order = await SubOrder.findOne(query)
        .populate('parentOrderId', 'userId shippingAddress guestInfo')
        .populate('vendorId', 'name storeName address phone')
        .select('+deliveryOtpHash +deliveryOtpExpiry +deliveryOtpSentAt +deliveryOtpAttempts +deliveryOtpDebug');
    if (!order) throw new ApiError(404, 'Order not found.');

    const shippingSettingsDoc = await Settings.findOne({ key: 'shipping' }).lean();
    let baseFee = 40;
    let perKmFee = 5;
    if (shippingSettingsDoc && shippingSettingsDoc.value) {
        if (shippingSettingsDoc.value.deliveryBaseFee != null) {
            baseFee = Number(shippingSettingsDoc.value.deliveryBaseFee) || 0;
        }
        if (shippingSettingsDoc.value.deliveryPerKmFee != null) {
            perKmFee = Number(shippingSettingsDoc.value.deliveryPerKmFee) || 0;
        }
    }

    const orderData = { ...order.toObject(), deliveryBaseFee: baseFee, deliveryPerKmFee: perKmFee };
    console.log("VENDOR PICKUP OTP:", orderData.vendorPickupOtp);
    res.status(200).json(new ApiResponse(200, orderData, 'Order detail fetched.'));
});

// PATCH /api/delivery/orders/:id/status
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
    const { status, otp, pickupOtp } = req.body;
    const allowed = ['shipped', 'delivered'];
    if (!allowed.includes(status)) throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);

    const query = {
        deliveryBoyId: req.user.id,
        isDeleted: { $ne: true },
        $or: [{ subOrderId: req.params.id }],
    };
    if (mongoose.isValidObjectId(req.params.id)) {
        query.$or.push({ _id: req.params.id });
    }

    const order = await SubOrder.findOne(query).populate('parentOrderId', 'userId shippingAddress guestInfo').select('+deliveryOtpHash +deliveryOtpExpiry +deliveryOtpSentAt +deliveryOtpAttempts +deliveryOtpDebug');
    if (!order) throw new ApiError(404, 'Order not found.');

    // Server-side transition guard (frontend guard already exists).
    const transitionAllowed =
        (status === 'shipped' && ['pending', 'processing', 'assigned_for_delivery'].includes(order.status)) ||
        (status === 'delivered' && order.status === 'shipped');
    if (!transitionAllowed) {
        throw new ApiError(409, `Cannot move order from ${order.status} to ${status}.`);
    }

    if (status === 'shipped') {
        const normalizedPickupOtp = String(pickupOtp || otp || '').trim();
        if (!normalizedPickupOtp || normalizedPickupOtp.length !== 6) {
            throw new ApiError(400, 'Vendor pickup OTP is required to start delivery.');
        }
        if (order.vendorPickupOtp && order.vendorPickupOtp !== normalizedPickupOtp) {
            throw new ApiError(400, 'Invalid vendor pickup OTP.');
        }
        order.vendorPickupOtpVerifiedAt = new Date();

        const otpMode = await ensureUserStaticDeliveryOtp(order);
        order.deliveryOtpVerifiedAt = undefined;

        if (otpMode.mode === 'legacy') {
            const generatedOtp = generateDeliveryOtp();
            order.deliveryOtpHash = hashDeliveryOtp(generatedOtp);
            order.deliveryOtpExpiry = new Date(Date.now() + DELIVERY_OTP_TTL_MS);
            order.deliveryOtpSentAt = new Date();
            order.deliveryOtpAttempts = 0;
            if (!IS_PRODUCTION) {
                order.deliveryOtpDebug = generatedOtp;
            }
            console.log("CUSTOMER DELIVERY OTP:", generatedOtp);

            try {
                const sent = await sendDeliveryOtpEmail(order, generatedOtp);
                if (!sent) {
                    console.warn(`[Delivery OTP] Missing customer email for order ${order.orderId || order._id}`);
                }
            } catch (err) {
                console.warn(`[Delivery OTP] Failed to send OTP email for order ${order.orderId || order._id}: ${err.message}`);
            }
        } else {
            clearLegacyOrderOtpState(order);
        }
    }

    if (status === 'delivered') {
        const normalizedOtp = String(otp || '').trim();
        if (!isValidSixDigitOtp(normalizedOtp)) {
            throw new ApiError(400, 'Delivery OTP is required to complete delivery.');
        }

        const otpMode = await ensureUserStaticDeliveryOtp(order);
        if (otpMode.mode === 'static') {
            if (otpMode.otp !== normalizedOtp) {
                throw new ApiError(400, 'Invalid delivery OTP.');
            }
            order.deliveryOtpVerifiedAt = new Date();
            clearLegacyOrderOtpState(order);
        } else {
            await verifyLegacyOrderOtp(order, normalizedOtp);
        }
    }

    order.status = status;
    // Keep vendor sub-order statuses aligned with delivery progression.
    if (status === 'shipped') {
        order.items = (order.items || []).map((vi) => {
            const current = String(vi?.status || 'pending');
            if (current === 'cancelled' || current === 'delivered') return vi;
            return { ...vi.toObject ? vi.toObject() : vi, status: 'shipped' };
        });
    }
    if (status === 'delivered') {
        order.items = (order.items || []).map((vi) => {
            const current = String(vi?.status || 'pending');
            if (current === 'cancelled') return vi;
            return { ...vi.toObject ? vi.toObject() : vi, status: 'delivered' };
        });
    }
    if (status === 'delivered') {
        order.deliveredAt = new Date();
        
        let baseFee = 40;
        let perKmFee = 5;
        const shippingSettingsDoc = await Settings.findOne({ key: 'shipping' });
        if (shippingSettingsDoc && shippingSettingsDoc.value) {
            if (shippingSettingsDoc.value.deliveryBaseFee != null) {
                baseFee = Number(shippingSettingsDoc.value.deliveryBaseFee) || 0;
            }
            if (shippingSettingsDoc.value.deliveryPerKmFee != null) {
                perKmFee = Number(shippingSettingsDoc.value.deliveryPerKmFee) || 0;
            }
        }
        
        const plat = order.pickupAddress?.lat;
        const plng = order.pickupAddress?.lng;
        const dlat = order.dropoffAddress?.lat;
        const dlng = order.dropoffAddress?.lng;
        
        const distanceKmFromBody = Number(req.body.distanceKm);
        const distance = !isNaN(distanceKmFromBody) && distanceKmFromBody > 0 
            ? distanceKmFromBody 
            : calculateDistanceKm(plat, plng, dlat, dlng);
            
        order.deliveryDistanceKm = distance;
        order.deliveryEarnings = baseFee + (distance * perKmFee);
    }
    await order.save();

    if (status === 'delivered' && String(order.sourceType || '') === 'exchange_replacement') {
        await completeExchangeAfterDelivery({
            replacementOrderId: order._id,
            actorId: req.user.id,
            note: 'Replacement delivered via delivery workflow.',
        });
    }

    const statusNotificationTasks = [];
    const userIdForNotification = order.userId || (order.parentOrderId && order.parentOrderId.userId);
    if (userIdForNotification) {
        statusNotificationTasks.push(
            createNotification({
                recipientId: userIdForNotification,
                recipientType: 'user',
                title: status === 'delivered' ? 'Order delivered' : 'Order shipped',
                message:
                    status === 'delivered'
                        ? `Your order ${order.subOrderId || order._id} has been delivered.`
                        : `Your order ${order.subOrderId || order._id} is out for delivery.`,
                type: 'order',
                data: {
                    orderId: String(order.subOrderId || order._id),
                    status: String(status),
                },
            })
        );
    }

    const vendorIds = [String(order.vendorId).trim()].filter(Boolean);
    vendorIds.forEach((vendorId) => {
        statusNotificationTasks.push(
            createNotification({
                recipientId: vendorId,
                recipientType: 'vendor',
                title: 'Delivery status update',
                message: `Order ${order.subOrderId || order._id} moved to ${status}.`,
                type: 'order',
                data: {
                    orderId: String(order.subOrderId || order._id),
                    status: String(status),
                },
            })
        );
    });

    if (statusNotificationTasks.length > 0) {
        await Promise.allSettled(statusNotificationTasks);
    }

    res.status(200).json(new ApiResponse(200, order, 'Delivery status updated.'));
});

// POST /api/delivery/orders/:id/resend-delivery-otp
export const resendDeliveryOtp = asyncHandler(async (req, res) => {
    const query = {
        deliveryBoyId: req.user.id,
        isDeleted: { $ne: true },
        $or: [{ subOrderId: req.params.id }],
    };

    if (mongoose.isValidObjectId(req.params.id)) {
        query.$or.push({ _id: req.params.id });
    }

    const order = await SubOrder.findOne(query)
        .populate('vendorId', 'name storeName address')
        .populate('parentOrderId', 'userId shippingAddress guestInfo');

    if (!['shipped', 'in-transit'].includes(order.status)) {
        throw new ApiError(409, 'OTP can only be resent when order is shipped or in-transit.');
    }

    const otpMode = await ensureUserStaticDeliveryOtp(order);
    if (otpMode.mode === 'static') {
        return res.status(200).json(
            new ApiResponse(200, null, 'Static delivery OTP is already assigned to this customer. Ask customer to share it.')
        );
    }

    if (
        order.deliveryOtpSentAt &&
        new Date(order.deliveryOtpSentAt).getTime() + DELIVERY_OTP_RESEND_COOLDOWN_MS > Date.now()
    ) {
        throw new ApiError(429, 'Please wait before requesting another OTP.');
    }

    const generatedOtp = generateDeliveryOtp();
    order.deliveryOtpHash = hashDeliveryOtp(generatedOtp);
    order.deliveryOtpExpiry = new Date(Date.now() + DELIVERY_OTP_TTL_MS);
    order.deliveryOtpSentAt = new Date();
    order.deliveryOtpAttempts = 0;
    if (!IS_PRODUCTION) {
        order.deliveryOtpDebug = generatedOtp;
    }
    await order.save();

    try {
        const sent = await sendDeliveryOtpEmail(order, generatedOtp);
        if (!sent) {
            throw new ApiError(400, 'Customer email is not available for this order.');
        }
    } catch (err) {
        if (err instanceof ApiError) throw err;
        console.warn(`[Delivery OTP] Failed to resend OTP for order ${order.orderId || order._id}: ${err.message}`);
        throw new ApiError(500, 'Failed to send OTP email. Please try again.');
    }

    return res.status(200).json(new ApiResponse(200, null, 'Delivery OTP resent successfully.'));
});

// GET /api/delivery/orders/:id/debug-otp (non-production only)
export const getDeliveryOtpForDebug = asyncHandler(async (req, res) => {
    if (IS_PRODUCTION) {
        throw new ApiError(404, 'Route not found.');
    }

    const query = {
        deliveryBoyId: req.user.id,
        isDeleted: { $ne: true },
        $or: [{ subOrderId: req.params.id }],
    };
    if (mongoose.isValidObjectId(req.params.id)) {
        query.$or.push({ _id: req.params.id });
    }

    const order = await SubOrder.findOne(query).select('+deliveryOtpDebug +deliveryOtpExpiry status orderId');
    if (!order) throw new ApiError(404, 'Order not found.');
    if (order.status !== 'shipped') {
        throw new ApiError(409, 'Debug OTP is only available while order is in shipped state.');
    }

    const otp = String(order.deliveryOtpDebug || '').trim();
    if (!otp) {
        throw new ApiError(404, 'Delivery OTP debug value is not available.');
    }

    return res.status(200).json(new ApiResponse(200, {
        orderId: order.orderId,
        otp,
        expiresAt: order.deliveryOtpExpiry,
    }, 'Debug OTP fetched.'));
});
