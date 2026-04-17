import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEye, FiCheck, FiX, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import DataTable from "../../Admin/components/DataTable";
import ExportButton from "../../Admin/components/ExportButton";
import StatusBadge from "../../../shared/components/Badge";
import AnimatedSelect from "../../Admin/components/AnimatedSelect";
import { formatPrice } from "../../../shared/utils/helpers";
import { useVendorAuthStore } from "../store/vendorAuthStore";
import {
  approveVendorExchangeRequest,
  rejectVendorExchangeRequest,
} from "../services/vendorService";
import { useReturnStore } from "../../../shared/store/returnStore";
import toast from "react-hot-toast";

const ReturnRequests = () => {
  const navigate = useNavigate();
  const { vendor } = useVendorAuthStore();
  const { returnRequests, isLoading, fetchReturnRequests, updateReturnStatus } = useReturnStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const vendorId = vendor?.id;

  useEffect(() => {
    if (!vendorId) return;
    fetchReturnRequests({ role: "vendor", page: 1, limit: 100 }).catch(() => null);
  }, [vendorId, fetchReturnRequests]);

  // Filtered return requests
  const filteredRequests = useMemo(() => {
    let filtered = returnRequests;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (request) =>
          String(request.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(request.orderId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(request.customer?.name || request.userId?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          String(request.customer?.email || request.userId?.email || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (request) => request.status === selectedStatus
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (request) => new Date(request.requestDate) >= filterDate
          );
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(
            (request) => new Date(request.requestDate) >= filterDate
          );
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(
            (request) => new Date(request.requestDate) >= filterDate
          );
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [returnRequests, searchQuery, selectedStatus, dateFilter]);

  // Handle status update for both returns and exchanges
  const handleStatusUpdate = async (requestId, newStatus, action = "", options = {}) => {
    try {
      const request = returnRequests.find(r => r.id === requestId);
      if (!request) {
        toast.error('Request not found');
        return;
      }

      if (request.type === 'exchange') {
        // Handle exchange request
        if (action === 'approve') {
          await approveVendorExchangeRequest(requestId, { note: options.note || '' });
          toast.success('Exchange request approved');
        } else if (action === 'reject') {
          await rejectVendorExchangeRequest(requestId, { 
            note: options.note || '',
            rejectionReason: options.rejectionReason || 'Rejected by vendor'
          });
          toast.success('Exchange request rejected');
        }
      } else {
        // Handle return request
        await updateReturnStatus(requestId, {
          status: action === 'approve' ? 'approved' : 'rejected',
          note: options.note || '',
          rejectionReason: options.rejectionReason || ''
        });
        toast.success(action === 'approve' ? 'Return request approved' : 'Return request rejected');
      }

      // Refresh the list
      await fetchReturnRequests({ role: "vendor", page: 1, limit: 100 });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    const normalized = String(status || '').toLowerCase();
    const statusMap = {
      pending: "warning",
      requested: "warning",
      approved: "success",
      approved_by_vendor: "success",
      rejected: "error",
      rejected_by_vendor: "error",
      processing: "info",
      completed: "success",
      pickup: "info",
      replacement: "info",
    };
    return statusMap[normalized] || "warning";
  };

  // Normalize status for display
  const normalizeStatus = (status) => {
    const normalized = String(status || '').toLowerCase();
    const statusMap = {
      requested: "pending",
      approved_by_vendor: "approved",
      rejected_by_vendor: "rejected",
      pickup: "picked_up",
      replacement: "shipped",
    };
    return statusMap[normalized] || normalized;
  };

  // Table columns
  const columns = [
    {
      key: "id",
      label: "Request ID",
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-semibold">{value}</span>
          {row.type === 'exchange' && (
            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              EXCHANGE
            </span>
          )}
        </div>
      ),
    },
    {
      key: "orderId",
      label: "Order ID",
      sortable: true,
      render: (value) => (
        <span
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
          onClick={() => navigate(`/vendor/orders/${value}`)}>
          {value}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (value, row) => {
        const customerName = value?.name || row.userId?.name || 'N/A';
        const customerEmail = value?.email || row.userId?.email || '';
        return (
          <div>
            <p className="font-medium text-gray-800">{customerName}</p>
            {customerEmail && <p className="text-xs text-gray-500">{customerEmail}</p>}
          </div>
        );
      },
    },
    {
      key: "requestDate",
      label: "Request Date",
      sortable: true,
      render: (value, row) => {
        const date = value || row.createdAt;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
    {
      key: "items",
      label: "Items",
      sortable: false,
      render: (value, row) => {
        if (row.type === 'exchange') {
          return <span>1 item (Exchange)</span>;
        }
        const count = Array.isArray(value) ? value.length : 1;
        return (
          <span>
            {count} item{count !== 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      key: "reason",
      label: "Reason",
      sortable: true,
      render: (value) => <span className="text-sm text-gray-700">{value || 'N/A'}</span>,
    },
    {
      key: "refundAmount",
      label: "Amount",
      sortable: true,
      render: (value, row) => {
        if (row.type === 'exchange') {
          const price = row.newProduct?.price || row.oldProduct?.price || 0;
          return <span className="font-bold text-gray-800">{formatPrice(price)}</span>;
        }
        return <span className="font-bold text-gray-800">{formatPrice(value || 0)}</span>;
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => {
        const displayStatus = normalizeStatus(value);
        return (
          <StatusBadge variant={getStatusVariant(value)}>
            {displayStatus.replace(/_/g, ' ')}
          </StatusBadge>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, row) => {
        const status = String(row.status || '').toLowerCase();
        const isPending = status === 'pending' || status === 'requested';
        
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/vendor/return-requests/${row.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details">
              <FiEye />
            </button>
            {isPending && (
              <>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to approve this ${row.type === 'exchange' ? 'exchange' : 'return'} request?`
                      )
                    ) {
                      handleStatusUpdate(row.id, "approved", "approve");
                    }
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Approve">
                  <FiCheck />
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to reject this ${row.type === 'exchange' ? 'exchange' : 'return'} request?`
                      )
                    ) {
                      const reason = window.prompt(
                        "Optional rejection reason:",
                        ""
                      );
                      handleStatusUpdate(row.id, "rejected", "reject", {
                        rejectionReason: reason || "Rejected by vendor",
                      });
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Reject">
                  <FiX />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Get status counts for stats
  const statusCounts = useMemo(() => {
    const pending = returnRequests.filter((r) => {
      const status = String(r.status || '').toLowerCase();
      return status === 'pending' || status === 'requested';
    }).length;
    
    const approved = returnRequests.filter((r) => {
      const status = String(r.status || '').toLowerCase();
      return status === 'approved' || status === 'approved_by_vendor';
    }).length;
    
    const processing = returnRequests.filter((r) => {
      const status = String(r.status || '').toLowerCase();
      return status === 'processing' || status === 'pickup' || status === 'inspection_pending';
    }).length;
    
    const completed = returnRequests.filter((r) => {
      const status = String(r.status || '').toLowerCase();
      return status === 'completed';
    }).length;
    
    const rejected = returnRequests.filter((r) => {
      const status = String(r.status || '').toLowerCase();
      return status === 'rejected' || status === 'rejected_by_vendor';
    }).length;

    return {
      all: returnRequests.length,
      pending,
      approved,
      processing,
      completed,
      rejected,
    };
  }, [returnRequests]);

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view return requests</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="lg:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Return Requests
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and process customer return requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-800">
            {statusCounts.all}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-lg sm:text-2xl font-bold text-yellow-600">
            {statusCounts.pending}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            {statusCounts.approved}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Processing</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600">
            {statusCounts.processing}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            {statusCounts.completed}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Rejected</p>
          <p className="text-lg sm:text-2xl font-bold text-red-600">
            {statusCounts.rejected}
          </p>
        </div>
      </div>
      
      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
          <FiAlertCircle size={24} />
        </div>
        <div className="flex-1">
          <p className="text-amber-800 font-bold text-sm uppercase tracking-tight">Attention Required</p>
          <p className="text-amber-700 text-sm font-medium">Please respond to all pending return requests within 24 hours to maintain service level agreements.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, order ID, name, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
            />
          </div>

          <AnimatedSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "processing", label: "Processing" },
              { value: "completed", label: "Completed" },
              { value: "rejected", label: "Rejected" },
            ]}
            className="w-full sm:w-auto min-w-[140px]"
          />

          <AnimatedSelect
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            options={[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "Last 7 Days" },
              { value: "month", label: "Last 30 Days" },
            ]}
            className="w-full sm:w-auto min-w-[140px]"
          />

          <div className="w-full sm:w-auto">
            <ExportButton
              data={filteredRequests}
              headers={[
                { label: "Return ID", accessor: (row) => row.id },
                { label: "Order ID", accessor: (row) => row.orderId },
                { label: "Customer", accessor: (row) => row.customer.name },
                { label: "Email", accessor: (row) => row.customer.email },
                {
                  label: "Request Date",
                  accessor: (row) =>
                    new Date(row.requestDate).toLocaleDateString(),
                },
                { label: "Items", accessor: (row) => row.items.length },
                { label: "Reason", accessor: (row) => row.reason },
                {
                  label: "Refund Amount",
                  accessor: (row) => formatPrice(row.refundAmount),
                },
                { label: "Status", accessor: (row) => row.status },
              ]}
              filename="vendor-return-requests"
            />
          </div>
        </div>
      </div>

      {/* Return Requests Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">Loading return requests...</p>
        </div>
      ) : filteredRequests.length > 0 ? (
        <DataTable
          data={filteredRequests}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
          onRowClick={(row) => navigate(`/vendor/return-requests/${row.id}`)}
        />
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No return requests found</p>
        </div>
      )}
    </motion.div>
  );
};

export default ReturnRequests;
