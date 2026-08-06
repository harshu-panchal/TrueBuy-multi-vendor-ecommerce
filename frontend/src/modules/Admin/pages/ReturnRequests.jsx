import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiEye, 
  FiCheck, 
  FiX, 
  FiRefreshCw, 
  FiAlertCircle, 
  FiUser, 
  FiShoppingBag, 
  FiInfo, 
  FiClock, 
  FiTruck, 
  FiDollarSign, 
  FiImage,
  FiDownload
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DataTable from '../components/DataTable';
import Badge from '../../../shared/components/Badge';
import AnimatedSelect from '../components/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../utils/adminHelpers';
import { useReturnStore } from '../../../shared/store/returnStore';
import { getAllDeliveryBoys } from '../services/adminService';
import toast from 'react-hot-toast';

// Reverse Logistics Status Forward-Only Allowed Transitions
const ALLOWED_RETURN_TRANSITIONS = {
  requested: [
    { value: 'requested', label: 'Requested' },
    { value: 'approved', label: 'Approve Return' },
    { value: 'rejected', label: 'Reject Return' },
  ],
  approved: [
    { value: 'approved', label: 'Approved' },
    { value: 'pickup_assigned', label: 'Assign Reverse Pickup' },
    { value: 'rejected', label: 'Reject Return' },
  ],
  pickup_assigned: [
    { value: 'pickup_assigned', label: 'Pickup Assigned' },
    { value: 'picked_up', label: 'Package Picked Up' },
    { value: 'rejected', label: 'Reject Return' },
  ],
  picked_up: [
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'inspected', label: 'Mark Inspected' },
    { value: 'rejected', label: 'Reject Return' },
  ],
  inspected: [
    { value: 'inspected', label: 'Inspected' },
    { value: 'refunded', label: 'Issue Refund' },
    { value: 'rejected', label: 'Reject Return' },
  ],
  refunded: [{ value: 'refunded', label: 'Refunded (Completed)' }],
  rejected: [{ value: 'rejected', label: 'Rejected' }],
};

const fetchAssignableDeliveryBoys = async () => {
  const first = await getAllDeliveryBoys({
    page: 1,
    limit: 100,
    status: 'active',
    applicationStatus: 'approved',
  });

  const firstRows = first?.data?.deliveryBoys || [];
  const totalPages = Number(first?.data?.pagination?.pages || 1);
  if (totalPages <= 1) return firstRows;

  const requests = [];
  for (let page = 2; page <= totalPages; page += 1) {
    requests.push(
      getAllDeliveryBoys({
        page,
        limit: 100,
        status: 'active',
        applicationStatus: 'approved',
      })
    );
  }

  const results = await Promise.all(requests);
  return firstRows.concat(results.flatMap((res) => res?.data?.deliveryBoys || []));
};

