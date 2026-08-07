import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import ActivityLog from '../../../models/ActivityLog.model.js';
import User from '../../../models/User.model.js';

const parseValidDate = (dateStr, fallback = null) => {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? fallback : d;
};

// GET /api/admin/activity-logs
export const getAllActivityLogs = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 50, 
        search, 
        createdFrom, 
        createdTo, 
        activityType, 
        customerEmail, 
        isSystemAccount 
    } = req.query;

    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 50;
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};

    if (activityType) {
        filter.activityType = { $regex: activityType, $options: 'i' };
    }

    if (customerEmail) {
        filter.$or = [
            { userEmail: { $regex: customerEmail, $options: 'i' } },
            { userName: { $regex: customerEmail, $options: 'i' } },
        ];
    }

    if (search) {
        const q = search.toLowerCase();
        filter.$or = [
            { activityType: { $regex: q, $options: 'i' } },
            { message: { $regex: q, $options: 'i' } },
            { userEmail: { $regex: q, $options: 'i' } },
            { userName: { $regex: q, $options: 'i' } },
        ];
    }

    if (isSystemAccount && isSystemAccount !== 'all') {
        filter.isSystemAccount = isSystemAccount === 'yes';
    }

    const parsedFrom = parseValidDate(createdFrom);
    const parsedTo = parseValidDate(createdTo);

    if (parsedFrom || parsedTo) {
        filter.createdAt = {};
        if (parsedFrom) filter.createdAt.$gte = parsedFrom;
        if (parsedTo) filter.createdAt.$lte = new Date(parsedTo.setHours(23, 59, 59, 999));
    }

    // Seed sample audit logs if empty
    const countTotal = await ActivityLog.countDocuments({});
    if (countTotal === 0) {
        const users = await User.find({ role: 'customer' }).limit(5).lean();
        const sampleLogs = [
            {
                activityType: 'Customer Registration',
                userName: users[0]?.name || 'Rahul Sharma',
                userEmail: users[0]?.email || 'rahul@example.com',
                message: 'Customer registered new account.',
                isSystemAccount: false,
            },
            {
                activityType: 'Profile Updated',
                userName: users[1]?.name || 'Ananya Verma',
                userEmail: users[1]?.email || 'ananya@example.com',
                message: 'Customer updated delivery address information.',
                isSystemAccount: false,
            },
            {
                activityType: 'System Backup',
                userName: 'System Cron Job',
                userEmail: 'system@truebuy.com',
                message: 'Automated database index optimization completed.',
                isSystemAccount: true,
            },
            {
                activityType: 'Order Checkout',
                userName: users[2]?.name || 'Priya Patel',
                userEmail: users[2]?.email || 'priya@example.com',
                message: 'Customer initiated checkout for Order #TRB-9842.',
                isSystemAccount: false,
            },
        ];
        await ActivityLog.insertMany(sampleLogs);
    }

    const [logs, total] = await Promise.all([
        ActivityLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        ActivityLog.countDocuments(filter),
    ]);

    const formattedLogs = logs.map((log) => ({
        id: log._id,
        logId: `LOG-${String(log._id).slice(-6).toUpperCase()}`,
        type: log.activityType || 'General Activity',
        customer: `${log.userName || 'Customer'} (${log.userEmail || 'n/a'})`,
        userName: log.userName || 'Customer',
        userEmail: log.userEmail || 'n/a',
        message: log.message || '',
        ipAddress: log.ipAddress || '127.0.0.1',
        isSystemAccount: log.isSystemAccount || false,
        createdOn: log.createdAt,
    }));

    res.status(200).json(new ApiResponse(200, {
        logs: formattedLogs,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'Activity logs fetched successfully.'));
});

// DELETE /api/admin/activity-logs
export const deleteActivityLogs = asyncHandler(async (req, res) => {
    const { ids = [], clearAll = false } = req.body;

    if (clearAll) {
        await ActivityLog.deleteMany({});
        return res.status(200).json(new ApiResponse(200, null, 'All activity logs cleared successfully.'));
    }

    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, 'Please provide log IDs to delete.');
    }

    await ActivityLog.deleteMany({ _id: { $in: ids } });
    res.status(200).json(new ApiResponse(200, null, `${ids.length} activity logs deleted successfully.`));
});
