import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useVendorB2BStore } from '../../store/vendorB2BStore';
import { formatPrice } from '../../../../shared/utils/helpers';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

const WholesaleCart = () => {
  const navigate = useNavigate();
  const {
    activeSellerVendorId,
    cart,
    cartLoading,
    cartSaving,
    fetchCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    placeOrder,
  } = useVendorB2BStore();

  const [buyerNote, setBuyerNote] = useState('');
  const [qtyDrafts, setQtyDrafts] = useState({});

  useEffect(() => {
    if (activeSellerVendorId) {
      fetchCart(activeSellerVendorId);
    }
  }, [fetchCart, activeSellerVendorId]);

  const items = cart?.items || [];
  useEffect(() => {
    const next = {};
    (items || []).forEach((it) => {
      next[`${it.productId}-${it.variantKey || ''}`] = Number(it.quantity || 1);
    });
    setQtyDrafts(next);
  }, [items]);

  const sellerName = useMemo(() => {
    if (!items.length) return '';
    const first = items[0];
    return first?.sellerVendorId ? String(first.sellerVendorId) : '';
  }, [items]);

  if (!activeSellerVendorId) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">B2B Cart</h1>
          <p className="text-sm text-gray-500">Select a seller by adding items from Wholesale Products.</p>
        </div>
        <button
          onClick={() => navigate('/vendor/wholesale/products')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
        >
          <FiArrowLeft />
          Browse Wholesale Products
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">B2B Cart</h1>
          <p className="text-sm text-gray-500 truncate">
            Seller: {sellerName || activeSellerVendorId}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/vendor/wholesale/products')}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          >
            Add More
          </button>
          <button
            disabled={cartSaving || cartLoading || items.length === 0}
            onClick={() => clearCart(activeSellerVendorId)}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
        {cartLoading ? (
          <div className="py-10 text-center text-gray-500">Loading cart...</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-gray-500">Cart is empty.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={`${it.productId}-${it.variantKey || ''}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <img
                  src={it.image || 'https://via.placeholder.com/120?text=P'}
                  alt={it.name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200 bg-white"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/120?text=P';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{it.name}</div>
                  <div className="text-xs text-gray-500">
                    MOQ: {it.minOrderQty} • Unit: {formatPrice(it.unitPrice || 0)}
                    {it.appliedTierMinQty ? ` • Tier: ${it.appliedTierMinQty}+` : ''}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={qtyDrafts[`${it.productId}-${it.variantKey || ''}`] ?? Number(it.quantity || 1)}
                      onChange={(e) => {
                        const nextQty = Math.max(1, Number(e.target.value || 1));
                        const key = `${it.productId}-${it.variantKey || ''}`;
                        setQtyDrafts((prev) => ({ ...prev, [key]: nextQty }));
                      }}
                      onBlur={() => {
                        const key = `${it.productId}-${it.variantKey || ''}`;
                        const nextQty = Math.max(1, Number(qtyDrafts[key] ?? it.quantity ?? 1));
                        if (Number(nextQty) === Number(it.quantity)) return;
                        updateCartItem({
                          sellerVendorId: activeSellerVendorId,
                          productId: String(it.productId),
                          quantity: nextQty,
                          variantKey: it.variantKey,
                          variant: it.variant,
                        });
                      }}
                      className="w-24 px-3 py-2 rounded-xl border border-gray-200 bg-white"
                      disabled={cartSaving}
                    />
                    <div className="text-sm font-bold text-gray-900">
                      {formatPrice(it.lineTotal || 0)}
                    </div>
                  </div>
                </div>
                <button
                  disabled={cartSaving}
                  onClick={() =>
                    removeCartItem({
                      sellerVendorId: activeSellerVendorId,
                      productId: String(it.productId),
                      variantKey: it.variantKey,
                    })
                  }
                  className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-50"
                  aria-label="Remove item"
                >
                  <FiTrash2 className="text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Subtotal</div>
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(cart?.subtotal || 0)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Buyer note (optional)</label>
            <textarea
              value={buyerNote}
              onChange={(e) => setBuyerNote(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"
              rows={3}
              placeholder="Add instructions for the seller..."
            />
          </div>

          <button
            disabled={cartSaving || cartLoading || items.length === 0}
            onClick={async () => {
              const order = await placeOrder({ sellerVendorId: activeSellerVendorId, buyerNote });
              if (order) {
                navigate('/vendor/wholesale/orders');
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <FiShoppingBag />
            Place Wholesale Order
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WholesaleCart;
