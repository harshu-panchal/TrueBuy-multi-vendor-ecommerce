import Joi from 'joi';

const objectId = Joi.string().trim().hex().length(24);

export const settingUpdateSchema = Joi.object({
    key: Joi.string().trim().min(1).max(100).optional(),
    category: Joi.string().trim().min(1).max(100).optional(),
    value: Joi.any().optional(),
})
    .unknown(true)
    .custom((value, helpers) => {
        if (value.key && value.category) {
            return helpers.error('any.invalid');
        }
        return value;
    }, 'single key/category selector');

export const policyTypeParamSchema = Joi.object({
    type: Joi.string()
        .trim()
        .valid('privacy-policy', 'refund-policy', 'terms-conditions', 'privacy', 'refund', 'terms')
        .required(),
});

export const policyUpdateSchema = Joi.object({
    content: Joi.string().allow('').required(),
});

export const notificationSendSchema = Joi.object({
    title: Joi.string().trim().min(1).max(180).required(),
    message: Joi.string().trim().min(1).max(2000).required(),
    type: Joi.string().trim().valid('order', 'payment', 'system', 'promotion').default('system'),
    target: Joi.string()
        .trim()
        .valid('all', 'customers', 'vip', 'segment', 'delivery-boy', 'vendors', 'admins')
        .default('all'),
    recipientIds: Joi.array().items(objectId).default([]),
    schedule: Joi.string().trim().valid('now', 'scheduled').default('now'),
    scheduledDate: Joi.date().iso().optional(),
    data: Joi.object().unknown(true).default({}),
});

export const customMessageSchema = Joi.object({
    message: Joi.string().trim().min(1).max(2000).required(),
    title: Joi.string().trim().max(180).allow('').optional(),
    type: Joi.string().trim().valid('order', 'payment', 'system', 'promotion').default('system'),
    target: Joi.string()
        .trim()
        .valid('all', 'customers', 'vip', 'segment', 'delivery-boy', 'vendors', 'admins')
        .default('customers'),
    recipientIds: Joi.array().items(objectId).default([]),
    data: Joi.object().unknown(true).default({}),
});
