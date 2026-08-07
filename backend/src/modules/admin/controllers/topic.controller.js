import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Topic from '../../../models/Topic.model.js';

// GET /api/admin/cms/topics
export const getAllTopics = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, systemName, title, store, renderAsHtmlWidget, widgetZone } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 50;
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};

    if (systemName) {
        filter.systemName = { $regex: systemName, $options: 'i' };
    }

    if (title) {
        filter.title = { $regex: title, $options: 'i' };
    }

    if (store && store !== 'All') {
        filter.limitedToStores = store;
    }

    if (widgetZone && widgetZone !== 'All') {
        filter.widgetZone = widgetZone;
    }

    if (renderAsHtmlWidget !== undefined && renderAsHtmlWidget !== 'All') {
        filter.renderAsHtmlWidget = renderAsHtmlWidget === 'true' || renderAsHtmlWidget === true;
    }

    // Seed sample CMS topics if empty
    const countTotal = await Topic.countDocuments({});
    if (countTotal === 0) {
        const sampleTopics = [
            {
                systemName: 'AboutUs',
                title: 'About Our E-Commerce Store',
                shortTitle: 'About Us',
                intro: 'Welcome to TrueBuy, your premium multi-vendor marketplace.',
                body: '<p>TrueBuy brings thousands of certified vendors and customers together in a unified shopping ecosystem.</p>',
                published: true,
                priority: 1,
                includeInSitemap: true,
                limitedToStores: 'All',
                limitedToRoles: 'All',
                renderAsHtmlWidget: false,
                seoTitleTag: 'About Us | TrueBuy Marketplace',
                seoMetaDescription: 'Learn about TrueBuy multi-vendor e-commerce platform.',
                seoUrlAlias: 'about-us',
            },
            {
                systemName: 'ShippingInfo',
                title: 'Shipping & Delivery Information',
                shortTitle: 'Shipping Info',
                intro: 'Details on shipping zones, delivery partners, and tracking.',
                body: '<p>We ship nationwide with express delivery options available on all orders.</p>',
                published: true,
                priority: 2,
                includeInSitemap: true,
                limitedToStores: 'All',
                limitedToRoles: 'All',
                renderAsHtmlWidget: false,
                seoTitleTag: 'Shipping Information | TrueBuy',
                seoUrlAlias: 'shipping-info',
            },
            {
                systemName: 'HeaderAnnouncementWidget',
                title: 'Header Announcement Bar',
                shortTitle: 'Header Announcement',
                intro: 'Top banner announcement for ongoing store discounts.',
                body: '<div>FREE EXPRESS SHIPPING ON ORDERS OVER ₹999!</div>',
                published: true,
                priority: 10,
                includeInSitemap: false,
                limitedToStores: 'All',
                limitedToRoles: 'All',
                renderAsHtmlWidget: true,
                htmlId: 'header-announcement-bar',
                widgetZone: 'Header',
            },
        ];

        await Topic.insertMany(sampleTopics).catch(() => {});
    }

    const [topics, total] = await Promise.all([
        Topic.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        Topic.countDocuments(filter),
    ]);

    const formatted = topics.map((t) => ({
        ...t,
        id: t._id,
        createdOn: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : 'N/A',
    }));

    res.status(200).json(
        new ApiResponse(
            200,
            {
                topics: formatted,
                total,
                page: numericPage,
                pages: Math.ceil(total / numericLimit),
            },
            'CMS topics fetched successfully.'
        )
    );
});

// GET /api/admin/cms/topics/:id
export const getTopicById = asyncHandler(async (req, res) => {
    const topic = await Topic.findById(req.params.id).lean();
    if (!topic) {
        throw new ApiError(404, 'CMS topic not found.');
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                ...topic,
                id: topic._id,
                createdOn: new Date(topic.createdAt).toISOString().split('T')[0],
            },
            'CMS topic fetched successfully.'
        )
    );
});

// POST /api/admin/cms/topics
export const createTopic = asyncHandler(async (req, res) => {
    const { systemName, title } = req.body;

    if (!systemName || !title) {
        throw new ApiError(400, 'System name and Title are required.');
    }

    const existing = await Topic.findOne({ systemName: systemName.trim() });
    if (existing) {
        throw new ApiError(409, 'A topic with this system name already exists.');
    }

    const topic = new Topic(req.body);
    await topic.save();

    res.status(201).json(
        new ApiResponse(
            201,
            {
                ...topic.toObject(),
                id: topic._id,
                createdOn: new Date(topic.createdAt).toISOString().split('T')[0],
            },
            'CMS topic created successfully.'
        )
    );
});

// PUT /api/admin/cms/topics/:id
export const updateTopic = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const topic = await Topic.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
    ).lean();

    if (!topic) {
        throw new ApiError(404, 'CMS topic not found.');
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                ...topic,
                id: topic._id,
                createdOn: new Date(topic.createdAt).toISOString().split('T')[0],
            },
            'CMS topic updated successfully.'
        )
    );
});

// DELETE /api/admin/cms/topics (Single or Bulk)
export const deleteTopic = asyncHandler(async (req, res) => {
    const { id, ids } = req.body;
    const singleId = req.params.id || id;

    if (Array.isArray(ids) && ids.length > 0) {
        await Topic.deleteMany({ _id: { $in: ids } });
        return res.status(200).json(new ApiResponse(200, null, `${ids.length} topics deleted successfully.`));
    }

    if (!singleId) {
        throw new ApiError(400, 'Topic ID is required.');
    }

    const topic = await Topic.findByIdAndDelete(singleId);
    if (!topic) {
        throw new ApiError(404, 'CMS topic not found.');
    }

    res.status(200).json(new ApiResponse(200, null, 'CMS topic deleted successfully.'));
});
