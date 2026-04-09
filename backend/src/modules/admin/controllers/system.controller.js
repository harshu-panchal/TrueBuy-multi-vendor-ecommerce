import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Settings from '../../../models/Settings.model.js';
import Notification from '../../../models/Notification.model.js';
import User from '../../../models/User.model.js';
import Vendor from '../../../models/Vendor.model.js';
import DeliveryBoy from '../../../models/DeliveryBoy.model.js';
import Admin from '../../../models/Admin.model.js';
import Order from '../../../models/Order.model.js';

const POLICY_KEY_MAP = {
    'privacy-policy': 'privacy-policy',
    'refund-policy': 'refund-policy',
    'terms-conditions': 'terms-conditions',
    privacy: 'privacy-policy',
    refund: 'refund-policy',
    terms: 'terms-conditions',
};

const normalizePolicyType = (type) => POLICY_KEY_MAP[String(type || '').trim()] || null;

const resolveSettingOpsFromPayload = (payload = {}) => {
    const { key, category, value, ...rest } = payload;
    const selectedKey = (key || category || '').trim();

    if (selectedKey) {
        return [{ key: selectedKey, value: value !== undefined ? value : rest }];
    }

    const entries = Object.entries(payload).filter(([k]) => !['key', 'category'].includes(k));
    return entries.map(([entryKey, entryValue]) => ({ key: entryKey, value: entryValue }));
};

const getVipUserIds = async () => {
    const vipOrders = await Order.aggregate([
        { $match: { userId: { $exists: true, $ne: null }, paymentStatus: { $in: ['paid', 'refunded'] } } },
        {
            $group: {
                _id: '$userId',
                totalSpent: { $sum: { $ifNull: ['$totalAmount', 0] } },
                orderCount: { $sum: 1 },
            },
        },
        {
            $match: {
                $or: [
                    { totalSpent: { $gte: 50000 } },
                    { orderCount: { $gte: 10 } },
                ],
            },
        },
        { $project: { _id: 1 } },
    ]);

    return vipOrders.map((entry) => String(entry._id));
};

const resolveNotificationRecipients = async ({ target, recipientIds = [] }) => {
    const explicitIds = [...new Set((recipientIds || []).map((id) => String(id).trim()).filter(Boolean))];

    if (target === 'segment') {
        if (!explicitIds.length) {
            throw new ApiError(400, 'recipientIds are required when target is "segment".');
        }
        return { recipientType: 'user', recipientIds: explicitIds };
    }

    if (target === 'customers') {
        const users = await User.find({ isActive: true }).select('_id').lean();
        return { recipientType: 'user', recipientIds: users.map((item) => String(item._id)) };
    }

    if (target === 'vip') {
        return { recipientType: 'user', recipientIds: await getVipUserIds() };
    }

    if (target === 'delivery-boy') {
        const deliveryBoys = await DeliveryBoy.find({ isActive: true }).select('_id').lean();
        return { recipientType: 'delivery', recipientIds: deliveryBoys.map((item) => String(item._id)) };
    }

    if (target === 'vendors') {
        const vendors = await Vendor.find({ status: { $in: ['approved', 'pending'] } }).select('_id').lean();
        return { recipientType: 'vendor', recipientIds: vendors.map((item) => String(item._id)) };
    }

    if (target === 'admins') {
        const admins = await Admin.find({ isActive: true }).select('_id').lean();
        return { recipientType: 'admin', recipientIds: admins.map((item) => String(item._id)) };
    }

    if (target === 'all') {
        const [users, vendors, deliveryBoys] = await Promise.all([
            User.find({ isActive: true }).select('_id').lean(),
            Vendor.find({ status: { $in: ['approved', 'pending'] } }).select('_id').lean(),
            DeliveryBoy.find({ isActive: true }).select('_id').lean(),
        ]);

        return {
            recipientGroups: [
                { recipientType: 'user', recipientIds: users.map((item) => String(item._id)) },
                { recipientType: 'vendor', recipientIds: vendors.map((item) => String(item._id)) },
                { recipientType: 'delivery', recipientIds: deliveryBoys.map((item) => String(item._id)) },
            ],
        };
    }

    throw new ApiError(400, 'Unsupported notification target.');
};

const buildNotificationDocs = ({ recipientType, recipientIds, title, message, type, data }) =>
    (recipientIds || []).map((recipientId) => ({
        recipientId,
        recipientType,
        title,
        message,
        type,
        data,
    }));

