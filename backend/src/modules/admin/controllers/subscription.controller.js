import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import SubscriptionPlan from '../../../models/SubscriptionPlan.model.js';
import VendorSubscription from '../../../models/VendorSubscription.model.js';

// POST /api/admin/subscription-plans
export const createPlan = asyncHandler(async (req, res) => {
    const payload = req.body;
    payload.createdBy = req.user.id;
    const plan = await SubscriptionPlan.create(payload);
    res.status(201).json(new ApiResponse(201, plan, 'Subscription plan created successfully.'));
});

// GET /api/admin/subscription-plans
export const getAllPlans = asyncHandler(async (req, res) => {
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.status(200).json(new ApiResponse(200, plans, 'Subscription plans fetched.'));
});

// GET /api/admin/subscription-plans/:id
export const getPlanById = asyncHandler(async (req, res) => {
    const plan = await SubscriptionPlan.findById(req.params.id).populate('createdBy', 'name');
    if (!plan) throw new ApiError(404, 'Subscription plan not found.');
    res.status(200).json(new ApiResponse(200, plan, 'Subscription plan fetched.'));
});

// PUT /api/admin/subscription-plans/:id
export const updatePlan = asyncHandler(async (req, res) => {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) throw new ApiError(404, 'Subscription plan not found.');
    res.status(200).json(new ApiResponse(200, plan, 'Subscription plan updated successfully.'));
});

// DELETE /api/admin/subscription-plans/:id
export const deletePlan = asyncHandler(async (req, res) => {
    // Check if there are active VendorSubscriptions for this plan
    const activeSubCount = await VendorSubscription.countDocuments({
        subscriptionPlan: req.params.id,
        isActive: true,
        expiryDate: { $gt: new Date() },
    });
    
    // It's safer to just set isActive to false (soft delete or deactivate) if it's being used
    if (activeSubCount > 0) {
        throw new ApiError(400, 'Cannot delete a plan with active vendor subscriptions. Consider deactivating it instead.');
    }

    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) throw new ApiError(404, 'Subscription plan not found.');
    res.status(200).json(new ApiResponse(200, null, 'Subscription plan deleted successfully.'));
});

// GET /api/admin/recurring-payments
export const getAllRecurringPayments = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20, search } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 20;
    const skip = (numericPage - 1) * numericLimit;
    const filter = {};

    if (status && status !== 'all') {
        if (status === 'active') filter.status = 'active';
        else if (status === 'paused') filter.status = 'paused';
        else if (status === 'cancelled') filter.status = 'cancelled';
        else if (status === 'expired') filter.status = 'expired';
    }

    const [subscriptions, total] = await Promise.all([
        VendorSubscription.find(filter)
            .populate('vendor', 'name storeName email phone')
            .populate('subscriptionPlan', 'name price billingCycle productLimit')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        VendorSubscription.countDocuments(filter),
    ]);

    res.status(200).json(new ApiResponse(200, {
        subscriptions,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'Recurring payments fetched successfully.'));
});

// PATCH /api/admin/recurring-payments/:id/status
export const updateRecurringPaymentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowed = ['active', 'paused', 'cancelled', 'expired'];
    if (!allowed.includes(status)) throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);

    const subscription = await VendorSubscription.findById(req.params.id);
    if (!subscription) throw new ApiError(404, 'Recurring payment profile not found.');

    subscription.status = status;
    if (status === 'cancelled' || status === 'expired' || status === 'paused') {
        subscription.isActive = false;
    } else if (status === 'active') {
        subscription.isActive = true;
    }

    await subscription.save();

    res.status(200).json(new ApiResponse(200, subscription, `Recurring payment profile status updated to ${status}.`));
});
