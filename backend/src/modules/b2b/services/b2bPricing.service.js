const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

export const normalizeBulkPricing = (tiers = []) => {
    const normalized = (tiers || [])
        .map((tier) => ({
            minQty: Math.max(1, Math.floor(toNumber(tier?.minQty, 0))),
            price: Math.max(0, toNumber(tier?.price, 0)),
        }))
        .filter((t) => Number.isFinite(t.minQty) && Number.isFinite(t.price))
        .sort((a, b) => a.minQty - b.minQty);

    const deduped = [];
    const seen = new Set();
    normalized.forEach((t) => {
        if (seen.has(t.minQty)) return;
        seen.add(t.minQty);
        deduped.push(t);
    });
    return deduped;
};

export const getWholesaleMoq = (product) => {
    const moq = toNumber(product?.minOrderQty, 1);
    return Math.max(1, Math.floor(moq));
};

export const calculateWholesaleUnitPrice = ({ product, quantity }) => {
    const qty = Math.max(1, Math.floor(toNumber(quantity, 1)));
    const base = Math.max(0, toNumber(product?.price, 0));
    const tiers = normalizeBulkPricing(product?.bulkPricing || []);

    let appliedTierMinQty = 0;
    let unitPrice = base;
    for (const tier of tiers) {
        if (qty >= tier.minQty) {
            unitPrice = tier.price;
            appliedTierMinQty = tier.minQty;
        } else {
            break;
        }
    }

    return { unitPrice, appliedTierMinQty };
};

export const calculateCartTotals = (items = []) => {
    const subtotal = (items || []).reduce((sum, item) => sum + Math.max(0, toNumber(item?.lineTotal, 0)), 0);
    return { subtotal, totalAmount: subtotal };
};

