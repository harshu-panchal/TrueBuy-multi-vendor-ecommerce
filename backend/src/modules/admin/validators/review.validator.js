import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const reviewListQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('').optional(),
    status: Joi.string().valid('all', 'approved', 'pending').optional(),
});

export const reviewIdParamSchema = Joi.object({
    id: Joi.string().regex(objectIdPattern).required().messages({
        'string.pattern.base': 'Invalid review ID format.',
    }),
});

export const updateReviewStatusSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected', 'pending').required(),
});
