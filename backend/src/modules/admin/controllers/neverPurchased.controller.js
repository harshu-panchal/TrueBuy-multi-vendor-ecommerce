import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import Order from '../../../models/Order.model.js';
import Product from '../../../models/Product.model.js';

const parseValidDate = (dateStr, fallback = null) => {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? fallback : d;
};

// GET /api/admin/never-purchased
export const getNeverPurchasedReport = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 50, 
        search, 
        startDate, 
        endDate 
    } = req.query;

    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 50;
    const skip = (numericPage - 1) * numericLimit;

    // Step 1: Extract all product IDs that have been ordered in non-cancelled orders
    const soldProductIdsRaw = await Order.distinct('items.productId', {
        orderStatus: { $nin: ['Cancelled', 'Rejected'] }
    });

    const soldProductIds = soldProductIdsRaw.filter(Boolean);

    // Step 2: Build query for unsold products ($nin soldProductIds)
    const productQuery = {
        _id: { $nin: soldProductIds },
        isDeleted: { $ne: true }
    };

    const parsedStart = parseValidDate(startDate);
    const parsedEnd = parseValidDate(endDate);

    if (parsedStart || parsedEnd) {
        productQuery.createdAt = {};
        if (parsedStart) productQuery.createdAt.$gte = parsedStart;
        if (parsedEnd) productQuery.createdAt.$lte = new Date(parsedEnd.setHours(23, 59, 59, 999));
    }

    if (search) {
        const q = search.toLowerCase();
        productQuery.$or = [
            { name: { $regex: q, $options: 'i' } },
            { sku: { $regex: q, $options: 'i' } },
        ];
    }

    const [neverPurchasedProds, total] = await Promise.all([
        Product.find(productQuery)
            .populate('vendorId', 'storeName name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        Product.countDocuments(productQuery),
    ]);

    const formattedProducts = neverPurchasedProds.map((p) => ({
        id: p._id,
        productId: `PROD-${String(p._id).slice(-6).toUpperCase()}`,
        name: p.name || 'Untitled Product',
        image: p.images?.[0] || '',
        sku: p.sku || 'N/A',
        gtin: p.gtin || 'N/A',
        mpn: p.mpn || 'N/A',
        price: p.price || 0,
        stock: p.stockQuantity ?? 0,
        created: p.createdAt,
        updated: p.updatedAt,
        published: p.isActive !== false,
        vendorName: p.vendorId?.storeName || p.vendorId?.name || 'TruBuy Store',
        totalQty: 0,
        totalAmt: 0,
    }));

    res.status(200).json(new ApiResponse(200, {
        products: formattedProducts,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'Products never purchased report generated successfully.'));
});
