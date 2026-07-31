import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import VendorSubscription from '../models/VendorSubscription.model.js';
import Product from '../models/Product.model.js';

export const checkVendorProductLimit = asyncHandler(async (req, res, next) => {
    // TEMPORARILY BYPASS SUBSCRIPTION LIMITS FOR IOS REVIEW
    return next();

    const vendorId = req.user.id;

    // 1. Find all active subscriptions that haven't expired
    const activeSubscriptions = await VendorSubscription.find({
        vendor: vendorId,
        isActive: true,
        expiryDate: { $gt: new Date() },
        paymentStatus: 'completed',
    });

    // 2. Sum product limits from active plans
    let allowedProductLimit = 0;
    activeSubscriptions.forEach((sub) => {
        allowedProductLimit += (sub.productLimit || 0);
    });

    // 3. Count current products by vendor (including inactive, excluding permanently deleted)
    const currentProductsCount = await Product.countDocuments({ vendorId });

    // 4. Compare and block if limit reached
    if (currentProductsCount >= allowedProductLimit) {
        return res.status(403).json({
            success: false,
            message: "Product limit reached. Please purchase a subscription plan to add more products.",
        });
    }

    next();
});
