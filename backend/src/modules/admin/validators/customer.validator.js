import Joi from 'joi';

const objectId = Joi.string().trim().hex().length(24);

export const customerListQuerySchema = Joi.object({
    status: Joi.string().valid('active', 'blocked').optional(),
    search: Joi.string().trim().allow('').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(200).optional(),
});

export const customerIdParamSchema = Joi.object({
    id: objectId.required(),
});

export const customerUpdateSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).optional(),
    phone: Joi.string().trim().allow('', null).max(20).optional(),
}).min(1);

export const customerStatusUpdateSchema = Joi.object({
    isActive: Joi.boolean().required(),
});

export const customerAddressParamsSchema = Joi.object({
    customerId: objectId.required(),
    addressId: objectId.required(),
});

export const customerAddressUpdateSchema = Joi.object({
    name: Joi.string().trim().max(50).optional(),
    fullName: Joi.string().trim().max(100).optional(),
    phone: Joi.string().trim().max(20).optional(),
    address: Joi.string().trim().max(500).optional(),
    city: Joi.string().trim().max(100).optional(),
    state: Joi.string().trim().max(100).optional(),
    zipCode: Joi.string().trim().max(20).optional(),
    country: Joi.string().trim().max(100).optional(),
    isDefault: Joi.boolean().optional(),
}).min(1);

export const customerOrdersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(200).optional(),
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned').optional(),
});

export const customerTransactionsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(200).optional(),
    search: Joi.string().trim().allow('').optional(),
    status: Joi.string().valid('all', 'completed', 'pending', 'failed').optional(),
});

export const customerAddressesQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(200).optional(),
    search: Joi.string().trim().allow('').optional(),
});
