import Joi from 'joi';

export const createSubscriptionPlanSchema = Joi.object({
    name: Joi.string().required().trim().messages({
        'string.empty': 'Plan name is required.',
        'any.required': 'Plan name is required.',
    }),
    description: Joi.string().allow('', null).trim(),
    price: Joi.number().min(0).required().messages({
        'number.min': 'Price must be 0 or greater.',
        'any.required': 'Price is required.',
    }),
    productLimit: Joi.number().min(1).required().messages({
        'number.min': 'Product limit must be at least 1.',
        'any.required': 'Product limit is required.',
    }),
    validityDays: Joi.number().min(1).required().messages({
        'number.min': 'Validity must be at least 1 day.',
        'any.required': 'Validity days is required.',
    }),
    isActive: Joi.boolean().default(true),
});

export const updateSubscriptionPlanSchema = Joi.object({
    name: Joi.string().trim(),
    description: Joi.string().allow('', null).trim(),
    price: Joi.number().min(0),
    productLimit: Joi.number().min(1),
    validityDays: Joi.number().min(1),
    isActive: Joi.boolean(),
});

export const subscriptionPlanIdParamSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        'string.length': 'Invalid Subscription Plan ID format',
        'string.hex': 'Invalid Subscription Plan ID format',
        'any.required': 'Subscription Plan ID is required',
    }),
});