const createNotificationsForTarget = async ({ target, title, message, type, recipientIds, data }) => {
    const recipients = await resolveNotificationRecipients({ target, recipientIds });
    const docs = [];

    if (Array.isArray(recipients.recipientGroups)) {
        for (const group of recipients.recipientGroups) {
            docs.push(...buildNotificationDocs({ ...group, title, message, type, data }));
        }
    } else {
        docs.push(...buildNotificationDocs({ ...recipients, title, message, type, data }));
    }

    if (!docs.length) {
        return { createdCount: 0 };
    }

    await Notification.insertMany(docs, { ordered: false });
    return { createdCount: docs.length };
};

// GET /api/admin/settings
export const getSettings = asyncHandler(async (req, res) => {
    const records = await Settings.find({}).lean();
    const settings = records.reduce((acc, record) => {
        acc[record.key] = record.value;
        return acc;
    }, {});

    return res.status(200).json(new ApiResponse(200, settings, 'Settings fetched successfully.'));
});

// PUT /api/admin/settings
export const updateSettings = asyncHandler(async (req, res) => {
    const updates = resolveSettingOpsFromPayload(req.body);
    if (!updates.length) {
        throw new ApiError(400, 'No setting payload provided.');
    }

    const ops = updates.map((entry) => ({
        updateOne: {
            filter: { key: entry.key },
            update: { $set: { value: entry.value } },
            upsert: true,
        },
    }));

    await Settings.bulkWrite(ops, { ordered: true });
    const records = await Settings.find({}).lean();
    const settings = records.reduce((acc, record) => {
        acc[record.key] = record.value;
        return acc;
    }, {});

    return res.status(200).json(new ApiResponse(200, settings, 'Settings updated successfully.'));
});

// GET /api/admin/policies/:type
export const getPolicy = asyncHandler(async (req, res) => {
    const normalizedType = normalizePolicyType(req.params.type);
    if (!normalizedType) {
        throw new ApiError(400, 'Invalid policy type.');
    }

    const key = `policy:${normalizedType}`;
    const policy = await Settings.findOne({ key }).lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                type: normalizedType,
                content: policy?.value?.content || '',
                updatedAt: policy?.updatedAt || null,
            },
            'Policy fetched successfully.'
        )
    );
});

// PUT /api/admin/policies/:type
export const updatePolicy = asyncHandler(async (req, res) => {
    const normalizedType = normalizePolicyType(req.params.type);
    if (!normalizedType) {
        throw new ApiError(400, 'Invalid policy type.');
    }

    const content = String(req.body?.content || '');
    const key = `policy:${normalizedType}`;

    const updated = await Settings.findOneAndUpdate(
        { key },
        { $set: { value: { content } } },
        { upsert: true, new: true }
    ).lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                type: normalizedType,
                content,
                updatedAt: updated?.updatedAt || new Date(),
            },
            'Policy updated successfully.'
        )
    );
});

// POST /api/admin/notifications/push
export const sendPushNotification = asyncHandler(async (req, res) => {
    const {
        title,
        message,
        type = 'system',
        target = 'all',
        recipientIds = [],
        schedule = 'now',
        scheduledDate,
        data = {},
    } = req.body;

    const meta = {
        ...data,
        channel: 'push',
        schedule,
        scheduledDate: scheduledDate || null,
        requestedByAdminId: String(req.user?._id || req.user?.id || ''),
    };

    const result = await createNotificationsForTarget({
        target,
        title,
        message,
        type,
        recipientIds,
        data: meta,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...result,
                mode: 'in_app_only',
            },
            'Notification queued in-app successfully. FCM is not configured.'
        )
    );
});

// POST /api/admin/notifications/message
export const sendCustomMessage = asyncHandler(async (req, res) => {
    const {
        title = 'Admin Message',
        message,
        type = 'system',
        target = 'customers',
        recipientIds = [],
        data = {},
    } = req.body;

    const result = await createNotificationsForTarget({
        target,
        title,
        message,
        type,
        recipientIds,
        data: {
            ...data,
            channel: 'custom-message',
            requestedByAdminId: String(req.user?._id || req.user?.id || ''),
        },
    });

    return res.status(200).json(
        new ApiResponse(200, result, 'Custom message delivered to in-app notifications successfully.')
    );
});
