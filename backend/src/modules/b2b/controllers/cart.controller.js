import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import B2BCart from '../../../models/B2BCart.model.js';
import Product from '../../../models/Product.model.js';
import Vendor from '../../../models/Vendor.model.js';
import { calculateCartTotals, calculateWholesaleUnitPrice, getWholesaleMoq } from '../services/b2bPricing.service.js';
import { ensureSufficientStock } from '../services/b2bInventory.service.js';
import {
    ensureNotSelfPurchase,
    ensureWholesaleProductVisibleToVendors,
    ensureVendorCanBuyWholesale,
    ensureVendorCanSellWholesale,
} from '../services/b2bValidation.service.js';

const pickCartItemSnapshot = ({ product, sellerVendorId, quantity, variant, variantKey }) => {
    const moq = getWholesaleMoq(product);
    const { unitPrice, appliedTierMinQty } = calculateWholesaleUnitPrice({ product, quantity });
    const lineTotal = Number(unitPrice) * Number(quantity);

    return {
        productId: product._id,
        sellerVendorId,
        name: String(product.name || ''),
        image: String(product.image || (Array.isArray(product.images) ? product.images[0] : '') || ''),
        unitPrice,
        quantity,
        lineTotal,
        minOrderQty: moq,
        appliedTierMinQty,
        variant: variant || {},
        variantKey: String(variantKey || ''),
    };
};

const upsertCartWithItem = async ({ buyerVendorId, sellerVendorId, itemSnapshot }) => {
    const cart = await B2BCart.findOne({ cartType: 'B2B', buyerVendorId, sellerVendorId });
    if (!cart) {
        const totals = calculateCartTotals([itemSnapshot]);
        return B2BCart.create({
            cartType: 'B2B',
            buyerVendorId,
            sellerVendorId,
            items: [itemSnapshot],
            ...totals,
            updatedBy: buyerVendorId,
        });
    }

    const existingIndex = (cart.items || []).findIndex((it) => String(it.productId) === String(itemSnapshot.productId) && String(it.variantKey || '') === String(itemSnapshot.variantKey || ''));
    if (existingIndex >= 0) {
        cart.items[existingIndex] = itemSnapshot;
    } else {
        cart.items.push(itemSnapshot);
    }
    const totals = calculateCartTotals(cart.items || []);
    cart.subtotal = totals.subtotal;
    cart.totalAmount = totals.totalAmount;
    cart.updatedBy = buyerVendorId;
    await cart.save();
    return cart;
};

// GET /api/b2b/cart?sellerVendorId=...
export const getCart = asyncHandler(async (req, res) => {
    const buyerVendorId = req.user.id;
    const { sellerVendorId } = req.query;
    const cart = await B2BCart.findOne({ cartType: 'B2B', buyerVendorId, sellerVendorId }).lean();
    res.status(200).json(new ApiResponse(200, cart || null, 'B2B cart fetched.'));
});

// POST /api/b2b/cart/items
export const addToCart = asyncHandler(async (req, res) => {
    const buyerVendorId = req.user.id;
    const { sellerVendorId, productId, quantity, variant, variantKey = '' } = req.body;

    ensureNotSelfPurchase({ buyerVendorId, sellerVendorId });

    const [buyerVendor, sellerVendor, product] = await Promise.all([
        Vendor.findById(buyerVendorId).select('b2bPermissions').lean(),
        Vendor.findById(sellerVendorId).select('b2bPermissions status isVerified').lean(),
        Product.findById(productId).lean(),
    ]);
    ensureVendorCanBuyWholesale(buyerVendor);
    ensureVendorCanSellWholesale(sellerVendor);

    ensureWholesaleProductVisibleToVendors(product);
    if (String(product.vendorId) !== String(sellerVendorId)) {
        throw new ApiError(400, 'Invalid seller for this product.');
    }

    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const moq = getWholesaleMoq(product);
    if (qty < moq) {
        throw new ApiError(400, `Minimum order quantity is ${moq}.`);
    }

    ensureSufficientStock({ product, quantity: qty, variantKey });

    const itemSnapshot = pickCartItemSnapshot({
        product,
        sellerVendorId,
        quantity: qty,
        variant,
        variantKey,
    });

    const cart = await upsertCartWithItem({ buyerVendorId, sellerVendorId, itemSnapshot });
    res.status(200).json(new ApiResponse(200, cart, 'Item added to B2B cart.'));
});

// PATCH /api/b2b/cart/items
export const updateCartItem = asyncHandler(async (req, res) => {
    const buyerVendorId = req.user.id;
    const { sellerVendorId, productId, quantity, variant, variantKey = '' } = req.body;

    const cart = await B2BCart.findOne({ cartType: 'B2B', buyerVendorId, sellerVendorId });
    if (!cart) throw new ApiError(404, 'Cart not found.');

    const product = await Product.findById(productId).lean();
    ensureWholesaleProductVisibleToVendors(product);
    if (String(product.vendorId) !== String(sellerVendorId)) {
        throw new ApiError(400, 'Invalid seller for this product.');
    }

    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const moq = getWholesaleMoq(product);
    if (qty < moq) {
        throw new ApiError(400, `Minimum order quantity is ${moq}.`);
    }
    ensureSufficientStock({ product, quantity: qty, variantKey });

    const itemSnapshot = pickCartItemSnapshot({
        product,
        sellerVendorId,
        quantity: qty,
        variant,
        variantKey,
    });
    const updated = await upsertCartWithItem({ buyerVendorId, sellerVendorId, itemSnapshot });
    res.status(200).json(new ApiResponse(200, updated, 'Cart item updated.'));
});

// DELETE /api/b2b/cart/items
export const removeCartItem = asyncHandler(async (req, res) => {
    const buyerVendorId = req.user.id;
    const { sellerVendorId, productId, variantKey = '' } = req.body;

    const cart = await B2BCart.findOne({ cartType: 'B2B', buyerVendorId, sellerVendorId });
    if (!cart) throw new ApiError(404, 'Cart not found.');

    const targetKey = String(variantKey || '');
    cart.items = (cart.items || []).filter((it) => {
        if (String(it.productId) !== String(productId)) return true;
        return String(it.variantKey || '') !== targetKey;
    });
    const totals = calculateCartTotals(cart.items || []);
    cart.subtotal = totals.subtotal;
    cart.totalAmount = totals.totalAmount;
    cart.updatedBy = buyerVendorId;

    if ((cart.items || []).length === 0) {
        await cart.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, 'Cart cleared.'));
    }

    await cart.save();
    return res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart.'));
});

// DELETE /api/b2b/cart?sellerVendorId=...
export const clearCart = asyncHandler(async (req, res) => {
    const buyerVendorId = req.user.id;
    const { sellerVendorId } = req.query;
    await B2BCart.deleteOne({ cartType: 'B2B', buyerVendorId, sellerVendorId });
    res.status(200).json(new ApiResponse(200, null, 'Cart cleared.'));
});
