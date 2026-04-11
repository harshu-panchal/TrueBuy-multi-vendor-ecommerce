import Joi from 'joi';
import { EXCHANGE_REQUEST_STATUS } from '../../../models/ExchangeRequest.model.js';

export const createExchangeSchema = Joi.object({
    orderId: Joi.string().trim().required(),
    oldProductId: Joi.string().trim().required(),
    newProductId: Joi.string().trim().required(),
    reason: Joi.string().trim().min(5).max(500).required(),
    description: Joi.string().trim().max(1000).allow('').default(''),
    images: Joi.array().items(Joi.string().uri()).max(8).default([]),
    oldVariant: Joi.object().unknown(true).default({}),
    newVariant: Joi.object().unknown(true).default({}),
    exchangeWindowDays: Joi.number().integer().min(1).max(30).default(7),
});

export const exchangeIdParamSchema = Joi.object({
    id: Joi.string().trim().required(),
});

export const exchangeDecisionSchema = Joi.object({
    note: Joi.string().trim().max(400).allow('').default(''),
    rejectionReason: Joi.string().trim().max(400).allow('').default(''),
});

export const exchangePickupSchema = Joi.object({
    deliveryBoyId: Joi.string().trim().allow('').default(''),
    proofImages: Joi.array().items(Joi.string().uri()).max(8).default([]),
    note: Joi.string().trim().max(400).allow('').default(''),
    failureReason: Joi.string().trim().max(400).allow('').default(''),
    success: Joi.boolean().default(true),
});

export const exchangeShipSchema = Joi.object({
    trackingNumber: Joi.string().trim().max(100).allow('').default(''),
    note: Joi.string().trim().max(400).allow('').default(''),
});

export const listExchangeQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid(...Object.values(EXCHANGE_REQUEST_STATUS)).allow('all').optional(),
});
