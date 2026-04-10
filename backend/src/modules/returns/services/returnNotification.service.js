import { createNotification } from '../../../services/notification.service.js';
import Admin from '../../../models/Admin.model.js';
import { logReturnWarn } from './returnLogger.service.js';

const buildNotificationsForEvent = ({ eventType, returnRequest, actorRole }) => {
    const orderReference = returnRequest?.orderId?.orderId || returnRequest?.orderId || 'N/A';
    const returnReference = String(returnRequest?._id || '');
    const status = String(returnRequest?.status || '');

    return [
        {
            recipientId: returnRequest?.userId?._id || returnRequest?.userId,
            recipientType: 'user',
            title: 'Return request update',
            message: `Return ${returnReference} for order ${orderReference} is now ${status}.`,
            type: 'order',
            data: { eventType, status, actorRole, returnRequestId: returnReference },
        },
        {
            recipientId: returnRequest?.vendorId?._id || returnRequest?.vendorId,
            recipientType: 'vendor',
            title: 'Return request update',
            message: `Return ${returnReference} for order ${orderReference} is now ${status}.`,
            type: 'order',
            data: { eventType, status, actorRole, returnRequestId: returnReference },
        },
        {
            recipientId:
                returnRequest?.assignedDeliveryBoy?._id || returnRequest?.assignedDeliveryBoy || null,
            recipientType: 'delivery',
            title: 'Return pickup update',
            message: `Return ${returnReference} is now ${status}.`,
            type: 'order',
            data: { eventType, status, actorRole, returnRequestId: returnReference },
        },
    ].filter((item) => item.recipientId);
};

const createAdminNotifications = async ({ eventType, returnRequest, actorRole }) => {
    const admins = await Admin.find({ isActive: true }).select('_id').lean();
    const orderReference = returnRequest?.orderId?.orderId || returnRequest?.orderId || 'N/A';
    const returnReference = String(returnRequest?._id || '');
    const status = String(returnRequest?.status || '');

    return admins.map((admin) => ({
        recipientId: admin._id,
        recipientType: 'admin',
        title: 'Return workflow update',
        message: `Return ${returnReference} for order ${orderReference} is now ${status}.`,
        type: 'order',
        data: { eventType, status, actorRole, returnRequestId: returnReference },
    }));
};

export const triggerReturnNotifications = async ({ eventType, returnRequest, actorRole = 'system' }) => {
    const basePayloads = buildNotificationsForEvent({ eventType, returnRequest, actorRole });
    const adminPayloads = await createAdminNotifications({ eventType, returnRequest, actorRole });
    const allPayloads = [...basePayloads, ...adminPayloads];

    const results = await Promise.allSettled(
        allPayloads.map((payload) => createNotification(payload))
    );

    // FCM-ready hook (intentionally lightweight):
    // place push fanout here later (e.g. sendPushToRecipients with eventType + return payload)
    const failures = results.filter((entry) => entry.status === 'rejected');
    if (failures.length) {
        logReturnWarn('Notification hook failures', {
            eventType,
            returnRequestId: String(returnRequest?._id || ''),
            failures: failures.length,
        });
    }
};

