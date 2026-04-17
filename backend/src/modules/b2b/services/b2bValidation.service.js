import ApiError from '../../../utils/ApiError.js';

export const ensureVendorCanBuyWholesale = (vendor) => {
    const canBuy = vendor?.b2bPermissions?.canBuyWholesale !== false;
    if (!canBuy) {
        throw new ApiError(403, 'Wholesale buying is disabled for this vendor.');
    }
};

export const ensureVendorCanSellWholesale = (vendor) => {
    const canSell = vendor?.b2bPermissions?.canSellWholesale === true;
    if (!canSell) {
        throw new ApiError(403, 'Wholesale selling is disabled for this vendor.');
    }
    if (vendor?.status && String(vendor.status) !== 'approved') {
        throw new ApiError(403, 'Seller vendor is not approved.');
    }
    if (vendor?.isVerified === false) {
        throw new ApiError(403, 'Seller vendor is not verified.');
    }
};

export const ensureNotSelfPurchase = ({ buyerVendorId, sellerVendorId }) => {
    if (String(buyerVendorId) === String(sellerVendorId)) {
        throw new ApiError(400, 'Vendors cannot buy their own products.');
    }
};

export const ensureWholesaleProductVisibleToVendors = (product) => {
    if (!product) throw new ApiError(404, 'Product not found.');
    if (product.isActive !== true) throw new ApiError(400, 'Product is inactive.');
    if (product.isWholesale !== true) throw new ApiError(400, 'Only wholesale products can be purchased in B2B.');
    if (String(product.wholesaleApprovalStatus || '').toLowerCase() !== 'approved') {
        throw new ApiError(403, 'Wholesale product is not approved.');
    }
    const visibleTo = String(product.visibleTo || 'all').toLowerCase();
    if (visibleTo !== 'vendors' && visibleTo !== 'all') {
        throw new ApiError(403, 'Product is not available for wholesale marketplace.');
    }
};
