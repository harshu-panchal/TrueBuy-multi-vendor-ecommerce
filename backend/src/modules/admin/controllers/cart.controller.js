import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Cart from '../../../models/Cart.model.js';
import B2BCart from '../../../models/B2BCart.model.js';

const parseValidDate = (dateStr, fallback = null) => {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? fallback : d;
};

// GET /api/admin/shopping-carts
export const getAllActiveShoppingCarts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, startDate, endDate } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 20;
    const skip = (numericPage - 1) * numericLimit;
    const filter = {
        'items.0': { $exists: true } // only non-empty carts
    };

    const parsedStart = parseValidDate(startDate);
    const parsedEnd = parseValidDate(endDate);

    if (parsedStart || parsedEnd) {
        filter.updatedAt = {};
        if (parsedStart) filter.updatedAt.$gte = parsedStart;
        if (parsedEnd) filter.updatedAt.$lte = new Date(parsedEnd.setHours(23, 59, 59, 999));
    }

    const [customerCarts, total] = await Promise.all([
        Cart.find(filter)
            .populate('userId', 'name email phone')
            .populate('items.productId', 'name images price sku')
            .populate('items.vendorId', 'storeName name')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        Cart.countDocuments(filter),
    ]);

    const formattedCarts = customerCarts.map((c, idx) => {
        const customerName = c.userId?.name || 'Customer Shopper';
        const customerEmail = c.userId?.email || 'n/a';
        const totalItemsCount = (c.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

        return {
            id: c._id,
            cartId: `CART-${String(c._id).slice(-6).toUpperCase()}`,
            customer: customerName,
            email: customerEmail,
            totalItems: totalItemsCount,
            totalValue: c.totalAmount || c.subtotal || 0,
            date: c.updatedAt || c.lastActivity || c.createdAt,
            items: (c.items || []).map((it) => ({
                id: it._id || it.productId?._id,
                name: it.name || it.productId?.name || 'Product',
                image: it.image || it.productId?.images?.[0] || '',
                price: it.price || 0,
                quantity: it.quantity || 1,
                vendorName: it.vendorId?.storeName || it.vendorId?.name || 'Vendor Store',
                total: (it.price || 0) * (it.quantity || 1),
            })),
        };
    });

    // Client-side search filtering if search term provided
    let finalCarts = formattedCarts;
    if (search) {
        const q = search.toLowerCase();
        finalCarts = formattedCarts.filter(c => 
            c.customer.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.items.some(it => it.name.toLowerCase().includes(q))
        );
    }

    res.status(200).json(new ApiResponse(200, {
        carts: finalCarts,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'Active shopping carts fetched successfully.'));
});
