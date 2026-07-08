import Joi from 'joi';

export const purchaseSubscriptionSchema = Joi.object({
    planId: Joi.string().hex().length(24).required().messages({
        'string.length': 'Invalid Subscription Plan ID format',
        'string.hex': 'Invalid Subscription Plan ID format',
        'any.required': 'Subscription Plan ID is required',
    }),
    paymentId: Joi.string().optional().allow('', null),
});
