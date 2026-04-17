import ApiError from '../../../utils/ApiError.js';

const toNonNegativeInt = (value, fallback = 0) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.floor(n));
};

const toEntries = (value) => {
    if (!value) return [];
    if (value instanceof Map) return Array.from(value.entries());
    if (typeof value === 'object') return Object.entries(value);
    return [];
};

export const getAvailableStock = ({ product, variantKey = '' }) => {
    const key = String(variantKey || '').trim();
    if (!key) return toNonNegativeInt(product?.stockQuantity, 0);

    const stockMap = Object.fromEntries(toEntries(product?.variants?.stockMap));
    if (!Object.prototype.hasOwnProperty.call(stockMap, key)) {
        throw new ApiError(400, 'Invalid variant selection for this product.');
    }
    return toNonNegativeInt(stockMap[key], 0);
};

export const ensureSufficientStock = ({ product, quantity, variantKey = '' }) => {
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const available = getAvailableStock({ product, variantKey });
    if (available < qty) {
        throw new ApiError(409, 'Insufficient stock for this product.');
    }
};

