import crypto from 'crypto';
import Notification from '../models/Notification.model.js';
import NotificationLog from '../models/NotificationLog.model.js';
import FcmToken from '../models/FcmToken.model.js';
import getFirebaseAdmin, { isFirebaseConfigured } from './firebaseAdmin.service.js';
import ApiError from '../utils/ApiError.js';

const MAX_TOKENS_PER_RECIPIENT = 10;
const MULTICAST_BATCH_SIZE = 500;

const normalizeString = (value) => String(value || '').trim();

const normalizeToken = (value) => normalizeString(value);

const chunk = (items = [], size = MULTICAST_BATCH_SIZE) => {
    const result = [];
    for (let index = 0; index < items.length; index += size) {
        result.push(items.slice(index, index + size));
    }
    return result;
};

const stableSerialize = (value) => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
    if (typeof value === 'object') {
        return `{${Object.keys(value).sort().map((key) => `${key}:${stableSerialize(value[key])}`).join(',')}}`;
    }
    return String(value);
};

export const createNotificationId = ({ recipientType, recipientId, title, body, data = {}, key = '' }) => {
    const base = [
        normalizeString(recipientType),
        normalizeString(recipientId),
        normalizeString(title),
        normalizeString(body),
        normalizeString(key),
        stableSerialize(data),
    ].join('|');
    return crypto.createHash('sha256').update(base).digest('hex');
};

export const resolveRecipientType = (role) => {
    const normalized = String(role || '').toLowerCase();
    if (normalized === 'customer') return 'user';
    if (normalized === 'superadmin' || normalized === 'admin') return 'admin';
    if (normalized === 'vendor') return 'vendor';
    if (normalized === 'delivery') return 'delivery';
    throw new ApiError(400, `Unsupported recipient role: ${role}`);
};

export const saveFcmTokenForRecipient = async ({
    recipientId,
    recipientType,
    token,
    platform = 'web',
    deviceId = '',
    appVersion = '',
}) => {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken) {
        throw new ApiError(400, 'FCM token is required.');
    }

    const doc = await FcmToken.findOneAndUpdate(
        { token: normalizedToken },
        {
            $set: {
                recipientId,
                recipientType,
                platform,
                deviceId: normalizeString(deviceId),
                appVersion: normalizeString(appVersion),
                isActive: true,
                lastSeenAt: new Date(),
            },
        },
        { upsert: true, new: true }
    );

    const tokens = await FcmToken.find({ recipientId, recipientType, isActive: true })
        .sort({ updatedAt: -1 })
        .select('_id token')
        .lean();

    if (tokens.length > MAX_TOKENS_PER_RECIPIENT) {
        const overflow = tokens.slice(MAX_TOKENS_PER_RECIPIENT);
        await FcmToken.deleteMany({ _id: { $in: overflow.map((item) => item._id) } });
    }

    return doc;
};

export const removeFcmTokenForRecipient = async ({ recipientId, recipientType, token }) => {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken) {
        throw new ApiError(400, 'FCM token is required.');
    }

    const deleted = await FcmToken.findOneAndDelete({
        token: normalizedToken,
        recipientId,
        recipientType,
    });

    return Boolean(deleted);
};

const collectTokensForRecipients = async (recipients = []) => {
    const query = [];
    for (const recipient of recipients) {
        if (!recipient?.recipientId || !recipient?.recipientType) continue;
        query.push({
            recipientId: recipient.recipientId,
            recipientType: recipient.recipientType,
            isActive: true,
        });
    }

    if (!query.length) return [];

    const documents = await FcmToken.find({ $or: query }).select('token recipientId recipientType').lean();
    const seen = new Set();
    return documents
        .map((item) => normalizeToken(item.token))
        .filter((token) => {
            if (!token || seen.has(token)) return false;
            seen.add(token);
            return true;
        });
};

