import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiUser, 
  FiMail, 
  FiShoppingBag, 
  FiRepeat, 
  FiCalendar,
  FiRefreshCw,
  FiDownload,
  FiPauseCircle,
  FiPlayCircle,
  FiXCircle,
  FiInfo
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import Badge from '../../../../shared/components/Badge';
import AnimatedSelect from '../../components/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../../utils/adminHelpers';
import { getAllRecurringPayments, updateRecurringPaymentStatus } from '../../services/adminService';
import toast from 'react-hot-toast';

const RecurringPayments = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filter State
  const [filters, setFilters] = useState({
    customerName: '',
    customerEmail: '',
    initialOrderId: '',
    status: 'all'
  });

  // Modal State
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    profile: null,
  });

  // Fetch Live Data from Backend API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllRecurringPayments({
        status: filters.status === 'all' ? undefined : filters.status,
        limit: 200,
      });

      const fetchedSubscriptions = response.data?.subscriptions || [];
      
      // Normalize data structure for UI
      const normalizedData = fetchedSubscriptions.map((sub, idx) => {
        const subscriberName = sub.vendor?.storeName || sub.vendor?.name || sub.customerName || `Subscriber #${idx + 1}`;
        const subscriberEmail = sub.vendor?.email || sub.customerEmail || 'n/a';
        const planName = sub.subscriptionPlan?.name || 'Recurring Plan';
        const cycleLength = sub.billingCycleLength || 1;
        const cyclePeriod = sub.billingCyclePeriod || (sub.subscriptionPlan?.billingCycle === 'yearly' ? 'Years' : 'Months');
        const completed = sub.cyclesCompleted || 1;
        const total = sub.totalCycles || (sub.subscriptionPlan?.billingCycle === 'yearly' ? 1 : 12);
        const remaining = Math.max(0, total - completed);

        return {
          ...sub,
          id: sub._id || `REC-${idx + 1}`,
          customer: subscriberName,
          email: subscriberEmail,
          planName: planName,
          cycleLength: cycleLength,
          cyclePeriod: cyclePeriod,
          isActive: sub.status === 'active' || sub.isActive === true,
          status: sub.status || (sub.isActive ? 'active' : 'paused'),
          initialOrder: sub.initialOrderId || sub.paymentId || `ORD-${sub._id?.slice(-6).toUpperCase()}`,
          startDate: sub.startDate || sub.createdAt,
          nextPayment: sub.nextPaymentDate || sub.expiryDate || sub.createdAt,
          totalCycles: total,
          cyclesCompleted: completed,
          cyclesRemaining: remaining,
          createdOn: sub.createdAt,
          price: sub.subscriptionPlan?.price || sub.price || 0,
        };
      });

      setPayments(normalizedData);
    } catch (error) {
      console.error("Failed to fetch recurring payments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle Recurring Profile Status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRecurringPaymentStatus(id, newStatus);
      toast.success(`Recurring profile status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  // Filtered Data Computation
  const filteredData = useMemo(() => {
    return payments.filter(item => {
      const matchName = !filters.customerName || item.customer.toLowerCase().includes(filters.customerName.toLowerCase());
      const matchEmail = !filters.customerEmail || item.email.toLowerCase().includes(filters.customerEmail.toLowerCase());
      const matchOrder = !filters.initialOrderId || item.initialOrder.toLowerCase().includes(filters.initialOrderId.toLowerCase());

      return matchName && matchEmail && matchOrder;
    });
  }, [payments, filters]);

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredData.map(p => p.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleResetFilters = () => {
    setFilters({ customerName: '', customerEmail: '', initialOrderId: '', status: 'all' });
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const exportData = filteredData.map(p => ({
      'Profile ID': p.id,
      'Subscriber Name': p.customer,
      'Subscriber Email': p.email,
      'Plan Name': p.planName,
      'Cycle': `${p.cycleLength} ${p.cyclePeriod}`,
      'Status': p.status,
      'Initial Order ID': p.initialOrder,
      'Start Date': formatDateTime(p.startDate),
      'Next Payment Date': formatDateTime(p.nextPayment),
      'Cycles (Completed/Total)': `${p.cyclesCompleted} / ${p.totalCycles}`,
    }));

    if (exportData.length === 0) {
      toast.error('No recurring payment records to export');
      return;
    }

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Recurring_Payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for rendering status selector
  const renderStatusSelector = (row) => {
    const currentStatus = String(row.status || "active").toLowerCase();
    const statusConfigMap = {
      active: { label: "Active", variant: "success" },
      paused: { label: "Paused", variant: "warning" },
      cancelled: { label: "Cancelled", variant: "danger" },
      expired: { label: "Expired", variant: "danger" },
    };
    const config = statusConfigMap[currentStatus] || { label: currentStatus, variant: "default" };

    return (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Badge variant={config.variant} size="sm">
          {config.label}
        </Badge>
        <select
          value={currentStatus}
          onChange={(e) => handleStatusChange(row._id || row.id, e.target.value)}
          className="text-[11px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-sm"
        >
          <option value="active">Active</option>
          <option value="paused">Pause</option>
          <option value="cancelled">Cancel</option>
        </select>
      </div>
    );
  };

  // Desktop Table Columns
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input 
          type="checkbox" 
          checked={selectedIds.size === filteredData.length && filteredData.length > 0} 
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      ),
      sortable: false,
      render: (_, row) => (
        <input 
          type="checkbox" 
          checked={selectedIds.has(row.id)} 
          onChange={() => handleSelectRow(row.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      )
    },
    { key: 'id', label: 'Profile ID', sortable: true, render: (v) => <span className="font-mono text-xs font-bold text-primary-600 whitespace-nowrap">{v}</span> },
    { 
      key: 'customer', 
      label: 'Subscriber', 
      sortable: true, 
      render: (v, row) => (
        <div className="max-w-[170px]">
          <p className="font-bold text-xs text-gray-800 truncate">{v}</p>
          <p className="text-[11px] text-gray-500 truncate">{row.email}</p>
        </div>
      )
    },
    { 
      key: 'planName', 
      label: 'Subscription Plan', 
      sortable: true, 
      render: (v, row) => (
        <div>
          <p className="font-bold text-xs text-gray-800">{v}</p>
          <p className="text-[11px] text-gray-500">{row.cycleLength} {row.cyclePeriod}</p>
        </div>
      )
    },
    { key: 'initialOrder', label: 'Initial Order', sortable: true, render: (v) => <span className="font-semibold text-xs text-gray-700 whitespace-nowrap">{v}</span> },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true, 
      render: (_, row) => renderStatusSelector(row)
    },
    { key: 'startDate', label: 'Start Date', sortable: true, render: (v) => <span className="text-xs text-gray-600 whitespace-nowrap">{formatDateTime(v)}</span> },
    { key: 'nextPayment', label: 'Next Payment Due', sortable: true, render: (v) => <span className="text-xs font-bold text-gray-800 whitespace-nowrap">{formatDateTime(v)}</span> },
    { 
      key: 'cycles', 
      label: 'Progress (Cycles)', 
      sortable: false, 
      render: (_, row) => (
        <div className="text-xs font-semibold text-gray-700 whitespace-nowrap">
          <span>{row.cyclesCompleted} / {row.totalCycles}</span>
          <span className="text-[10px] text-gray-400 block font-normal">{row.cyclesRemaining} remaining</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => setDetailsModal({ isOpen: true, profile: row })}
          className="p-1.5 bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-lg transition-colors border border-gray-200 text-xs font-bold flex items-center gap-1"
          title="View Details"
        >
          <FiInfo size={14} />
          <span>Details</span>
        </button>
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
            <span className="font-mono text-xs font-bold text-primary-600">{row.id}</span>
            <p className="font-bold text-xs text-gray-800 mt-0.5">{row.customer}</p>
            <p className="text-[11px] text-gray-500">{row.email}</p>
          </div>
          {renderStatusSelector(row)}
        </div>

        {/* Plan & Cycle Info */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Plan & Cycle</p>
            <p className="font-bold text-gray-800">{row.planName}</p>
            <p className="text-[11px] text-gray-500">{row.cycleLength} {row.cyclePeriod}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Initial Order</p>
            <p className="font-bold text-gray-800">{row.initialOrder}</p>
            <p className="text-[11px] text-gray-500">Started: {formatDateTime(row.startDate)}</p>
          </div>
        </div>

        {/* Next Payment & Cycle Progress */}
        <div className="flex justify-between items-center text-xs pt-1">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Next Payment Due</p>
            <p className="font-bold text-gray-900">{formatDateTime(row.nextPayment)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Cycles Progress</p>
            <p className="font-bold text-gray-900">{row.cyclesCompleted} / {row.totalCycles} <span className="text-[10px] text-gray-400 font-normal">({row.cyclesRemaining} left)</span></p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => setDetailsModal({ isOpen: true, profile: row })}
            className="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <FiInfo size={14} />
            <span>View Full Profile</span>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">
            Recurring Payments & Subscriptions
          </h1>
          <p className="text-sm text-gray-500">
            Monitor automated recurring billing profiles, renewal cycles, and subscriber payment statuses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 text-gray-600 hover:text-primary-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            title="Refresh Recurring Payments"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Customer Name Search */}
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Subscriber name..."
              value={filters.customerName}
              onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Customer Email Search */}
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Subscriber email..."
              value={filters.customerEmail}
              onChange={(e) => setFilters({ ...filters, customerEmail: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Initial Order Search */}
          <div className="relative">
            <FiShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Initial Order ID..."
              value={filters.initialOrderId}
              onChange={(e) => setFilters({ ...filters, initialOrderId: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <AnimatedSelect
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active Profiles" },
              { value: "paused", label: "Paused Profiles" },
              { value: "cancelled", label: "Cancelled Profiles" },
              { value: "expired", label: "Expired Profiles" },
            ]}
            className="text-sm py-2"
          />
        </div>
      </div>

      {/* Main DataTable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={true}
          itemsPerPage={15}
          isLoading={isLoading}
          renderMobileCard={renderMobileCard}
        />
      </div>

      {/* Profile Details Modal */}
      <AnimatePresence>
        {detailsModal.isOpen && detailsModal.profile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 p-6 space-y-5"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <FiRepeat className="text-primary-600 text-lg" />
                  <h2 className="font-bold text-gray-900 text-lg">Recurring Profile Details</h2>
                </div>
                <button
                  onClick={() => setDetailsModal({ isOpen: false, profile: null })}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Profile ID:</span>
                    <span className="font-mono font-bold text-primary-600">{detailsModal.profile.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Subscriber:</span>
                    <span className="font-bold text-gray-900">{detailsModal.profile.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Email:</span>
                    <span className="font-medium text-gray-800">{detailsModal.profile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Initial Order Reference:</span>
                    <span className="font-bold text-gray-800">{detailsModal.profile.initialOrder}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-primary-50 p-3 rounded-xl border border-primary-100">
                    <p className="text-[10px] font-bold text-primary-600 uppercase">Subscription Plan</p>
                    <p className="font-bold text-sm text-gray-900">{detailsModal.profile.planName}</p>
                    <p className="text-[11px] text-gray-600">{detailsModal.profile.cycleLength} {detailsModal.profile.cyclePeriod}</p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                    <p className="text-[10px] font-bold text-green-700 uppercase">Cycle Progress</p>
                    <p className="font-bold text-sm text-gray-900">{detailsModal.profile.cyclesCompleted} / {detailsModal.profile.totalCycles} cycles</p>
                    <p className="text-[11px] text-green-800">{detailsModal.profile.cyclesRemaining} cycles remaining</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contract Start Date:</span>
                    <span className="font-semibold text-gray-800">{formatDateTime(detailsModal.profile.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Next Automatic Renewal Due:</span>
                    <span className="font-bold text-gray-900">{formatDateTime(detailsModal.profile.nextPayment)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setDetailsModal({ isOpen: false, profile: null })}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecurringPayments;
