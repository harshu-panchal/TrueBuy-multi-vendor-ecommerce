import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import SubscriptionPlan from '../../../models/SubscriptionPlan.model.js';
import VendorSubscription from '../../../models/VendorSubscription.model.js';
import Product from '../../../models/Product.model.js';
import mongoose from 'mongoose';

// GET /api/vendor/subscription-plans
export const getAvailablePlans = asyncHandler(async (req, res) => {
    // Only return active plans for purchase
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json(new ApiResponse(200, plans, 'Available subscription plans fetched.'));
});

// POST /api/vendor/subscription/purchase
export const purchasePlan = asyncHandler(async (req, res) => {
    const { planId, paymentId } = req.body;
    const vendorId = req.user.id;

    const plan = await SubscriptionPlan.findOne({ _id: planId, isActive: true });
    if (!plan) throw new ApiError(404, 'Subscription plan not found or is inactive.');

    // Assuming payment is already validated/successful via payment gateway on frontend
    // In a real scenario, you'd verify the payment status with Razorpay/Stripe here.
    
    // Calculate expiry date
    const purchaseDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.validityDays);

    const subscription = await VendorSubscription.create({
        vendor: vendorId,
        subscriptionPlan: plan._id,
        amountPaid: plan.price,
        productLimit: plan.productLimit,
        purchaseDate,
        expiryDate,
        paymentStatus: 'completed',
        paymentId: paymentId || 'manual_test_txn', // Placeholder
        transactionId: `TXN-${Date.now()}`,
    });

    res.status(201).json(new ApiResponse(201, subscription, 'Subscription purchased successfully.'));
});

// GET /api/vendor/subscriptions
export const getMySubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await VendorSubscription.find({ vendor: req.user.id })
        .populate('subscriptionPlan', 'name description validityDays')
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, subscriptions, 'Vendor subscriptions fetched.'));
});

// GET /api/vendor/subscription/usage
export const getSubscriptionUsage = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;

    // Find all active, non-expired subscriptions
    const activeSubscriptions = await VendorSubscription.find({
        vendor: vendorId,
        isActive: true,
        expiryDate: { $gt: new Date() },
        paymentStatus: 'completed',
    });

    let allowedProductLimit = 0;
    activeSubscriptions.forEach((sub) => {
        allowedProductLimit += (sub.productLimit || 0);
    });

    // Count all products by this vendor
    const currentProductsCount = await Product.countDocuments({ vendorId });
    const remainingProducts = Math.max(0, allowedProductLimit - currentProductsCount);

    res.status(200).json(new ApiResponse(200, {
        allowedProducts: allowedProductLimit,
        currentProducts: currentProductsCount,
        remainingProducts,
    }, 'Subscription usage fetched.'));
});
