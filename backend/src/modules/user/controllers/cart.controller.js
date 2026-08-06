import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Cart from '../../../models/Cart.model.js';
import Product from '../../../models/Product.model.js';

// GET /api/user/cart
export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user._id || req.user.id })
        .populate('items.productId', 'name images price stockQuantity sku')
        .populate('items.vendorId', 'storeName name')
        .lean();

    res.status(200).json(new ApiResponse(200, cart || { userId: req.user.id, items: [], subtotal: 0, totalAmount: 0 }, 'Customer cart fetched.'));
});

// POST /api/user/cart/sync
export const syncCart = asyncHandler(async (req, res) => {
    const { items = [] } = req.body;
    const userId = req.user._id || req.user.id;

    const formattedItems = [];
    for (const item of items) {
        const prodId = item.id || item.productId || item._id;
        if (!prodId) continue;

        let vendorId = item.vendorId;
        let image = item.image || item.images?.[0] || '';
        let name = item.name || item.title || 'Product';
        let price = Number(item.price) || 0;

        // If missing metadata, lookup product from DB
        if (!vendorId || !name || !price) {
            const prodDoc = await Product.findById(prodId).lean();
            if (prodDoc) {
                vendorId = vendorId || prodDoc.vendorId;
                image = image || prodDoc.images?.[0] || '';
                name = name || prodDoc.name;
                price = price || prodDoc.price;
            }
        }

        formattedItems.push({
            productId: prodId,
            name,
            price,
            quantity: Math.max(1, Number(item.quantity) || 1),
            image,
            vendorId: vendorId || null,
        });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, items: formattedItems });
    } else {
        cart.items = formattedItems;
        cart.lastActivity = new Date();
    }

    await cart.save();

    res.status(200).json(new ApiResponse(200, cart, 'Cart synced successfully.'));
});

// DELETE /api/user/cart
export const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.id;
    await Cart.findOneAndDelete({ userId });
    res.status(200).json(new ApiResponse(200, null, 'Customer cart cleared.'));
});
