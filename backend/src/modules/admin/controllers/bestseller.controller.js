import mongoose from 'mongoose';
import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import Order from '../../../models/Order.model.js';
import Product from '../../../models/Product.model.js';

const parseValidDate = (dateStr, fallback = null) => {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? fallback : d;
};

// GET /api/admin/bestsellers
export const getBestsellersReport = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 50, 
        search, 
        startDate, 
        endDate, 
        orderStatus, 
        paymentStatus, 
        shippingStatus 
    } = req.query;

    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 50;
    const skip = (numericPage - 1) * numericLimit;

    // Match criteria for Orders
    const orderMatch = {
        orderStatus: { $nin: ['Cancelled', 'Rejected'] }
    };

    if (orderStatus && orderStatus !== 'all') {
        orderMatch.orderStatus = orderStatus;
    }
    if (paymentStatus && paymentStatus !== 'all') {
        orderMatch.paymentStatus = paymentStatus;
    }
    if (shippingStatus && shippingStatus !== 'all') {
        orderMatch.shippingStatus = shippingStatus;
    }

    const parsedStart = parseValidDate(startDate);
    const parsedEnd = parseValidDate(endDate);

    if (parsedStart || parsedEnd) {
        orderMatch.createdAt = {};
        if (parsedStart) orderMatch.createdAt.$gte = parsedStart;
        if (parsedEnd) orderMatch.createdAt.$lte = new Date(parsedEnd.setHours(23, 59, 59, 999));
    }

    // Pipeline 1: Aggregate sold quantities & revenue from Orders
    const aggregatedBestsellers = await Order.aggregate([
        { $match: orderMatch },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.productId',
                totalQty: { $sum: { $ifNull: ['$items.quantity', 1] } },
                totalAmount: { $sum: { $multiply: [{ $ifNull: ['$items.price', 0] }, { $ifNull: ['$items.quantity', 1] }] } },
                orderCount: { $sum: 1 },
            }
        },
        { $sort: { totalQty: -1, totalAmount: -1 } }
    ]);

    const soldMap = new Map();
    aggregatedBestsellers.forEach(item => {
        if (item._id) {
            soldMap.set(String(item._id), item);
        }
    });

    // Pipeline 2: Fetch products catalog to ensure rich metadata (image, SKU, price, stock, vendor)
    const productQuery = { isDeleted: { $ne: true } };
    if (search) {
        productQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
        ];
    }

    const allProducts = await Product.find(productQuery)
        .populate('vendorId', 'storeName name')
        .lean();

    // Merge aggregation stats with product details
    const mergedResults = allProducts.map(prod => {
        const stats = soldMap.get(String(prod._id)) || { totalQty: 0, totalAmount: 0, orderCount: 0 };
        return {
            id: prod._id,
            productId: `PROD-${String(prod._id).slice(-6).toUpperCase()}`,
            name: prod.name || 'Untitled Product',
            image: prod.images?.[0] || '',
            sku: prod.sku || 'N/A',
            gtin: prod.gtin || 'N/A',
            mpn: prod.mpn || 'N/A',
            price: prod.price || 0,
            stock: prod.stockQuantity ?? 0,
            published: prod.isActive !== false,
            created: prod.createdAt,
            updated: prod.updatedAt,
            vendorName: prod.vendorId?.storeName || prod.vendorId?.name || 'TruBuy Store',
            totalQty: stats.totalQty,
            totalAmt: stats.totalAmount,
            orderCount: stats.orderCount,
        };
    });

    // Sort by totalQty descending, then totalAmt descending
    mergedResults.sort((a, b) => {
        if (b.totalQty !== a.totalQty) return b.totalQty - a.totalQty;
        return b.totalAmt - a.totalAmt;
    });

    // Assign Rank Position (#1, #2, #3...)
    const rankedResults = mergedResults.map((item, idx) => ({
        ...item,
        rank: idx + 1,
    }));

    const paginatedResults = rankedResults.slice(skip, skip + numericLimit);
    const total = rankedResults.length;

    res.status(200).json(new ApiResponse(200, {
        products: paginatedResults,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'Bestseller report generated successfully.'));
});
