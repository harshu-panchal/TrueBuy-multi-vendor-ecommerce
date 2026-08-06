import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Wishlist from '../../../models/Wishlist.model.js';

const parseValidDate = (dateStr, fallback = null) => {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? fallback : d;
};

// GET /api/admin/wishlists
export const getAllActiveWishlists = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, startDate, endDate } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 20;
    const skip = (numericPage - 1) * numericLimit;
    const filter = {
        'items.0': { $exists: true } // only non-empty wishlists
    };

    const parsedStart = parseValidDate(startDate);
    const parsedEnd = parseValidDate(endDate);

    if (parsedStart || parsedEnd) {
        filter.updatedAt = {};
        if (parsedStart) filter.updatedAt.$gte = parsedStart;
        if (parsedEnd) filter.updatedAt.$lte = new Date(parsedEnd.setHours(23, 59, 59, 999));
    }

    const [wishlistDocs, total] = await Promise.all([
        Wishlist.find(filter)
            .populate('userId', 'name email phone')
            .populate({
                path: 'items.productId',
                select: 'name images price stockQuantity isActive vendorId sku',
                populate: { path: 'vendorId', select: 'storeName name' }
            })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        Wishlist.countDocuments(filter),
    ]);

    const formattedWishlists = wishlistDocs.map((w) => {
        const customerName = w.userId?.name || 'Customer Shopper';
        const customerEmail = w.userId?.email || 'n/a';
        const validItems = (w.items || []).filter(it => it.productId);
        const totalItemsCount = validItems.length;

        let totalCartValue = 0;
        const itemsList = validItems.map((it) => {
            const prod = it.productId || {};
            const itemPrice = prod.price || 0;
            const itemQty = 1; // Wishlist items default quantity is 1
            const lineTotal = itemPrice * itemQty;
            totalCartValue += lineTotal;

            const vendorObj = prod.vendorId || {};
            const vendorStoreName = vendorObj.storeName || vendorObj.name || 'TruBuy Store';

            return {
                id: it._id || prod._id,
                name: prod.name || 'Product',
                image: prod.images?.[0] || '',
                price: itemPrice,
                quantity: itemQty,
                isActive: prod.isActive !== false && (prod.stockQuantity || 0) > 0,
                vendorName: vendorStoreName,
                total: lineTotal,
            };
        });

        return {
            id: w._id,
            wishlistId: `WISH-${String(w._id).slice(-6).toUpperCase()}`,
            customer: customerName,
            email: customerEmail,
            totalItems: totalItemsCount,
            totalValue: totalCartValue,
            date: w.updatedAt || w.createdAt,
            items: itemsList,
        };
    });

    // Client-side search filtering if search term provided
    let finalWishlists = formattedWishlists;
    if (search) {
        const q = search.toLowerCase();
        finalWishlists = formattedWishlists.filter(w => 
            w.customer.toLowerCase().includes(q) ||
            w.email.toLowerCase().includes(q) ||
            w.items.some(it => it.name.toLowerCase().includes(q))
        );
    }

    res.status(200).json(new ApiResponse(200, {
        wishlists: finalWishlists,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'Active wishlists fetched successfully.'));
});
