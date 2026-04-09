import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Notification from '../../../models/Notification.model.js';

// GET /api/admin/notifications
export const getAdminNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 20, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {
        recipientType: 'admin',
        recipientId: req.user._id,
    };

    if (type) {
        filter.type = type;
    }

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

    const total = await Notification.countDocuments(filter);

    // Count unread
    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    res.status(200).json(new ApiResponse(200, {
        notifications,
        total,
        unreadCount,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber)
    }, 'Notifications fetched.'));
});

// PUT /api/admin/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
        {
            _id: id,
            recipientType: 'admin',
            recipientId: req.user._id,
        },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, 'Notification not found.');
    }

    res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read.'));
});

// PUT /api/admin/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
    const filter = {
        recipientType: 'admin',
        recipientId: req.user._id,
        isRead: false
    };

    await Notification.updateMany(filter, { isRead: true });

    res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read.'));
});
