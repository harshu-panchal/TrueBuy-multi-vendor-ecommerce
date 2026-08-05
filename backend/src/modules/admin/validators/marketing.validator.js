import Joi from 'joi';

const objectId = Joi.string().trim().hex().length(24);

export const marketingIdParamSchema = Joi.object({
    id: objectId.required(),
});

export const couponListQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('all', 'active', 'inactive', 'expired', 'upcoming').optional(),
});

export const createCouponSchema = Joi.object({
    code: Joi.string().trim().uppercase().required(),
    name: Joi.string().trim().allow('').optional(),
    type: Joi.string().valid('percentage', 'fixed', 'freeship').required(),
    value: Joi.number().min(0).required(),
    minOrderValue: Joi.number().min(0).optional(),
    minPurchase: Joi.number().min(0).optional(),
    maxDiscount: Joi.number().min(0).allow(null, '').optional(),
    usageLimit: Joi.number().integer().min(0).allow(null, '').optional(),
    isActive: Joi.boolean().optional(),
    status: Joi.string().optional(),
    startsAt: Joi.date().iso().allow(null, '').optional(),
    startDate: Joi.date().iso().allow(null, '').optional(),
    expiresAt: Joi.date().iso().allow(null, '').optional(),
    endDate: Joi.date().iso().allow(null, '').optional(),
    countdownThreshold: Joi.number().min(0).optional(),
});

export const updateCouponSchema = Joi.object({
    code: Joi.string().trim().uppercase().optional(),
    name: Joi.string().trim().allow('').optional(),
    type: Joi.string().valid('percentage', 'fixed', 'freeship').optional(),
    value: Joi.number().min(0).optional(),
    minOrderValue: Joi.number().min(0).optional(),
    minPurchase: Joi.number().min(0).optional(),
    maxDiscount: Joi.number().min(0).allow(null, '').optional(),
    usageLimit: Joi.number().integer().min(0).allow(null, '').optional(),
    isActive: Joi.boolean().optional(),
    status: Joi.string().optional(),
    startsAt: Joi.date().iso().allow(null, '').optional(),
    startDate: Joi.date().iso().allow(null, '').optional(),
    expiresAt: Joi.date().iso().allow(null, '').optional(),
    endDate: Joi.date().iso().allow(null, '').optional(),
    countdownThreshold: Joi.number().min(0).optional(),
}).min(1);

export const createBannerSchema = Joi.object({
    title: Joi.string().trim().allow('').optional(),
    subtitle: Joi.string().trim().allow('').optional(),
    description: Joi.string().trim().allow('').optional(),
    image: Joi.string().trim().allow('', null).optional(),
    link: Joi.string().trim().allow('').optional(),
    type: Joi.string().trim().default('promotional').optional(),
    order: Joi.number().integer().min(0).optional(),
    isActive: Joi.boolean().optional(),
});

export const updateBannerSchema = Joi.object({
    title: Joi.string().trim().allow('').optional(),
    subtitle: Joi.string().trim().allow('').optional(),
    description: Joi.string().trim().allow('').optional(),
    image: Joi.string().trim().allow('', null).optional(),
    link: Joi.string().trim().allow('').optional(),
    type: Joi.string().trim().optional(),
    order: Joi.number().integer().min(0).optional(),
    isActive: Joi.boolean().optional(),
}).min(1);

export const reorderBannersSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            id: objectId.required(),
            order: Joi.number().integer().min(0).required(),
        })
    ).min(2).required(),
});

export const campaignListQuerySchema = Joi.object({
    status: Joi.string().trim().allow('').optional(),
    type: Joi.string().trim().allow('').optional(),
});

export const createCampaignSchema = Joi.object({
    name: Joi.string().trim().required(),
    slug: Joi.string().trim().allow('').optional(),
    type: Joi.string().trim().optional(),
    discountType: Joi.string().valid('percentage', 'fixed').optional(),
    discountValue: Joi.number().min(0).optional(),
    description: Joi.string().trim().allow('').optional(),
    autoCreateBanner: Joi.boolean().optional(),
    bannerConfig: Joi.object().optional(),
    productIds: Joi.array().items(Joi.string().trim()).optional(),
    isActive: Joi.boolean().optional(),
    status: Joi.string().optional(),
});

export const updateCampaignSchema = Joi.object({
    name: Joi.string().trim().optional(),
    slug: Joi.string().trim().allow('').optional(),
    type: Joi.string().trim().optional(),
    discountType: Joi.string().valid('percentage', 'fixed').optional(),
    discountValue: Joi.number().min(0).optional(),
    description: Joi.string().trim().allow('').optional(),
    autoCreateBanner: Joi.boolean().optional(),
    bannerConfig: Joi.object().optional(),
    productIds: Joi.array().items(Joi.string().trim()).optional(),
    isActive: Joi.boolean().optional(),
    status: Joi.string().optional(),
}).min(1);
