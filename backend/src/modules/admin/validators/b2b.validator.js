import Joi from 'joi';

const objectId = Joi.string().trim().hex().length(24);

export const b2bOrdersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('pending', 'accepted', 'rejected', 'shipped', 'delivered', 'all').default('all'),
    search: Joi.string().trim().allow('').optional(),
    sellerVendorId: objectId.allow('', null).optional(),
    buyerVendorId: objectId.allow('', null).optional(),
});

export const b2bOrderIdParamSchema = Joi.object({
    id: Joi.string().trim().required(),
});

export const assignB2BDeliverySchema = Joi.object({
    deliveryBoyId: objectId.required(),
});

export const b2bWholesaleProductsQuerySchema = Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected', 'all').default('pending'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().trim().allow('').optional(),
    vendorId: objectId.allow('', null).optional(),
});

export const b2bWholesaleProductStatusSchema = Joi.object({
    action: Joi.string().valid('approve', 'reject').required(),
    reason: Joi.string().trim().allow('').max(500).optional(),
});

export const b2bVendorPermissionsSchema = Joi.object({
    canBuyWholesale: Joi.boolean().optional(),
    canSellWholesale: Joi.boolean().optional(),
});

export const vendorIdParamSchema = Joi.object({
    id: objectId.required(),
});

