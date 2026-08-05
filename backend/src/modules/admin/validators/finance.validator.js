import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const withdrawListQuerySchema = Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected', 'completed').optional(),
    userType: Joi.string().valid('user', 'vendor', 'delivery_boy').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
});

export const withdrawRequestIdParamSchema = Joi.object({
    id: Joi.string().regex(objectIdPattern).required().messages({
        'string.pattern.base': 'Invalid withdrawal request ID format.',
    }),
});

export const updateWithdrawStatusSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected', 'completed').required(),
    rejectionReason: Joi.string().allow('', null).optional(),
    transactionId: Joi.string().allow('', null).optional(),
    receiptUrl: Joi.string().allow('', null).optional(),
    notes: Joi.string().allow('', null).optional(),
});
