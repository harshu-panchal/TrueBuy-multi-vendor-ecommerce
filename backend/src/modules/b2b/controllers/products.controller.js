import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import Product from '../../../models/Product.model.js';
import Vendor from '../../../models/Vendor.model.js';

// GET /api/b2b/products
export const listWholesaleProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search = '', categoryId, vendorId } = req.query;
    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (numericPage - 1) * numericLimit;

    const buyerVendorId = req.user?.id;
    const eligibleSellers = await Vendor.find({ 'b2bPermissions.canSellWholesale': true, status: 'approved', isVerified: true })
        .select('_id storeName storeLogo')
        .limit(5000)
        .lean();
    const eligibleSellerIds = eligibleSellers.map((v) => v._id);

    const filter = {
        isWholesale: true,
        isActive: true,
        wholesaleApprovalStatus: 'approved',
        visibleTo: { $in: ['vendors', 'all'] },
        vendorId: { $ne: buyerVendorId, $in: eligibleSellerIds },
    };

    if (categoryId) filter.categoryId = categoryId;
    if (vendorId) filter.vendorId = vendorId;
    if (search) {
        const regex = new RegExp(String(search).trim(), 'i');
        filter.$or = [{ name: regex }, { description: regex }, { tags: regex }];
    }

    const [products, total] = await Promise.all([
        Product.find(filter)
            .select('name slug description price images image categoryId brandId vendorId stock stockQuantity minOrderQty bulkPricing visibleTo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        Product.countDocuments(filter),
    ]);

    const sellerMap = new Map(eligibleSellers.map((v) => [String(v._id), v]));
    const mapped = products.map((p) => ({
        ...p,
        seller: sellerMap.get(String(p.vendorId)) || null,
    }));

    res.status(200).json(
        new ApiResponse(
            200,
            { products: mapped, total, page: numericPage, pages: Math.ceil(total / numericLimit) },
            'Wholesale products fetched.'
        )
    );
});
