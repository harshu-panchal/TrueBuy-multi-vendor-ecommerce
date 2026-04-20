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
    fetchWholesaleProducts,
    setActiveSeller,
  } = useVendorB2BStore();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchWholesaleProducts({ page, limit: 20, search: search.trim() || undefined });
  }, [fetchWholesaleProducts, page, search]);

  const filteredProducts = useMemo(() => {
    return products || [];
  }, [products]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wholesale Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">Order products directly from other vendors at wholesale prices.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <button
            onClick={() => navigate('/vendor/wholesale/cart')}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 relative"
          >
            <FiShoppingCart className="text-xl text-gray-600" />
          </button>
        </div>
      </div>

      {productsLoading && !products.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium whitespace-nowrap">Fetching products...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <motion.div
                key={p._id || p.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md"
              >
                <div className="aspect-video relative overflow-hidden bg-gray-50">
                  <img
                    src={p.image || (p.images && p.images[0]) || 'https://via.placeholder.com/400x225?text=Product'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x225?text=Product';
                    }}
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-primary-600 border border-primary-100 italic">
                    Min order: {p.minOrderQty || 1}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
                      <FiUsers className="text-primary-500" />
                      <span className="truncate">{p.vendorName || 'Trustworthy Seller'}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug h-10 group-hover:text-primary-600 transition-colors">
                      {p.name}
                    </h3>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Starting at</div>
                      <div className="text-xl font-black text-primary-600">
                        {formatPrice(p.wholesalePrice || p.price)}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSeller(String(p.vendorId));
                        navigate('/vendor/wholesale/cart');
                      }}
                      className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-sm hover:bg-primary-700 hover:shadow-glow-primary transition-all active:scale-95"
                    >
                      Trade Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No products available in the wholesale marketplace.</p>
            </div>
          )}

          {productsPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: productsPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    page === n
                      ? 'bg-primary-600 text-white shadow-glow-primary'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default WholesaleProducts;
