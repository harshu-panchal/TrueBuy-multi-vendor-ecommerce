import Joi from 'joi';

export const saveFcmTokenSchema = Joi.object({
    token: Joi.string().trim().min(20).required(),
    platform: Joi.string().trim().valid('web', 'android', 'ios', 'mobile', 'unknown').default('web'),
    deviceId: Joi.string().trim().allow('').max(200).optional(),
    appVersion: Joi.string().trim().allow('').max(100).optional(),
});

export const removeFcmTokenSchema = Joi.object({
    token: Joi.string().trim().min(20).required(),
});

export const testFcmTokenSchema = Joi.object({
    notificationId: Joi.string().trim().allow('').optional(),
    title: Joi.string().trim().min(1).max(180).default('Test Notification'),
    body: Joi.string().trim().min(1).max(500).default('This is a test notification.'),
    data: Joi.object().unknown(true).default({}),
});
