import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiPrinter, 
  FiCalendar, 
  FiTruck, 
  FiPackage, 
  FiUserCheck,
  FiRefreshCw,
  FiFileText,
  FiDownload,
  FiMapPin,
  FiPhone,
  FiMail,
  FiExternalLink
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import Badge from '../../../../shared/components/Badge';
import AnimatedSelect from '../../components/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../../utils/adminHelpers';
import { getAllSubOrders, updateSubOrderStatus, assignDeliveryBoy, getAllDeliveryBoys } from '../../services/adminService';
import toast from 'react-hot-toast';

// Allowed forward transitions for shipment fulfillment state machine
const ALLOWED_STATUS_TRANSITIONS = {
  pending: [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "assigned_for_delivery", label: "Assigned" },
    { value: "shipped", label: "Shipped" },
    { value: "cancelled", label: "Cancelled" },
  ],
  processing: [
    { value: "processing", label: "Processing" },
    { value: "assigned_for_delivery", label: "Assigned" },
    { value: "shipped", label: "Shipped" },
    { value: "cancelled", label: "Cancelled" },
  ],
  assigned_for_delivery: [
    { value: "assigned_for_delivery", label: "Assigned" },
    { value: "shipped", label: "Shipped" },
    { value: "out_for_delivery", label: "Out For Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ],
  ready: [
    { value: "ready", label: "Ready" },
    { value: "assigned_for_delivery", label: "Assigned" },
    { value: "shipped", label: "Shipped" },
    { value: "cancelled", label: "Cancelled" },
  ],
  shipped: [
    { value: "shipped", label: "Shipped" },
    { value: "out_for_delivery", label: "Out For Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ],
  out_for_delivery: [
    { value: "out_for_delivery", label: "Out For Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ],
  delivered: [{ value: "delivered", label: "Delivered (Completed)" }],
  cancelled: [{ value: "cancelled", label: "Cancelled" }],
  returned: [{ value: "returned", label: "Returned" }],
};

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Modal State
  const [manifestModal, setManifestModal] = useState({
    isOpen: false,
    shipment: null,
  });

  // Fetch Data from Backend API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subOrdersRes, boysRes] = await Promise.all([
        getAllSubOrders({
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          search: searchQuery,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          limit: 200,
        }),
        getAllDeliveryBoys({ page: 1, limit: 100, status: "active", applicationStatus: "approved", availableOnly: true }),
      ]);

      const fetchedSubOrders = subOrdersRes.data?.subOrders || [];
      const fetchedBoys = boysRes.data?.deliveryBoys || [];

      setShipments(fetchedSubOrders);
      setDeliveryBoys(fetchedBoys);
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Status Change Handler
  const handleStatusChange = async (subOrderId, newStatus) => {
    try {
      await updateSubOrderStatus(subOrderId, newStatus);
      toast.success(`Shipment ${subOrderId} updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  // Delivery Partner Assignment Handler
  const handleAssignDelivery = async (subOrderId, deliveryBoyId) => {
    try {
      await assignDeliveryBoy(subOrderId, deliveryBoyId);
      toast.success(`Delivery Partner assigned to shipment ${subOrderId}`);
      fetchData();
    } catch (error) {
      console.error("Assign error:", error);
      toast.error('Failed to assign delivery partner');
    }
  };

  // Filtered Shipments
  const filteredData = useMemo(() => {
    return shipments.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchSubOrder = (item.subOrderId || '').toLowerCase().includes(q);
        const matchParentOrder = (item.parentOrderId?.orderId || '').toLowerCase().includes(q);
        const matchVendor = (item.vendorName || '').toLowerCase().includes(q);
        const matchCustomer = (item.dropoffAddress?.name || '').toLowerCase().includes(q);
        const matchDeliveryBoy = (item.deliveryBoyId?.name || '').toLowerCase().includes(q);

        if (!matchSubOrder && !matchParentOrder && !matchVendor && !matchCustomer && !matchDeliveryBoy) {
          return false;
        }
      }
      return true;
    });
  }, [shipments, searchQuery]);

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredData.map(s => s._id || s.subOrderId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const exportData = filteredData.map(s => ({
      'Shipment ID': s.subOrderId,
      'Parent Order ID': s.parentOrderId?.orderId || 'N/A',
      'Vendor Store': s.vendorName || 'N/A',
      'Customer Name': s.dropoffAddress?.name || 'N/A',
      'Delivery Partner': s.deliveryBoyId?.name || 'Unassigned',
      'Status': s.status,
      'Total Amount': s.total || 0,
      'Created Date': formatDateTime(s.createdAt),
    }));

    if (exportData.length === 0) {
      toast.error('No shipment data to export');
      return;
    }

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Shipments_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to render forward status options
  const renderStatusDropdown = (row) => {
    const currentStatus = String(row.status || "pending").toLowerCase();
    const statusMap = {
      pending: { label: "Pending", variant: "warning" },
      processing: { label: "Processing", variant: "info" },
      assigned_for_delivery: { label: "Assigned", variant: "info" },
      shipped: { label: "Shipped", variant: "primary" },
      out_for_delivery: { label: "Out For Delivery", variant: "primary" },
      delivered: { label: "Delivered", variant: "success" },
      cancelled: { label: "Cancelled", variant: "danger" },
      returned: { label: "Returned", variant: "danger" },
    };
    const config = statusMap[currentStatus] || { label: currentStatus, variant: "default" };
    const availableOptions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [{ value: currentStatus, label: config.label }];
    const isTerminal = ["delivered", "cancelled", "returned"].includes(currentStatus);

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant={config.variant} size="sm">
          {config.label}
        </Badge>
        {!isTerminal ? (
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(row.subOrderId || row._id, e.target.value)}
            className="text-[11px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-sm"
          >
            {availableOptions.map((opt) => (
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

  // Table Columns Setup for Desktop View
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
          checked={selectedIds.has(row._id || row.subOrderId)} 
          onChange={() => handleSelectRow(row._id || row.subOrderId)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      )
    },
    { 
      key: 'subOrderId', 
      label: 'Shipment ID', 
      sortable: true,
      render: (v) => <span className="font-mono text-xs font-bold text-primary-600 whitespace-nowrap">{v}</span> 
    },
    { 
      key: 'parentOrderId', 
      label: 'Master Order', 
      sortable: true,
      render: (v) => (
        <span className="font-semibold text-xs text-gray-800 whitespace-nowrap">
          {v?.orderId || 'N/A'}
        </span>
      )
    },
    { 
      key: 'vendorName', 
      label: 'Origin Store', 
      sortable: true,
      render: (v, row) => (
        <div className="max-w-[140px]">
          <p className="font-bold text-xs text-gray-800 truncate">{v || row.vendorId?.storeName || 'Vendor'}</p>
          <p className="text-[11px] text-gray-500 truncate">{row.pickupAddress?.city || 'Origin'}</p>
        </div>
      )
    },
    { 
      key: 'dropoffAddress', 
      label: 'Destination Customer', 
      sortable: true,
      render: (v) => (
        <div className="max-w-[160px]">
          <p className="font-bold text-xs text-gray-800 truncate">{v?.name || 'Customer'}</p>
          <p className="text-[11px] text-gray-500 truncate">{v?.city ? `${v.city}, ${v.state || ''}` : 'Destination'}</p>
        </div>
      )
    },
    { 
      key: 'deliveryBoyId', 
      label: 'Delivery Partner', 
      sortable: true,
      render: (v, row) => (
        <div className="min-w-[170px]">
          <AnimatedSelect
            name="deliveryBoyId"
            value={String(v?._id || v || "")}
            onChange={(e) => handleAssignDelivery(row.subOrderId || row._id, e.target.value)}
            disabled={["delivered", "cancelled", "returned"].includes(String(row.status || "").toLowerCase())}
            options={[
              { value: "", label: "Unassigned Partner" },
              ...deliveryBoys.map((boy) => ({
                value: String(boy.id || boy._id),
                label: `${boy.name} (${boy.phone || "N/A"})`,
              })),
            ]}
            className="text-xs py-1 px-2 pr-6 h-8 border-gray-200"
          />
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Fulfillment Status', 
      sortable: true,
      render: (_, row) => renderStatusDropdown(row)
    },
    { 
      key: 'otpStatus', 
      label: 'OTP Verified', 
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1 text-[10px]">
          <span className={`px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${row.vendorPickupOtpVerifiedAt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`} title="Vendor Pickup OTP">
            Pickup {row.vendorPickupOtpVerifiedAt ? '✓' : '⌛'}
          </span>
          <span className={`px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${row.deliveryOtpVerifiedAt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`} title="Customer Delivery OTP">
            Delivery {row.deliveryOtpVerifiedAt ? '✓' : '⌛'}
          </span>
        </div>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Dispatch Date', 
      sortable: true,
      render: (v) => <span className="text-xs text-gray-600 whitespace-nowrap">{formatDateTime(v)}</span> 
    },
    {
      key: 'action',
      label: 'Dispatch Manifest',
      sortable: false,
      render: (_, row) => (
        <button 
          onClick={() => setManifestModal({ isOpen: true, shipment: row })}
          className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-lg transition-all flex items-center gap-1 text-xs font-bold whitespace-nowrap"
          title="Print Dispatch Manifest"
        >
          <FiPrinter className="text-xs" />
          <span>Slip</span>
        </button>
      )
    }
  ];

  // Mobile Responsive Card Renderer
  const renderMobileCard = (row) => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        {/* Card Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
          <div>
            <span className="font-mono text-xs font-bold text-primary-600">{row.subOrderId}</span>
            <p className="text-[11px] text-gray-500 font-medium">Order: <span className="font-semibold text-gray-800">{row.parentOrderId?.orderId || 'N/A'}</span></p>
          </div>
          {renderStatusDropdown(row)}
        </div>

        {/* Origin & Destination Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Origin Store</p>
            <p className="font-bold text-gray-800 truncate">{row.vendorName || row.vendorId?.storeName || 'Vendor'}</p>
            <p className="text-[11px] text-gray-500">{row.pickupAddress?.city || 'Origin'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Customer Dropoff</p>
            <p className="font-bold text-gray-800 truncate">{row.dropoffAddress?.name || 'Customer'}</p>
            <p className="text-[11px] text-gray-500 truncate">{row.dropoffAddress?.city || 'Destination'}</p>
          </div>
        </div>

        {/* Delivery Partner & OTP */}
        <div className="space-y-2 pt-1">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Assigned Delivery Partner</p>
            <AnimatedSelect
              name="deliveryBoyId"
              value={String(row.deliveryBoyId?._id || row.deliveryBoyId || "")}
              onChange={(e) => handleAssignDelivery(row.subOrderId || row._id, e.target.value)}
              disabled={["delivered", "cancelled", "returned"].includes(String(row.status || "").toLowerCase())}
              options={[
                { value: "", label: "Unassigned Partner" },
                ...deliveryBoys.map((boy) => ({
                  value: String(boy.id || boy._id),
                  label: `${boy.name} (${boy.phone || "N/A"})`,
                })),
              ]}
              className="text-xs py-1 px-2 border-gray-200 w-full"
            />
          </div>

          <div className="flex justify-between items-center text-xs pt-1">
            <div className="flex items-center gap-1 text-[10px]">
              <span className={`px-1.5 py-0.5 rounded font-bold ${row.vendorPickupOtpVerifiedAt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                Pickup {row.vendorPickupOtpVerifiedAt ? '✓' : '⌛'}
              </span>
              <span className={`px-1.5 py-0.5 rounded font-bold ${row.deliveryOtpVerifiedAt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                Delivery {row.deliveryOtpVerifiedAt ? '✓' : '⌛'}
              </span>
            </div>
            <button 
              onClick={() => setManifestModal({ isOpen: true, shipment: row })}
              className="px-2.5 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <FiPrinter className="text-xs" />
              <span>Slip</span>
            </button>
          </div>
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
            Shipments & Logistics
          </h1>
          <p className="text-sm text-gray-500">
            Manage package dispatches, internal delivery partner assignments, and shipment tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 text-gray-600 hover:text-primary-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            title="Refresh Shipments"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiDownload />
            <span>Export Manifest</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search shipment, order, vendor..."
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
              { value: "all", label: "All Logistics Status" },
              { value: "pending", label: "Pending Processing" },
              { value: "processing", label: "Processing at Vendor" },
              { value: "assigned_for_delivery", label: "Assigned to Delivery Partner" },
              { value: "shipped", label: "Shipped / In Transit" },
              { value: "delivered", label: "Delivered Packages" },
              { value: "cancelled", label: "Cancelled Shipments" },
            ]}
            className="text-sm py-2"
          />

          {/* Start Date */}
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* End Date */}
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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

      {/* Print Shipping Dispatch Manifest Slip Modal */}
      <AnimatePresence>
        {manifestModal.isOpen && manifestModal.shipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-200"
            >
              {/* Modal Top Bar */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-primary-600 text-lg" />
                  <h2 className="font-bold text-gray-900">Shipment Dispatch Manifest</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                  >
                    <FiPrinter />
                    <span>Print Manifest</span>
                  </button>
                  <button
                    onClick={() => setManifestModal({ isOpen: false, shipment: null })}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* Printable Slip Content */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto" id="printable-manifest-slip">
                {/* Brand & Barcode Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                  <div>
                    <h1 className="text-xl font-extrabold text-primary-600 tracking-tight">TRUEBUY LOGISTICS</h1>
                    <p className="text-xs text-gray-500">Official Package Dispatch Manifest & Waybill</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Shipment ID</p>
                    <p className="font-mono text-base font-bold text-gray-900">{manifestModal.shipment.subOrderId}</p>
                    <p className="text-xs text-gray-400">Order: {manifestModal.shipment.parentOrderId?.orderId || 'N/A'}</p>
                  </div>
                </div>

                {/* Pickup & Dropoff Addresses Grid */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                  {/* Origin Vendor Pickup */}
                  <div>
                    <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                      <FiMapPin className="text-primary-600" />
                      Pickup Origin (Vendor Store)
                    </p>
                    <p className="font-extrabold text-gray-900 text-sm">{manifestModal.shipment.vendorName || manifestModal.shipment.vendorId?.storeName || 'Vendor'}</p>
                    <p className="text-gray-600 mt-1">{manifestModal.shipment.pickupAddress?.street || manifestModal.shipment.vendorId?.address || 'Vendor Address N/A'}</p>
                    <p className="text-gray-600">{manifestModal.shipment.pickupAddress?.city || ''} {manifestModal.shipment.pickupAddress?.zipCode || ''}</p>
                    <p className="text-gray-600 font-semibold mt-1">Phone: {manifestModal.shipment.vendorId?.phone || 'N/A'}</p>
                  </div>

                  {/* Customer Destination Dropoff */}
                  <div>
                    <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                      <FiUserCheck className="text-primary-600" />
                      Destination Dropoff (Customer)
                    </p>
                    <p className="font-extrabold text-gray-900 text-sm">{manifestModal.shipment.dropoffAddress?.name || 'Customer'}</p>
                    <p className="text-gray-600 mt-1">{manifestModal.shipment.dropoffAddress?.address || 'Address N/A'}</p>
                    <p className="text-gray-600">{manifestModal.shipment.dropoffAddress?.city}, {manifestModal.shipment.dropoffAddress?.state} {manifestModal.shipment.dropoffAddress?.zipCode}</p>
                    <p className="text-gray-600 font-semibold mt-1">Phone: {manifestModal.shipment.dropoffAddress?.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Delivery Partner Info */}
                <div className="bg-primary-50 p-3 rounded-xl border border-primary-100 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-primary-600 uppercase">Assigned In-House Delivery Partner</p>
                    <p className="font-bold text-sm text-gray-900">{manifestModal.shipment.deliveryBoyId?.name || 'Unassigned'}</p>
                    <p className="text-gray-600">Phone: {manifestModal.shipment.deliveryBoyId?.phone || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-primary-600 uppercase">Vehicle Info</p>
                    <p className="font-mono font-bold text-gray-800">{manifestModal.shipment.deliveryBoyId?.vehicleNumber || 'N/A'}</p>
                    <p className="text-gray-500 uppercase text-[10px]">{manifestModal.shipment.deliveryBoyId?.vehicleType || 'Standard'}</p>
                  </div>
                </div>

                {/* Items Package List */}
                <div>
                  <h3 className="font-bold text-xs text-gray-700 uppercase mb-2">Package Items</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="p-2 font-bold text-gray-700">Product Name</th>
                          <th className="p-2 text-center font-bold text-gray-700">Qty</th>
                          <th className="p-2 text-right font-bold text-gray-700">Unit Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(manifestModal.shipment.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium text-gray-800">{item.name || 'Product'}</td>
                            <td className="p-2 text-center font-bold text-gray-700">{item.quantity || 1}</td>
                            <td className="p-2 text-right font-semibold text-gray-800">{formatCurrency(item.price || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures Footer */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200 text-xs">
                  <div className="border-t border-dashed border-gray-300 pt-2 text-center">
                    <p className="font-bold text-gray-700">Vendor Pickup Signature</p>
                    <p className="text-[10px] text-gray-400">Package Handed Over</p>
                  </div>
                  <div className="border-t border-dashed border-gray-300 pt-2 text-center">
                    <p className="font-bold text-gray-700">Customer Delivery Signature</p>
                    <p className="text-[10px] text-gray-400">Package Received</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Shipments;
