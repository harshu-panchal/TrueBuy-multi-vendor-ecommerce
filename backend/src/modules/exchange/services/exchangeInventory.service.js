import Product from '../../../models/Product.model.js';
import ApiError from '../../../utils/ApiError.js';

const normalizeVariantPart = (value) => String(value || '').trim().toLowerCase();
const normalizeAxisName = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');

const createDynamicVariantKey = (selection = {}) =>
    Object.entries(selection || {})
        .map(([axis, value]) => [normalizeAxisName(axis), normalizeVariantPart(value)])
        .filter(([axis, value]) => axis && value)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([axis, value]) => `${axis}=${value}`)
        .join('|');

const toEntries = (value) => {
    if (!value) return [];
    if (value instanceof Map) return Array.from(value.entries());
    if (typeof value === 'object') return Object.entries(value);
    return [];
};

const resolveVariantKey = (product, selectedVariant) => {
    const entries = toEntries(product?.variants?.prices).map(([key]) => String(key).trim());
    const stockEntries = toEntries(product?.variants?.stockMap).map(([key]) => String(key).trim());
    const existingKeys = [...new Set([...entries, ...stockEntries])];
    if (!existingKeys.length) return null;

    const normalizedSelection = Object.entries(selectedVariant || {}).reduce((acc, [axis, value]) => {
        const axisKey = normalizeAxisName(axis);
        const normalizedValue = normalizeVariantPart(value);
        if (axisKey && normalizedValue) acc[axisKey] = normalizedValue;
        return acc;
    }, {});

    const dynamicKey = createDynamicVariantKey(normalizedSelection);
    if (dynamicKey) {
        const exactDynamic = existingKeys.find((key) => key === dynamicKey);
        if (exactDynamic) return exactDynamic;
        const normalizedDynamic = existingKeys.find(
            (key) => normalizeVariantPart(key) === normalizeVariantPart(dynamicKey)
        );
        if (normalizedDynamic) return normalizedDynamic;
    }

    const size = normalizeVariantPart(selectedVariant?.size);
    const color = normalizeVariantPart(selectedVariant?.color);
    const candidates = [
        `${size}|${color}`,
        `${size}-${color}`,
        `${size}_${color}`,
        `${size}:${color}`,
        size && !color ? size : null,
        color && !size ? color : null,
    ].filter(Boolean);

    for (const candidate of candidates) {
        const exact = existingKeys.find((key) => key === candidate);
        if (exact) return exact;
        const normalized = existingKeys.find(
            (key) => normalizeVariantPart(key) === normalizeVariantPart(candidate)
        );
        if (normalized) return normalized;
    }

    return existingKeys[0] || null;
};

const resolveProductStockSnapshot = (productDoc) => {
    const product = typeof productDoc?.toObject === 'function' ? productDoc.toObject() : productDoc;
    return {
        productId: product?._id || null,
        vendorId: product?.vendorId || null,
        name: product?.name || '',
        image: product?.image || product?.images?.[0] || '',
        price: Number(product?.price || 0),
        stockQuantity: Number(product?.stockQuantity || 0),
        lowStockThreshold: Number(product?.lowStockThreshold || 0),
    };
};

const resolveNextStockState = (product) => {
    if (product.stockQuantity <= 0) return 'out_of_stock';
    if (product.stockQuantity <= product.lowStockThreshold) return 'low_stock';
    return 'in_stock';
};

const assertQuantity = (quantity) => {
    const numericQuantity = Number(quantity || 0);
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        throw new ApiError(400, 'Quantity must be greater than zero.');
    }
    return numericQuantity;
};

export const reserveExchangeInventory = async ({
    productId,
    quantity = 1,
    variant = {},
    session = null,
}) => {
    const numericQuantity = assertQuantity(quantity);
    const product = await Product.findById(productId)
        .select('name vendorId price stockQuantity stock lowStockThreshold variants.stockMap variants.prices variants.imageMap')
        .session(session);
    if (!product) throw new ApiError(404, 'Replacement product not found.');
    if (product.stock === 'out_of_stock') {
        throw new ApiError(409, `${product.name} is out of stock.`);
    }

    const variantKey = resolveVariantKey(product, variant);
    const variantStock = variantKey ? Number(product?.variants?.stockMap?.get?.(variantKey) ?? product?.variants?.stockMap?.[variantKey]) : null;
    if (variantKey && Number.isFinite(variantStock) && variantStock < numericQuantity) {
        throw new ApiError(409, `Only ${variantStock} units available for the selected variant of ${product.name}.`);
    }

    const updatePayload = { $inc: { stockQuantity: -numericQuantity } };
    if (variantKey && Number.isFinite(variantStock)) {
        updatePayload.$inc[`variants.stockMap.${variantKey}`] = -numericQuantity;
    }

    const updated = await Product.findOneAndUpdate(
        {
            _id: product._id,
            stock: { $ne: 'out_of_stock' },
            stockQuantity: { $gte: numericQuantity },
            ...(variantKey && Number.isFinite(variantStock)
                ? { [`variants.stockMap.${variantKey}`]: { $gte: numericQuantity } }
                : {}),
        },
        updatePayload,
        { new: true, session }
    );

    if (!updated) {
        throw new ApiError(409, `Insufficient stock to reserve ${product.name}. Please refresh and try again.`);
    }

    await Product.updateOne(
        { _id: updated._id },
        { $set: { stock: resolveNextStockState(updated) } },
        { session }
    );

    return {
        productSnapshot: resolveProductStockSnapshot(updated),
        reservation: {
            productId: updated._id,
            variantKey: variantKey || '',
            quantity: numericQuantity,
            reservedAt: new Date(),
        },
    };
};

export const releaseExchangeInventory = async ({
    productId,
    quantity = 1,
    variantKey = '',
    session = null,
}) => {
    const numericQuantity = assertQuantity(quantity);
    const product = await Product.findById(productId)
        .select('stockQuantity stock lowStockThreshold')
        .session(session);
    if (!product) return null;

    const updatePayload = { $inc: { stockQuantity: numericQuantity } };
    if (variantKey) {
        updatePayload.$inc[`variants.stockMap.${variantKey}`] = numericQuantity;
    }

    const updated = await Product.findByIdAndUpdate(
        productId,
        updatePayload,
        { new: true, session }
    );
    if (!updated) return null;

    await Product.updateOne(
        { _id: updated._id },
        { $set: { stock: resolveNextStockState(updated) } },
        { session }
    );

    return updated;
};

export const consumeExchangeInventory = async ({
    productId,
    quantity = 1,
    variantKey = '',
    session = null,
}) => {
    const numericQuantity = assertQuantity(quantity);
    const update = {
        $set: {
            stock: 'in_stock',
        },
        $inc: {
            stockQuantity: 0,
        },
    };
    if (variantKey) {
        update.$inc[`variants.stockMap.${variantKey}`] = 0;
    }

    await Product.updateOne({ _id: productId }, update, { session });
    return { productId, quantity: numericQuantity, variantKey };
};
