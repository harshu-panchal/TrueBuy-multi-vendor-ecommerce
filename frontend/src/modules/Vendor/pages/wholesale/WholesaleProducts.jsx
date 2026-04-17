import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useVendorB2BStore } from '../../store/vendorB2BStore';
import { formatPrice } from '../../../../shared/utils/helpers';

const WholesaleProducts = () => {
  const navigate = useNavigate();
  const {
    products,
    totalProducts,
    productsLoading,
    productsPage,
    productsPages,
    activeSellerVendorId,
    setActiveSeller,
    fetchWholesaleProducts,
    addToCart,
  } = useVendorB2BStore();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchWholesaleProducts({ page, limit: 20, search: search.trim() || undefined });
  }, [fetchWholesaleProducts, page, search]);

  const sellers = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => {
      const seller = p?.seller;
      const sellerId = String(p?.vendorId || '');
      if (!sellerId) return;
      if (!map.has(sellerId)) {
        map.set(sellerId, {
          id: sellerId,
          storeName: seller?.storeName || 'Vendor',
          storeLogo: seller?.storeLogo || '',
        });
      }
    });
    return Array.from(map.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!activeSellerVendorId) return products || [];
    return (products || []).filter((p) => String(p.vendorId) === String(activeSellerVendorId));
  }, [products, activeSellerVendorId]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wholesale Products</h1>
          <p className="text-sm text-gray-500">
            Browse approved wholesale listings ({totalProducts || 0})
          </p>
        </div>

        <button
          onClick={() => navigate('/vendor/wholesale/cart')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <FiShoppingCart />
          Go to Cart
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wholesale products..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <FiUsers className="text-gray-400" />
            <select
              value={activeSellerVendorId || ''}
              onChange={(e) => setActiveSeller(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white"
            >
              <option value="">All sellers</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.storeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {productsLoading ? (
          <div className="py-10 text-center text-gray-500">Loading wholesale products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No wholesale products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const image = p?.image || p?.images?.[0] || 'https://via.placeholder.com/400x300?text=Product';
              const moq = Number(p?.minOrderQty || 1);
              const tiers = Array.isArray(p?.bulkPricing) ? p.bulkPricing : [];

              return (
                <div key={p._id} className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex flex-col">
                  <div className="flex gap-3">
                    <img
                      src={image}
                      alt={p?.name}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200 bg-white"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/160?text=P';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{p?.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        Seller: {p?.seller?.storeName || 'Vendor'}
                      </div>
                      <div className="mt-1 text-sm font-bold text-gray-900">
                        {formatPrice(p?.price || 0)}
                      </div>
                      <div className="text-xs text-gray-500">MOQ: {moq}</div>
                    </div>
                  </div>

                  {tiers.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <div className="font-medium text-gray-700 mb-1">Bulk pricing</div>
                      <div className="flex flex-wrap gap-1">
                        {tiers.slice(0, 4).map((t, idx) => (
                          <span key={idx} className="px-2 py-1 rounded-full bg-white border border-gray-200">
                            {t.minQty}+ @ {formatPrice(t.price)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveSeller(String(p.vendorId));
                        navigate('/vendor/wholesale/cart');
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-gray-800 hover:bg-white transition-colors"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={() =>
                        addToCart({
                          sellerVendorId: String(p.vendorId),
                          productId: String(p._id),
                          quantity: moq,
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                      Add (MOQ)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            Page {productsPage} of {productsPages}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-xl border border-gray-200 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= productsPages}
              onClick={() => setPage((p) => Math.min(productsPages || p + 1, p + 1))}
              className="px-3 py-2 rounded-xl border border-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WholesaleProducts;
