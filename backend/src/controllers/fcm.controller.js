import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import {
    resolveRecipientType,
    saveFcmTokenForRecipient,
    removeFcmTokenForRecipient,
    sendTestPush,
} from '../services/fcm.service.js';

const normalizePlatform = (value) => {
    const platform = String(value || 'web').toLowerCase();
    if (['web', 'android', 'ios', 'mobile'].includes(platform)) return platform;
    return 'unknown';
};

const getRequestNotificationId = (req, prefix) => {
    const body = req.body || {};
    return String(body.notificationId || body.data?.notificationId || `${prefix}_${req.user.role}_${req.user.id}`).trim();
};

// POST /api/fcm-tokens/save
export const saveToken = asyncHandler(async (req, res) => {
    const { token, deviceId = '', appVersion = '' } = req.body;
    const recipientType = resolveRecipientType(req.user.role);

    await saveFcmTokenForRecipient({
        recipientId: req.user.id,
        recipientType,
        token,
        platform: normalizePlatform(req.body.platform),
        deviceId,
        appVersion,
    });

    return res.status(200).json(
        new ApiResponse(200, null, 'FCM token saved successfully.')
    );
});

// DELETE /api/fcm-tokens/remove
export const removeToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const recipientType = resolveRecipientType(req.user.role);

    const removed = await removeFcmTokenForRecipient({
        recipientId: req.user.id,
        recipientType,
        token,
    });

    if (!removed) {
        throw new ApiError(404, 'FCM token not found.');
    }

    return res.status(200).json(new ApiResponse(200, null, 'FCM token removed successfully.'));
});

// POST /api/fcm-tokens/test
export const sendTestNotification = asyncHandler(async (req, res) => {
    const recipientType = resolveRecipientType(req.user.role);
    const notificationId = getRequestNotificationId(req, 'test');
    const title = String(req.body.title || 'Test Notification').trim();
    const body = String(req.body.body || 'This is a test notification.').trim();

    const result = await sendTestPush({
        recipientId: req.user.id,
        recipientType,
        notificationId,
        title,
        body,
        data: req.body.data || {},
    });

    return res.status(200).json(
        new ApiResponse(200, result, 'Test notification processed successfully.')
    );
});
