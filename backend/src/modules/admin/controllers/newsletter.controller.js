import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import NewsletterSubscriber from '../../../models/NewsletterSubscriber.model.js';
import User from '../../../models/User.model.js';

// GET /api/admin/newsletter-subscribers
export const getAllSubscribers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, email, store, role, active } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 50;
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};

    if (email) {
        filter.email = { $regex: email, $options: 'i' };
    }

    if (store && store !== 'All') {
        filter.store = store;
    }

    if (role && role !== 'All') {
        filter.roles = role;
    }

    if (active !== undefined && active !== 'all') {
        filter.isActive = active === 'true' || active === true;
    }

    // Seed sample subscribers if empty
    const countTotal = await NewsletterSubscriber.countDocuments({});
    if (countTotal === 0) {
        const users = await User.find({ role: 'customer' }).limit(5).lean();
        const sampleSubscribers = [
            { email: 'rahul@example.com', isActive: true, store: 'Main Store', roles: ['Registered'] },
            { email: 'ananya@example.com', isActive: true, store: 'Main Store', roles: ['Registered'] },
            { email: 'guest.shopper@gmail.com', isActive: true, store: 'Main Store', roles: ['Guest'] },
            { email: 'priya.design@outlook.com', isActive: false, store: 'Secondary Store', roles: ['Guest'] },
        ];

        users.forEach((u) => {
            if (!sampleSubscribers.some((s) => s.email === u.email)) {
                sampleSubscribers.push({
                    email: u.email,
                    isActive: u.isActive,
                    store: 'Main Store',
                    roles: ['Registered'],
                });
            }
        });

        await NewsletterSubscriber.insertMany(sampleSubscribers).catch(() => {});
    }

    const [subscribers, total] = await Promise.all([
        NewsletterSubscriber.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        NewsletterSubscriber.countDocuments(filter),
    ]);

    const formatted = subscribers.map((s) => ({
        ...s,
        id: s._id,
        active: s.isActive,
        createdOn: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : 'N/A',
    }));

    res.status(200).json(
        new ApiResponse(
            200,
            {
                subscribers: formatted,
                total,
                page: numericPage,
                pages: Math.ceil(total / numericLimit),
            },
            'Newsletter subscribers fetched successfully.'
        )
    );
});

// POST /api/admin/newsletter-subscribers
export const createSubscriber = asyncHandler(async (req, res) => {
    const { email, active, isActive, store, roles } = req.body;

    if (!email) {
        throw new ApiError(400, 'Email address is required.');
    }

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new ApiError(409, 'Subscriber with this email already exists.');
    }

    const subscriber = new NewsletterSubscriber({
        email: email.toLowerCase(),
        isActive: active !== undefined ? active : (isActive !== undefined ? isActive : true),
        store: store || 'Main Store',
        roles: Array.isArray(roles) ? roles : ['Registered'],
    });

    await subscriber.save();

    res.status(201).json(
        new ApiResponse(
            201,
            {
                ...subscriber.toObject(),
                id: subscriber._id,
                active: subscriber.isActive,
                createdOn: new Date(subscriber.createdAt).toISOString().split('T')[0],
            },
            'Subscriber created successfully.'
        )
    );
});

// PUT /api/admin/newsletter-subscribers/:id
export const updateSubscriber = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { active, isActive, ...updateFields } = req.body;

    if (active !== undefined) {
        updateFields.isActive = active;
    } else if (isActive !== undefined) {
        updateFields.isActive = isActive;
    }

    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).lean();

    if (!subscriber) {
        throw new ApiError(404, 'Subscriber not found.');
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                ...subscriber,
                id: subscriber._id,
                active: subscriber.isActive,
                createdOn: new Date(subscriber.createdAt).toISOString().split('T')[0],
            },
            'Subscriber updated successfully.'
        )
    );
});

// DELETE /api/admin/newsletter-subscribers (Single or Bulk)
export const deleteSubscriber = asyncHandler(async (req, res) => {
    const { id, ids } = req.body;
    const singleId = req.params.id || id;

    if (Array.isArray(ids) && ids.length > 0) {
        await NewsletterSubscriber.deleteMany({ _id: { $in: ids } });
        return res.status(200).json(new ApiResponse(200, null, `${ids.length} subscribers deleted successfully.`));
    }

    if (!singleId) {
        throw new ApiError(400, 'Subscriber ID is required.');
    }

    const subscriber = await NewsletterSubscriber.findByIdAndDelete(singleId);
    if (!subscriber) {
        throw new ApiError(404, 'Subscriber not found.');
    }

    res.status(200).json(new ApiResponse(200, null, 'Subscriber deleted successfully.'));
});
