import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useVendorB2BStore } from '../../store/vendorB2BStore';
import { formatPrice } from '../../../../shared/utils/helpers';
import { FiCheck, FiX } from 'react-icons/fi';
import { useVendorAuthStore } from '../../store/vendorAuthStore';

const statusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'delivered') return 'bg-green-100 text-green-700';
  if (s === 'rejected') return 'bg-red-100 text-red-700';
  if (s === 'accepted') return 'bg-blue-100 text-blue-700';
  if (s === 'shipped') return 'bg-purple-100 text-purple-700';
  return 'bg-yellow-100 text-yellow-700';
};

const WholesaleOrders = () => {
  const { orders, ordersLoading, fetchOrders, respondToOrder } = useVendorB2BStore();
  const { vendor } = useVendorAuthStore();
  const vendorId = vendor?.id;
  const [view, setView] = useState('all'); // all | buy | sell
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchOrders({ page: 1, limit: 50, view, status: status || undefined });
  }, [fetchOrders, view, status]);

  const pendingSellOrders = useMemo(() => {
    return (orders || []).filter((o) => String(o.status).toLowerCase() === 'pending');
  }, [orders]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">B2B Orders</h1>
          <p className="text-sm text-gray-500">Manage wholesale buying and selling</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white"
          >
            <option value="all">All</option>
            <option value="buy">Buying</option>
            <option value="sell">Selling</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white"
          >
            <option value="">Any status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        {ordersLoading ? (
          <div className="py-10 text-center text-gray-500">Loading B2B orders...</div>
        ) : (orders || []).length === 0 ? (
          <div className="py-10 text-center text-gray-500">No B2B orders found.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const isPending = String(o.status).toLowerCase() === 'pending';
              const buyerName =
                o?.buyerVendor?.storeName ||
                o?.buyerVendor?.name ||
                String(o.buyerVendorId || '');
              const sellerName =
                o?.sellerVendor?.storeName ||
                o?.sellerVendor?.name ||
                String(o.sellerVendorId || '');
              return (
                <div key={o._id || o.orderNumber} className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{o.orderNumber}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(o.status)}`}>
                        {String(o.status)}
                      </span>
                      <div className="text-sm font-bold text-gray-900">
                        {formatPrice(o.totalAmount || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-600">
                    Items: {(o.items || []).length} • Buyer: {buyerName} • Seller: {sellerName}
                  </div>

                  {view !== 'buy' && isPending && String(o.sellerVendorId) === String(vendorId) && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => respondToOrder({ id: o.orderNumber || o._id, action: 'accept' })}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                      >
                        <FiCheck />
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt('Rejection reason (optional):') || '';
                          respondToOrder({ id: o.orderNumber || o._id, action: 'reject', reason });
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                      >
                        <FiX />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {view === 'sell' && pendingSellOrders.length > 0 && (
          <div className="mt-4 text-xs text-gray-500">
            Tip: Pending sell orders require Accept/Reject before delivery can be assigned.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WholesaleOrders;
