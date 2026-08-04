import Joi from 'joi';

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

export const orderIdParamSchema = Joi.object({
    id: Joi.string().trim().required(),
});

export const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
        .required(),
});

export const subOrderIdParamSchema = Joi.object({
    id: Joi.string().trim().required(),
});

export const updateSubOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid(
            'pending',
            'processing',
            'assigned_for_delivery',
            'ready',
            'shipped',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'returned'
        )
        .required(),
});

export const assignDeliverySchema = Joi.object({
    deliveryBoyId: objectId.allow(null, '').optional(),
});
