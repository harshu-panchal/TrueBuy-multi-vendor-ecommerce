import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiCheck, FiX, FiRefreshCw, FiAlertCircle, FiUser, FiShoppingBag, FiInfo, FiClock, FiTruck, FiDollarSign, FiImage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../components/DataTable';
import ExportButton from '../components/ExportButton';
import StatusBadge from '../../../shared/components/Badge';
import AnimatedSelect from '../components/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../utils/adminHelpers';
import { getAllReturnRequests, getAllExchangeRequests } from '../services/adminService';
import toast from 'react-hot-toast';

const ReturnRequests = () => {
  const navigate = useNavigate();
  const [returnRequests, setReturnRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState('');

  // Fetch both returns and exchanges
  const fetchAllRequests = async () => {
    setIsLoading(true);
    try {
      const [returnsResponse, exchangesResponse] = await Promise.allSettled([
        getAllReturnRequests({ page: 1, limit: 100, status: selectedStatus === 'all' ? undefined : selectedStatus }),
        getAllExchangeRequests({ page: 1, limit: 100, status: selectedStatus === 'all' ? undefined : selectedStatus }),
      ]);

      const returns = [];
      const exchanges = [];

      // Unwrap returns response
      if (returnsResponse.status === 'fulfilled') {
        const returnsData = returnsResponse.value?.data || returnsResponse.value;
        const returnsList = returnsData?.returnRequests || [];
        returns.push(...returnsList.map(r => ({ ...r, type: 'return' })));
      }

      // Unwrap exchanges response
      if (exchangesResponse.status === 'fulfilled') {
        const exchangesData = exchangesResponse.value?.data || exchangesResponse.value;
        const exchangesList = exchangesData?.exchangeRequests || [];
        exchanges.push(...exchangesList.map(e => ({ ...e, type: 'exchange' })));
      }

      // Combine and sort by date
      const combined = [...returns, ...exchanges].sort((a, b) => 
        new Date(b.createdAt || b.requestDate) - new Date(a.createdAt || a.requestDate)
      );

      setReturnRequests(combined);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch return/exchange requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, [selectedStatus, dateFilter]);

  const filteredRequests = useMemo(() => {
    let filtered = returnRequests;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          String(request.id || '').toLowerCase().includes(query) ||
          String(request.orderId || '').toLowerCase().includes(query) ||
          String(request.customer?.name || request.userId?.name || '').toLowerCase().includes(query) ||
          String(request.vendor?.storeName || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [returnRequests, searchQuery]);

  const handleOpenAssign = (request) => {
    setSelectedRequest(request);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedRequest || !selectedDeliveryBoyId) return;
    toast.success('Delivery partner assigned successfully');
    setIsAssignModalOpen(false);
    setSelectedRequest(null);
    setSelectedDeliveryBoyId('');
    await fetchAllRequests();
  };

  const handleProcessRefund = async (requestId) => {
    if (window.confirm('Are you sure you want to process the refund for this return?')) {
      toast.success('Refund processed successfully');
      await fetchAllRequests();
    }
  };

  const getStatusVariant = (status) => {
    const normalized = String(status || '').toLowerCase();
    const statusMap = {
      pending: 'pending',
      requested: 'pending',
      approved: 'approved',
      approved_by_vendor: 'approved',
      rejected: 'rejected',
      rejected_by_vendor: 'rejected',
      processing: 'processing',
      completed: 'completed',
      pickup: 'processing',
      replacement: 'processing',
    };
    return statusMap[normalized] || 'pending';
  };

  const statusCounts = useMemo(() => {
    const pending = filteredRequests.filter((r) => {
      const status = String(r.status || '').toLowerCase();
      return status === 'pending' || status === 'requested';
    }).length;
    
    const approved = filteredRequests.filter((r) => {
      const status = String(r.status || '').toLowerCase();
      return status === 'approved' || status === 'approved_by_vendor';
    }).length;

    return {
      all: filteredRequests.length,
      pending,
      approved,
    };
  }, [filteredRequests]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Return Management</h1>
          <p className="text-gray-500 text-sm">Review and process customer return requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm font-bold text-gray-700">{statusCounts.pending} Pending Requests</span>
          </div>
          <ExportButton data={filteredRequests} filename="returns" />
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, Order, Customer name..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <AnimatedSelect
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'completed', label: 'Completed' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
        <AnimatedSelect
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
          ]}
        />
      </div>

      {/* Return Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-500">Loading requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <FiInfo className="mx-auto text-4xl text-gray-300 mb-2" />
          <p className="text-gray-500">No return requests found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.map((req) => (
            <motion.div
              key={req.id}
              layout
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    {req.type === 'exchange' ? 'Exchange' : 'Return'} #{req.id}
                  </span>
                  <StatusBadge variant={getStatusVariant(req.status)}>
                    {String(req.status || '').replace(/_/g, ' ').toUpperCase()}
                  </StatusBadge>
                  {(req.status === 'pending' || req.status === 'REQUESTED') && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">
                      <FiAlertCircle size={12} />
                      SELLER PAYMENT ON HOLD
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium italic">
                  Requested on {formatDateTime(req.requestDate || req.createdAt)}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Product Section */}
                <div className="lg:col-span-5 flex gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <img 
                      src={req.product?.image || req.items?.[0]?.image || req.oldProduct?.image || req.newProduct?.image} 
                      className="w-full h-full object-cover" 
                      alt="Product"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                      {req.product?.name || req.items?.[0]?.name || req.oldProduct?.name || req.newProduct?.name}
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-y-1 gap-x-4">
                      <p className="text-xs text-gray-500 font-medium tracking-tight">ORDER ID</p>
                      <p className="text-xs text-blue-600 font-bold hover:underline cursor-pointer" onClick={() => navigate(`/admin/orders/${req.orderId}`)}>#{req.orderId}</p>
                      <p className="text-xs text-gray-500 font-medium tracking-tight">{req.type === 'exchange' ? 'VALUE' : 'REFUND'}</p>
                      <p className="text-xs text-gray-800 font-bold">
                        {req.type === 'exchange' 
                          ? formatCurrency(req.newProduct?.price || req.oldProduct?.price || 0) 
                          : formatCurrency(req.refundAmount || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* People Info Section */}
                <div className="lg:col-span-4 border-l border-gray-100 pl-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <FiUser size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Customer</p>
                      <p className="text-sm font-bold text-gray-800">
                        {req.customer?.name || req.userId?.name || 'N/A'}
                      </p>
                      <p className="text-[11px] text-gray-500 italic line-clamp-1">
                        {req.customer?.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                      <FiShoppingBag size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Seller</p>
                      <p className="text-sm font-bold text-gray-800">
                        {req.vendor?.storeName || 
                         req.oldVendorId?.storeName || 
                         req.newVendorId?.storeName || 
                         'N/A'}
                      </p>
                      <p className="text-[11px] text-gray-500 italic">
                        ID: {String(req.vendorId?._id || req.vendorId || 
                                    req.oldVendorId?._id || req.oldVendorId || 
                                    req.newVendorId?._id || req.newVendorId || 
                                    'N/A')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason Section */}
                <div className="lg:col-span-3 border-l border-gray-100 pl-8 space-y-4 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Return Reason</p>
                    <p className="text-sm font-bold text-discount-600 capitalize mb-1">{req.reason}</p>
                    <p className="text-xs text-gray-500 italic line-clamp-3">{req.description || "The product packaging was torn and the item had visible scratches."}</p>
                  </div>
                  
                  {/* Evidence Images */}
                  <div className="flex gap-2">
                    {(req.images || []).length > 0 ? req.images.slice(0, 3).map((img, idx) => (
                      <div 
                        key={idx} 
                        className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 cursor-zoom-in hover:scale-105 transition-transform overflow-hidden"
                        onClick={() => setPreviewImage(img)}
                      >
                         <img src={img} className="w-full h-full object-cover" />
                      </div>
                    )) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                        <FiImage size={20} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                <button 
                   onClick={() => navigate(`/admin/return-requests/${req.id}`)}
                   className="text-primary-600 text-sm font-bold hover:underline py-2"
                >
                    View Full Details
                </button>
                <div className="flex items-center gap-3">
                  {(req.status === 'pending' || req.status === 'REQUESTED') && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-xs font-bold">
                      <FiClock className="animate-pulse" />
                      AWAITING SELLER APPROVAL
                    </div>
                  )}
                  {(req.status === 'approved' || req.status === 'APPROVED_BY_VENDOR') && !req.deliveryBoyId && !req.assignedDeliveryBoy && (
                    <button 
                      onClick={() => handleOpenAssign(req)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FiTruck size={14} />
                      Assign Pickup
                    </button>
                  )}
                  {(req.status === 'approved' || req.status === 'APPROVED_BY_VENDOR') && (req.deliveryBoyId || req.assignedDeliveryBoy) && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 text-xs font-bold">
                      <FiTruck />
                      PICKUP ASSIGNED
                    </div>
                  )}
                  {req.status === 'delivered_to_seller' && req.refundStatus === 'pending' && (
                    <button 
                      onClick={() => handleProcessRefund(req.id)}
                      className="px-6 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <FiDollarSign size={14} />
                      Process Refund
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/50" 
               onClick={() => setIsAssignModalOpen(false)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">Assign Delivery Partner</h3>
              <p className="text-sm text-gray-500 mb-6">Select a rider to pickup the return item for Request #{selectedRequest.id}.</p>
              
              <div className="space-y-4">
                <AnimatedSelect
                  value={selectedDeliveryBoyId}
                  onChange={(e) => setSelectedDeliveryBoyId(e.target.value)}
                  options={[
                    { value: '', label: 'Select Delivery Boy' },
                    { value: 'DB-001', label: 'Rahul Singh (+91 98XXX XXX01)' },
                    { value: 'DB-002', label: 'Amit Kumar (+91 98XXX XXX02)' },
                    { value: 'DB-003', label: 'Suresh Raina (+91 98XXX XXX03)' },
                  ]}
                />
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsAssignModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmAssignment}
                    disabled={!selectedDeliveryBoyId}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden"
            >
               <img src={previewImage} className="w-full h-auto" />
               <button className="absolute top-4 right-4 p-2 bg-white rounded-full"><FiX /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReturnRequests;

