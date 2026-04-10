import ApiError from '../../../utils/ApiError.js';
import ReturnRequest, {
    RETURN_REQUEST_STATUS,
    LEGACY_TO_NEW_STATUS,
    normalizeStatusValue,
} from '../../../models/ReturnRequest.model.js';

const STATUS_TRANSITIONS = Object.freeze({
    [RETURN_REQUEST_STATUS.REQUESTED]: [
        RETURN_REQUEST_STATUS.APPROVED_BY_VENDOR,
        RETURN_REQUEST_STATUS.REJECTED_BY_VENDOR,
    ],
    [RETURN_REQUEST_STATUS.APPROVED_BY_VENDOR]: [RETURN_REQUEST_STATUS.PICKUP_ASSIGNED],
    [RETURN_REQUEST_STATUS.PICKUP_ASSIGNED]: [RETURN_REQUEST_STATUS.PICKED_UP],
    [RETURN_REQUEST_STATUS.PICKED_UP]: [RETURN_REQUEST_STATUS.INSPECTION_PENDING],
    [RETURN_REQUEST_STATUS.INSPECTION_PENDING]: [RETURN_REQUEST_STATUS.COMPLETED],
    [RETURN_REQUEST_STATUS.COMPLETED]: [RETURN_REQUEST_STATUS.REFUND_INITIATED],
    [RETURN_REQUEST_STATUS.REFUND_INITIATED]: [RETURN_REQUEST_STATUS.REFUND_COMPLETED],
    [RETURN_REQUEST_STATUS.REJECTED_BY_VENDOR]: [],
    [RETURN_REQUEST_STATUS.REFUND_COMPLETED]: [],
});

const LEGACY_STATUS_ALIASES = Object.entries(LEGACY_TO_NEW_STATUS).reduce((acc, [legacy, current]) => {
    if (!acc[current]) acc[current] = [];
    acc[current].push(legacy);
    return acc;
}, {});

export const getStatusTransitions = () => STATUS_TRANSITIONS;

export const getStorageStatusesForCanonical = (canonicalStatus) => {
    const normalized = normalizeStatusValue(canonicalStatus);
    return [normalized, ...(LEGACY_STATUS_ALIASES[normalized] || [])];
};

export const ensureValidTargetStatus = (status) => {
    if (!Object.values(RETURN_REQUEST_STATUS).includes(status)) {
        throw new ApiError(400, `Invalid return status: ${status}`);
    }
};

export const updateReturnStatusAtomic = async ({
    returnRequestId,
    actorRole,
    actorId = null,
    targetStatus,
    note = '',
    extraFilter = {},
    setFields = {},
}) => {
    ensureValidTargetStatus(targetStatus);

    const currentRequest = await ReturnRequest.findOne({ _id: returnRequestId, ...extraFilter })
        .select('_id status')
        .lean();
    if (!currentRequest) throw new ApiError(404, 'Return request not found.');

    const currentCanonicalStatus = normalizeStatusValue(currentRequest.status);
    const allowedTargets = STATUS_TRANSITIONS[currentCanonicalStatus] || [];
    if (!allowedTargets.includes(targetStatus)) {
        throw new ApiError(
            409,
            `Invalid status transition from ${currentCanonicalStatus} to ${targetStatus}.`
        );
    }

    const allowedStorageStatuses = getStorageStatusesForCanonical(currentCanonicalStatus);
    const updated = await ReturnRequest.findOneAndUpdate(
        {
            _id: returnRequestId,
            status: { $in: allowedStorageStatuses },
            ...extraFilter,
        },
        {
            $set: {
                status: targetStatus,
                ...setFields,
            },
            $push: {
                timeline: {
                    status: targetStatus,
                    note: String(note || '').trim(),
                    actorRole,
                    actorId,
                    createdAt: new Date(),
                },
            },
        },
        { new: true }
    )
        .populate('orderId', 'orderId total status')
        .populate('productId', 'name image')
        .populate('userId', 'name email phone')
        .populate('vendorId', 'storeName email')
        .populate('assignedDeliveryBoy', 'name email phone');

    if (!updated) {
        throw new ApiError(409, 'Return request was updated by another process. Please retry.');
    }

    return updated;
};