const ReturnRequests = () => {
  const navigate = useNavigate();
  const { returnRequests, isLoading, fetchReturnRequests, assignDeliveryToReturn, processReturnRefund, updateReturnStatus } = useReturnStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState('');
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const handleFetchData = () => {
    fetchReturnRequests({ role: 'admin', page: 1, limit: 100 }).catch(() => null);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadDeliveryBoys = async () => {
      try {
        const rows = await fetchAssignableDeliveryBoys();
        if (isMounted) setDeliveryBoys(rows);
      } catch (error) {
        console.error('[Admin ReturnRequests] failed to fetch delivery boys', error);
        if (isMounted) setDeliveryBoys([]);
      }
    };
    loadDeliveryBoys();
    return () => { isMounted = false; };
  }, []);

  // Filter Computation
  const filteredRequests = useMemo(() => {
    return returnRequests.filter(req => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = String(req.returnId || req.id || req._id || '').toLowerCase().includes(q);
        const matchOrder = String(req.orderId || req.order?.orderId || '').toLowerCase().includes(q);
        const matchCustomer = String(req.customer?.name || req.userId?.name || '').toLowerCase().includes(q);
        const matchVendor = String(req.vendor?.storeName || '').toLowerCase().includes(q);
        if (!matchId && !matchOrder && !matchCustomer && !matchVendor) return false;
      }
      // Status
      if (selectedStatus !== 'all') {
        const currentStatus = String(req.status || 'requested').toLowerCase();
        if (currentStatus !== selectedStatus) return false;
      }
      return true;
    });
  }, [returnRequests, searchQuery, selectedStatus]);

  // Action Handlers
  const handleStatusChange = async (reqId, newStatus) => {
    try {
      if (newStatus === 'refunded') {
        await processReturnRefund(reqId, { refundType: 'wallet' });
        toast.success(`Refund processed for Return #${reqId}`);
      } else {
        await updateReturnStatus(reqId, newStatus);
        toast.success(`Return #${reqId} status updated to ${newStatus}`);
      }
      handleFetchData();
    } catch (error) {
      console.error("Return status update error:", error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleOpenAssign = (request) => {
    setSelectedRequest(request);
    setSelectedDeliveryBoyId(String(request.assignedDeliveryBoy?._id || request.assignedDeliveryBoy?.id || request.assignedDeliveryBoy || ''));
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedRequest) return;
    if (!selectedDeliveryBoyId) {
      toast.error('Please select a delivery partner');
      return;
    }
    try {
      await assignDeliveryToReturn(selectedRequest._id || selectedRequest.id, selectedDeliveryBoyId);
      toast.success('Delivery partner assigned for reverse pickup');
      setIsAssignModalOpen(false);
      setSelectedRequest(null);
      handleFetchData();
    } catch (error) {
      console.error("Assign error:", error);
      toast.error('Failed to assign delivery partner');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const exportData = filteredRequests.map(r => ({
      'Return ID': r.returnId || r.id,
      'Order ID': r.orderId || r.order?.orderId || 'N/A',
      'Customer': r.customer?.name || r.userId?.name || 'N/A',
      'Vendor Store': r.vendor?.storeName || 'N/A',
      'Reason': r.reason || 'N/A',
      'Refund Amount': r.refundAmount || 0,
      'Status': r.status,
      'Created Date': formatDateTime(r.createdAt),
    }));

    if (exportData.length === 0) {
      toast.error('No return records to export');
      return;
    }

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Return_Requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for rendering status selector
  const renderStatusDropdown = (row) => {
    const currentStatus = String(row.status || 'requested').toLowerCase();
    const statusMap = {
      requested: { label: 'Requested', variant: 'warning' },
      approved: { label: 'Approved', variant: 'info' },
      pickup_assigned: { label: 'Pickup Assigned', variant: 'info' },
      picked_up: { label: 'Picked Up', variant: 'primary' },
      inspected: { label: 'Inspected', variant: 'primary' },
      refunded: { label: 'Refunded', variant: 'success' },
      rejected: { label: 'Rejected', variant: 'danger' },
    };
    const config = statusMap[currentStatus] || { label: currentStatus, variant: 'default' };
    const availableOptions = ALLOWED_RETURN_TRANSITIONS[currentStatus] || [{ value: currentStatus, label: config.label }];
    const isTerminal = ['refunded', 'rejected'].includes(currentStatus);

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant={config.variant} size="sm">
          {config.label}
        </Badge>
        {!isTerminal ? (
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(row._id || row.id, e.target.value)}
            className="text-[11px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-sm"
          >
            {availableOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Locked</span>
        )}
      </div>
    );
  };

  // Desktop Table Columns
  const columns = [
    {
      key: 'returnId',
      label: 'Return ID',
      sortable: true,
      render: (v, row) => (
        <button
          onClick={() => navigate(`/admin/sales/return-requests/${row._id || row.id}`)}
          className="font-mono text-xs font-bold text-primary-600 hover:underline cursor-pointer whitespace-nowrap"
        >
          {v || row.id || `RET-${String(row._id).slice(-6).toUpperCase()}`}
        </button>
      )
    },
    {
      key: 'orderId',
      label: 'Master Order',
      sortable: true,
      render: (v, row) => (
        <span className="font-semibold text-xs text-gray-800 whitespace-nowrap">
          {v || row.order?.orderId || 'N/A'}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (v, row) => (
        <div className="max-w-[140px]">
          <p className="font-bold text-xs text-gray-800 truncate">{v?.name || row.userId?.name || 'Customer'}</p>
          <p className="text-[11px] text-gray-500 truncate">{v?.email || row.userId?.email || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'Return Reason',
      sortable: true,
      render: (v) => (
        <span className="text-xs font-medium text-gray-700 truncate max-w-[150px] block" title={v}>
          {v || 'Defective/Wrong Item'}
        </span>
      )
    },
    {
      key: 'refundAmount',
      label: 'Refund Amount',
      sortable: true,
      render: (v) => <span className="font-extrabold text-xs text-gray-900 whitespace-nowrap">{formatCurrency(v || 0)}</span>
    },
    {
      key: 'assignedDeliveryBoy',
      label: 'Reverse Pickup Partner',
      sortable: false,
      render: (v, row) => {
        const boyName = v?.name || (typeof v === 'string' ? deliveryBoys.find(b => String(b._id || b.id) === v)?.name : null);
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {boyName ? (
              <span className="font-bold text-xs text-gray-800 flex items-center gap-1">
                <FiTruck className="text-primary-600" />
                {boyName}
              </span>
            ) : (
              <span className="text-xs text-gray-400 font-medium">Unassigned</span>
            )}
            <button
              onClick={() => handleOpenAssign(row)}
              className="text-[10px] text-primary-600 hover:text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded font-bold border border-primary-200"
            >
              {boyName ? 'Change' : 'Assign'}
            </button>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status & Transition',
      sortable: true,
      render: (_, row) => renderStatusDropdown(row)
    },
    {
      key: 'createdAt',
      label: 'Requested Date',
      sortable: true,
      render: (v) => <span className="text-xs text-gray-600 whitespace-nowrap">{formatDateTime(v)}</span>
    },
    {
      key: 'action',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1 whitespace-nowrap">
          {row.images?.length > 0 && (
            <button
              onClick={() => setPreviewImage(row.images[0])}
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold"
              title="View Damage Proof Photos"
            >
              <FiImage size={14} />
            </button>
          )}
          <button
            onClick={() => navigate(`/admin/sales/return-requests/${row._id || row.id}`)}
            className="p-1.5 bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-lg text-xs font-bold border border-gray-200 flex items-center gap-1"
            title="View Full Details"
          >
            <FiEye size={14} />
          </button>
        </div>
      )
    }
  ];

  // Mobile Responsive Card Renderer
  const renderMobileCard = (row) => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
          <div>
            <span className="font-mono text-xs font-bold text-primary-600">{row.returnId || row.id}</span>
            <p className="text-[11px] text-gray-500 font-medium">Order: <span className="font-semibold text-gray-800">{row.orderId || row.order?.orderId || 'N/A'}</span></p>
          </div>
          {renderStatusDropdown(row)}
        </div>

        {/* Customer & Reason */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Customer</p>
            <p className="font-bold text-gray-800 truncate">{row.customer?.name || row.userId?.name || 'Customer'}</p>
            <p className="text-[11px] text-gray-500 truncate">{row.customer?.email || row.userId?.email || ''}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Refund Value</p>
            <p className="font-extrabold text-sm text-gray-900">{formatCurrency(row.refundAmount || 0)}</p>
            <p className="text-[11px] text-gray-500 truncate">{row.reason || 'Defective'}</p>
          </div>
        </div>

        {/* Reverse Pickup Partner */}
        <div className="flex justify-between items-center text-xs pt-1">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Reverse Pickup Partner</p>
            <p className="font-bold text-gray-800 flex items-center gap-1">
              <FiTruck className="text-primary-600" />
              {row.assignedDeliveryBoy?.name || 'Unassigned'}
            </p>
          </div>
          <button
            onClick={() => handleOpenAssign(row)}
            className="px-2 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-xs font-bold"
          >
            {row.assignedDeliveryBoy ? 'Change Partner' : 'Assign Partner'}
          </button>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[11px] text-gray-500">{formatDateTime(row.createdAt)}</span>
          <button
            onClick={() => navigate(`/admin/sales/return-requests/${row._id || row.id}`)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <FiEye size={14} />
            <span>View Return Details</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">
            Return Requests & RMA Management
          </h1>
          <p className="text-sm text-gray-500">
            Process customer returns, reverse pickup logistics, product inspection, and refund processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFetchData}
            className="p-2.5 text-gray-600 hover:text-primary-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            title="Refresh Return Requests"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search return ID, order ID, customer name, vendor store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <AnimatedSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: "all", label: "All Return Statuses" },
              { value: "requested", label: "Requested (Pending Review)" },
              { value: "approved", label: "Approved for Return" },
              { value: "pickup_assigned", label: "Reverse Pickup Assigned" },
              { value: "picked_up", label: "Picked Up from Customer" },
              { value: "inspected", label: "Inspected at Vendor" },
              { value: "refunded", label: "Refunded (Completed)" },
              { value: "rejected", label: "Rejected Requests" },
            ]}
            className="text-sm py-2"
          />
        </div>
      </div>

      {/* Main DataTable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredRequests}
          columns={columns}
          pagination={true}
          itemsPerPage={15}
          isLoading={isLoading}
          renderMobileCard={renderMobileCard}
        />
      </div>

      {/* Reverse Pickup Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-gray-200"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <FiTruck className="text-primary-600" />
                  Assign Reverse Pickup Partner
                </h3>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-xl space-y-1 border border-gray-200">
                  <p className="text-gray-500">Return ID: <span className="font-mono font-bold text-gray-900">{selectedRequest.returnId || selectedRequest.id}</span></p>
                  <p className="text-gray-500">Customer: <span className="font-bold text-gray-800">{selectedRequest.customer?.name || selectedRequest.userId?.name}</span></p>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Select Delivery Partner:</label>
                  <AnimatedSelect
                    value={selectedDeliveryBoyId}
                    onChange={(e) => setSelectedDeliveryBoyId(e.target.value)}
                    options={[
                      { value: "", label: "Select active delivery partner..." },
                      ...deliveryBoys.map(boy => ({
                        value: String(boy._id || boy.id),
                        label: `${boy.name} (${boy.phone || 'N/A'})`,
                      }))
                    ]}
                    className="text-xs py-2 w-full"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAssign}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700"
                >
                  Confirm Assignment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proof Photo Preview Lightbox Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl max-h-[85vh] bg-white p-2 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 bg-black/60 text-white p-1.5 rounded-full hover:bg-black"
              >
                <FiX size={18} />
              </button>
              <img src={previewImage} alt="Return Damage Proof" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReturnRequests;