const saveInAppNotifications = async ({ notificationId, recipients, title, body, type, data }) => {
    if (!recipients.length) return;
    const normalizedData = Object.fromEntries(
        Object.entries(data || {}).map(([key, value]) => [key, String(value)])
    );

    const ops = recipients.map((recipient) => ({
        updateOne: {
            filter: { notificationId: `${notificationId}:${recipient.recipientType}:${recipient.recipientId}` },
            update: {
                $setOnInsert: {
                    notificationId: `${notificationId}:${recipient.recipientType}:${recipient.recipientId}`,
                    recipientId: recipient.recipientId,
                    recipientType: recipient.recipientType,
                    title,
                    message: body,
                    type,
                    data: normalizedData,
                    isRead: false,
                },
            },
            upsert: true,
        },
    }));

    await Notification.bulkWrite(ops, { ordered: false });
};

const saveNotificationLog = async ({ notificationId, channel, recipientType, recipientId, title, body, data }) => {
    try {
        return await NotificationLog.create({
            notificationId,
            channel,
            recipientType,
            recipientId,
            title,
            body,
            data,
            status: 'pending',
        });
    } catch (error) {
        if (error?.code === 11000) {
            return null;
        }
        throw error;
    }
};

const markNotificationLog = async (notificationId, payload) => {
    await NotificationLog.updateOne({ notificationId }, { $set: payload });
};

export const sendPushToRecipients = async ({
    notificationId,
    recipients = [],
    title,
    body,
    data = {},
    type = 'system',
    channel = 'push',
    recipientType = 'broadcast',
    recipientId = null,
}) => {
    const firebase = getFirebaseAdmin();
    const normalizedRecipients = recipients.filter((recipient) => recipient?.recipientId && recipient?.recipientType);

    const log = await saveNotificationLog({
        notificationId,
        channel,
        recipientType,
        recipientId,
        title,
        body,
        data,
    });

    if (!log) {
        return { skipped: true, log };
    }

    await saveInAppNotifications({ notificationId, recipients: normalizedRecipients, title, body, type, data });

    const tokens = await collectTokensForRecipients(normalizedRecipients);
    if (!tokens.length) {
        await markNotificationLog(notificationId, { status: 'skipped', tokenCount: 0, sentTokenCount: 0, failedTokenCount: 0 });
        return { log, tokenCount: 0, sentTokenCount: 0, failedTokenCount: 0, skipped: true };
    }

    if (!firebase || !isFirebaseConfigured()) {
        await markNotificationLog(notificationId, {
            status: 'skipped',
            tokenCount: tokens.length,
            sentTokenCount: 0,
            failedTokenCount: 0,
            providerResponse: { reason: 'Firebase not configured' },
        });
        return { log, tokenCount: tokens.length, sentTokenCount: 0, failedTokenCount: 0, skipped: true };
    }

    let sentTokenCount = 0;
    let failedTokenCount = 0;
    const responses = [];

    for (const tokenBatch of chunk(tokens)) {
        const result = await firebase.messaging().sendEachForMulticast({
            tokens: tokenBatch,
            notification: {
                title,
                body,
            },
            data: Object.fromEntries(
                Object.entries({
                    ...data,
                    notificationId,
                    title,
                    body,
                }).map(([key, value]) => [key, String(value)])
            ),
        });

        sentTokenCount += result.responses.filter((item) => item.success).length;
        failedTokenCount += result.responses.filter((item) => !item.success).length;
        responses.push({
            successCount: result.successCount,
            failureCount: result.failureCount,
            responses: result.responses.map((item) => ({
                success: item.success,
                error: item.error?.message || '',
            })),
        });
    }

    await markNotificationLog(notificationId, {
        status: failedTokenCount > 0 && sentTokenCount === 0 ? 'failed' : 'sent',
        tokenCount: tokens.length,
        sentTokenCount,
        failedTokenCount,
        providerResponse: responses,
    });

    return {
        log,
        tokenCount: tokens.length,
        sentTokenCount,
        failedTokenCount,
        providerResponse: responses,
    };
};

export const sendTestPush = async ({ recipientId, recipientType, notificationId, title, body, data = {} }) => {
    const result = await sendPushToRecipients({
        notificationId,
        recipients: [{ recipientId, recipientType }],
        title,
        body,
        data: {
            ...data,
            type: 'test',
        },
        type: 'system',
        channel: 'test',
        recipientType,
        recipientId,
    });

    return result;
};
