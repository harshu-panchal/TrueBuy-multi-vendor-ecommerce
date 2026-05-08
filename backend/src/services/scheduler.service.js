import NotificationLog from '../models/NotificationLog.model.js';
import * as fcmService from './fcm.service.js';

let intervalId = null;

export const processScheduledNotifications = async () => {
    try {
        const now = new Date();
        const scheduledLogs = await NotificationLog.find({
            status: 'scheduled',
            scheduledAt: { $lte: now }
        });

        if (scheduledLogs.length === 0) return;

        console.log(`[Scheduler] Processing ${scheduledLogs.length} scheduled notifications...`);

        for (const log of scheduledLogs) {
            try {
                // Update status to pending to avoid double processing
                await NotificationLog.updateOne({ _id: log._id }, { status: 'pending' });

                const { recipients, type, ...data } = log.data || {};

                await fcmService.sendPushToRecipients({
                    notificationId: log.notificationId,
                    recipients: recipients || [],
                    title: log.title,
                    body: log.body,
                    data: data || {},
                    type: type || 'system',
                    recipientType: log.recipientType,
                });

                console.log(`[Scheduler] Successfully processed notification: ${log.notificationId}`);
            } catch (error) {
                console.error(`[Scheduler] Failed to process notification ${log.notificationId}:`, error);
                await NotificationLog.updateOne({ _id: log._id }, { status: 'failed', error: error.message });
            }
        }
    } catch (error) {
        console.error('[Scheduler] Error in processScheduledNotifications:', error);
    }
};

export const startScheduler = (intervalMs = 60000) => {
    if (intervalId) return;
    
    console.log('[Scheduler] Starting background notification scheduler...');
    // Run immediately on start
    processScheduledNotifications();
    
    intervalId = setInterval(processScheduledNotifications, intervalMs);
};

export const stopScheduler = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('[Scheduler] Background notification scheduler stopped.');
    }
};
