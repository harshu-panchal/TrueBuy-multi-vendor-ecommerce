import Joi from 'joi';

const objectId = Joi.string().trim().hex().length(24);

export const b2bProductsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().allow('').optional(),
    categoryId: objectId.allow('', null).optional(),
    vendorId: objectId.allow('', null).optional(),
});

export const sellerQuerySchema = Joi.object({
    sellerVendorId: objectId.required(),
});

export const addToCartSchema = Joi.object({
    sellerVendorId: objectId.required(),
    productId: objectId.required(),
    quantity: Joi.number().integer().min(1).required(),
    variant: Joi.object().optional(),
    variantKey: Joi.string().trim().allow('').optional(),
});

export const updateCartItemSchema = Joi.object({
    sellerVendorId: objectId.required(),
    productId: objectId.required(),
    quantity: Joi.number().integer().min(1).required(),
    variant: Joi.object().optional(),
    variantKey: Joi.string().trim().allow('').optional(),
});

export const removeCartItemSchema = Joi.object({
    sellerVendorId: objectId.required(),
    productId: objectId.required(),
    variantKey: Joi.string().trim().allow('').optional(),
});

export const placeOrderSchema = Joi.object({
    sellerVendorId: objectId.required(),
    buyerNote: Joi.string().trim().allow('').max(500).optional(),
});

export const orderListQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    view: Joi.string().valid('buy', 'sell', 'all').default('all'),
    status: Joi.string().valid('pending', 'accepted', 'rejected', 'shipped', 'delivered').optional(),
});

export const orderRespondSchema = Joi.object({
    action: Joi.string().valid('accept', 'reject').required(),
    reason: Joi.string().trim().allow('').max(500).optional(),
});
