import Joi from 'joi';
import { RETURN_REQUEST_STATUS } from '../../../models/ReturnRequest.model.js';

export const createReturnSchema = Joi.object({
    orderId: Joi.string().trim().required(),
    productId: Joi.string().trim().required(),
    reason: Joi.string().trim().min(5).max(500).required(),
    images: Joi.array().items(Joi.string().uri()).max(8).default([]),
});

export const listReturnsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().trim().optional(),
});

export const returnIdParamSchema = Joi.object({
    id: Joi.string().trim().required(),
});

export const vendorDecisionSchema = Joi.object({
    action: Joi.string().valid('APPROVE', 'REJECT').optional(),
    status: Joi.string().optional(),
    note: Joi.string().trim().max(400).allow('').default(''),
    rejectionReason: Joi.string().trim().max(400).allow('').default(''),
}).or('action', 'status');

export const adminAssignSchema = Joi.object({
    deliveryBoyId: Joi.string().trim().required(),
    note: Joi.string().trim().max(400).allow('').default(''),
});

export const deliveryUpdateSchema = Joi.object({
    status: Joi.string()
        .valid(
            RETURN_REQUEST_STATUS.PICKED_UP,
            RETURN_REQUEST_STATUS.INSPECTION_PENDING,
            RETURN_REQUEST_STATUS.COMPLETED,
            RETURN_REQUEST_STATUS.REFUND_INITIATED,
            RETURN_REQUEST_STATUS.REFUND_COMPLETED
        )
        .required(),
    note: Joi.string().trim().max(400).allow('').default(''),
});

