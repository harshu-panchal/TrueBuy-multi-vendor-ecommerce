import ApiError from '../../../utils/ApiError.js';
import ExchangeRequest, { EXCHANGE_REQUEST_STATUS } from '../../../models/ExchangeRequest.model.js';

const STATUS_TRANSITIONS = Object.freeze({
    [EXCHANGE_REQUEST_STATUS.REQUESTED]: [
        EXCHANGE_REQUEST_STATUS.APPROVED,
        EXCHANGE_REQUEST_STATUS.REJECTED,
    ],
    [EXCHANGE_REQUEST_STATUS.APPROVED]: [
        EXCHANGE_REQUEST_STATUS.PICKUP,
    ],
    [EXCHANGE_REQUEST_STATUS.REJECTED]: [],
    [EXCHANGE_REQUEST_STATUS.PICKUP]: [
        EXCHANGE_REQUEST_STATUS.REPLACEMENT,
    ],
    [EXCHANGE_REQUEST_STATUS.REPLACEMENT]: [
        EXCHANGE_REQUEST_STATUS.COMPLETED,
    ],
    [EXCHANGE_REQUEST_STATUS.COMPLETED]: [],
});

export const getExchangeStatusTransitions = () => STATUS_TRANSITIONS;

export const ensureValidExchangeStatus = (status) => {
    if (!Object.values(EXCHANGE_REQUEST_STATUS).includes(status)) {
        throw new ApiError(400, `Invalid exchange status: ${status}`);
    }
};

export const updateExchangeStatusAtomic = async ({
    exchangeRequestId,
    actorRole,
    actorId = null,
    targetStatus,
    note = '',
    extraFilter = {},
    setFields = {},
    logMeta = {},
}) => {
    ensureValidExchangeStatus(targetStatus);

    const currentRequest = await ExchangeRequest.findOne({ _id: exchangeRequestId, ...extraFilter })
        .select('_id status')
        .lean();

    if (!currentRequest) {
        throw new ApiError(404, 'Exchange request not found.');
    }

    const allowedTargets = STATUS_TRANSITIONS[currentRequest.status] || [];
    if (!allowedTargets.includes(targetStatus)) {
        throw new ApiError(
            409,
            `Invalid exchange transition from ${currentRequest.status} to ${targetStatus}.`
        );
    }

    const updated = await ExchangeRequest.findOneAndUpdate(
        {
            _id: exchangeRequestId,
            status: currentRequest.status,
            ...extraFilter,
        },
        {
            $set: {
                status: targetStatus,
                ...setFields,
            },
            $push: {
                logs: {
                    status: targetStatus,
                    note: String(note || '').trim(),
                    actorRole,
                    actorId,
                    meta: logMeta || {},
                    createdAt: new Date(),
                },
            },
        },
        { new: true }
    )
        .populate('orderId', 'orderId status total')
        .populate('userId', 'name email phone')
        .populate('oldProductId', 'name image price')
        .populate('newProductId', 'name image price vendorId')
        .populate('oldVendorId', 'storeName email')
        .populate('newVendorId', 'storeName email')
        .populate('replacementOrderId', 'orderId status trackingNumber total')
        .populate('pickupDeliveryBoy', 'name email phone');

    if (!updated) {
        throw new ApiError(409, 'Exchange request was updated by another process. Please retry.');
    }

    return updated;
};
