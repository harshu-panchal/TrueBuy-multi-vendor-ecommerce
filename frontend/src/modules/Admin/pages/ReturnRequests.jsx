import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiCheck, FiX, FiRefreshCw, FiAlertCircle, FiUser, FiShoppingBag, FiInfo, FiClock, FiTruck, FiDollarSign } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../components/DataTable';
import ExportButton from '../components/ExportButton';
import StatusBadge from '../../../shared/components/Badge';
import AnimatedSelect from '../components/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../utils/adminHelpers';
import { useReturnStore } from '../../../shared/store/returnStore';

const ReturnRequests = () => {
  const navigate = useNavigate();
  const {
    returnRequests,
    isLoading,
    fetchReturnRequests,
    updateReturnStatus,
  } = useReturnStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState('');

  const { assignDeliveryToReturn, processReturnRefund } = useReturnStore();

  useEffect(() => {
    const now = new Date();
    const formatDate = (date) => date.toISOString().slice(0, 10);
    let startDate;
    let endDate;

    if (dateFilter === 'today') {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      startDate = formatDate(today);
      endDate = formatDate(today);
    } else if (dateFilter === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      startDate = formatDate(weekStart);
      endDate = formatDate(now);
    } else if (dateFilter === 'month') {
      const monthStart = new Date(now);
      monthStart.setDate(now.getDate() - 30);
      monthStart.setHours(0, 0, 0, 0);
      startDate = formatDate(monthStart);
      endDate = formatDate(now);
    }

    fetchReturnRequests({
      search: searchQuery,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      startDate,
      endDate,
    });
  }, [searchQuery, selectedStatus, dateFilter, fetchReturnRequests]);

  const filteredRequests = useMemo(() => {
    return returnRequests;
  }, [returnRequests]);

  const handleStatusUpdate = async (requestId, newStatus, action = '') => {
    const statusData = { status: newStatus };
    if (newStatus === 'approved' && action === 'approve') {
      statusData.refundStatus = 'pending';
    } else if (newStatus === 'completed' && action === 'process-refund') {
      statusData.refundStatus = 'processed';
    }
    await updateReturnStatus(requestId, statusData);
  };

  const handleOpenAssign = (request) => {
    setSelectedRequest(request);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedRequest || !selectedDeliveryBoyId) return;
    const success = await assignDeliveryToReturn(selectedRequest.id, selectedDeliveryBoyId);
    if (success) {
      setIsAssignModalOpen(false);
      setSelectedRequest(null);
      setSelectedDeliveryBoyId('');
    }
  };

  const handleProcessRefund = async (requestId) => {
    if (window.confirm('Are you sure you want to process the refund for this return?')) {
      await processReturnRefund(requestId);
    }
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      pending: 'pending',
      approved: 'approved',
      rejected: 'rejected',
      processing: 'processing',
      completed: 'completed',
    };
    return statusMap[status] || 'pending';
  };

  const statusCounts = useMemo(() => {
    return {
      all: filteredRequests.length,
      pending: filteredRequests.filter((r) => r.status === 'pending').length,
      approved: filteredRequests.filter((r) => r.status === 'approved').length,
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
                  <span className="text-xs font-bold text-gray-400 uppercase">Return #{req.id}</span>
                  <StatusBadge variant={getStatusVariant(req.status)}>{req.status.toUpperCase()}</StatusBadge>
                  {req.status === 'pending' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">
                      <FiAlertCircle size={12} />
                      SELLER PAYMENT ON HOLD
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium italic">Requested on {formatDateTime(req.requestDate)}</p>
              </div>

              {/* Card Body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Product Section */}
                <div className="lg:col-span-5 flex gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <img src={req.product?.image || req.items?.[0]?.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{req.product?.name || req.items?.[0]?.name}</h3>
                    <div className="mt-2 grid grid-cols-2 gap-y-1 gap-x-4">
                      <p className="text-xs text-gray-500 font-medium tracking-tight">ORDER ID</p>
                      <p className="text-xs text-blue-600 font-bold hover:underline cursor-pointer" onClick={() => navigate(`/admin/orders/${req.orderId}`)}>#{req.orderId}</p>
                      <p className="text-xs text-gray-500 font-medium tracking-tight">PRICE</p>
                      <p className="text-xs text-gray-800 font-bold">{formatCurrency(req.refundAmount)}</p>
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
                      <p className="text-sm font-bold text-gray-800">{req.customer?.name}</p>
                      <p className="text-[11px] text-gray-500 italic line-clamp-1">{req.customer?.address || 'Mumbai, India'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                      <FiShoppingBag size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Seller</p>
                      <p className="text-sm font-bold text-gray-800">{req.vendor?.storeName || 'Premium Electronics'}</p>
                      <p className="text-[11px] text-gray-500 italic">ID: {req.vendorId || 'VEND-991'}</p>
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
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 cursor-zoom-in hover:scale-105 transition-transform overflow-hidden"
                        onClick={() => setPreviewImage('https://via.placeholder.com/300')}
                      >
                         <img src="https://via.placeholder.com/50" className="w-full h-full object-cover" />
                      </div>
                    ))}
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
                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-xs font-bold">
                      <FiClock className="animate-pulse" />
                      AWAITING SELLER APPROVAL
                    </div>
                  )}
                  {req.status === 'approved' && !req.deliveryBoyId && (
                    <button 
                      onClick={() => handleOpenAssign(req)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FiTruck size={14} />
                      Assign Pickup
                    </button>
                  )}
                  {req.status === 'approved' && req.deliveryBoyId && (
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

