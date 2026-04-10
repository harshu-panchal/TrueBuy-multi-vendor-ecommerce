import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiPhone,
  FiMail,
  FiPackage,
  FiCalendar,
  FiRefreshCw,
  FiShoppingBag,
  FiDollarSign,
  FiAlertCircle,
  FiEdit,
  FiUser,
  FiInfo,
  FiCamera,
  FiImage,
  FiCheckCircle,
  FiTruck,
} from "react-icons/fi";
import { motion } from "framer-motion";
import StatusBadge from "../../../../shared/components/Badge";
import { formatPrice } from "../../../../shared/utils/helpers";
import ReturnTimeline from "../../../../shared/components/ReturnTimeline";
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import {
  updateVendorReturnRequestStatus,
} from "../../services/vendorService";
import { useReturnStore } from "../../../../shared/store/returnStore";
import toast from "react-hot-toast";

const statusTransitions = {
  pending: ["approved", "rejected"],
  approved: ["processing", "completed"],
  processing: ["completed"],
  rejected: [],
  completed: [],
};

const ReturnRequestDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { vendor } = useVendorAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const { returnRequests, fetchReturnRequestById, updateReturnStatus } = useReturnStore();
  const [returnRequest, setReturnRequest] = useState(null);
  const [status, setStatus] = useState("");
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);

  const vendorId = vendor?.id;

  useEffect(() => {
    if (!vendorId) return;

    const loadReturnRequest = async () => {
      // First check local store
      let data = returnRequests.find(r => r.id === id);
      
      // If not in store, try fetching (fallback)
      if (!data) {
        data = await fetchReturnRequestById(id);
      }

      if (!data) {
        toast.error("Return request not found");
        navigate("/vendor/return-requests");
        return;
      }

      setReturnRequest(data);
      setStatus(data.status);
    };

    loadReturnRequest();
  }, [id, navigate, vendorId, returnRequests, fetchReturnRequestById]);

  const handleStatusUpdate = async (newStatus, action = "", options = {}) => {
    const statusData = { status: newStatus };
    if (newStatus === "approved" && action === "approve") {
      statusData.refundStatus = "pending";
    } else if (newStatus === "completed" && action === "process-refund") {
      statusData.refundStatus = "processed";
    }
    if (newStatus === "rejected" && options.rejectionReason) {
      statusData.rejectionReason = options.rejectionReason;
    }
    const success = await updateReturnStatus(id, statusData);
    if (success) {
      const updatedReq = { ...returnRequest, ...statusData };
      setReturnRequest(updatedReq);
      setStatus(newStatus);
      setIsEditing(false);
    }

    const statusMessages = {
      approve: "Return request approved",
      reject: "Return request rejected",
      "process-refund": "Refund processed successfully",
    };

    toast.success(statusMessages[action] || "Status updated successfully");
  };

  const handleStatusSave = () => {
    if (status !== returnRequest.status) {
      if (status === "rejected") {
        setIsRejectionModalOpen(true);
        return;
      }
      handleStatusUpdate(status);
    } else {
      setIsEditing(false);
    }
  };

  const handleConfirmRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    handleStatusUpdate("rejected", "reject", { rejectionReason });
    setIsRejectionModalOpen(false);
    setRejectionReason("");
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      pending: "warning",
      approved: "success",
      rejected: "error",
      processing: "info",
      completed: "success",
    };
    return statusMap[status] || "warning";
  };

  if (!returnRequest || !vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const allowedNextStatuses = statusTransitions[returnRequest.status] || [];
  const editableStatusOptions = [returnRequest.status, ...allowedNextStatuses]
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .map((value) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft className="text-lg text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {returnRequest.id}
            </h1>
            <p className="text-xs text-gray-500">
              Requested on{" "}
              {new Date(returnRequest.requestDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <AnimatedSelect
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={editableStatusOptions}
                className="min-w-[140px]"
              />
              <button
                onClick={handleStatusSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
                <FiCheck className="text-sm" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setStatus(returnRequest.status);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
                <FiX className="text-sm" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <StatusBadge variant={getStatusVariant(returnRequest.status)}>
                {returnRequest.status}
              </StatusBadge>
              <button
                onClick={() => setIsEditing(true)}
                disabled={returnRequest.status !== 'pending'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                <FiEdit className="text-sm" />
                Edit Status
              </button>
              {returnRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to approve this return request?"
                        )
                      ) {
                        handleStatusUpdate("approved", "approve");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
                    <FiCheck className="text-sm" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to reject this return request?"
                        )
                      ) {
                        const reason = window.prompt(
                          "Optional rejection reason (visible in return details):",
                          returnRequest?.rejectionReason || ""
                        );
                        handleStatusUpdate("rejected", "reject", {
                          rejectionReason: reason || "",
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold">
                    <FiX className="text-sm" />
                    Reject
                  </button>
                </>
              )}
              {returnRequest.status === "approved" &&
                returnRequest.refundStatus === "pending" && (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-xs font-bold font-mono tracking-tighter shadow-sm animate-pulse">
                    <FiClock />
                    AWAITING PICKUP
                  </div>
                )}
              {(returnRequest.status === "picked_up" || returnRequest.status === "shipped") && (
                <button
                  onClick={async () => {
                    if (window.confirm("CONFIRM RECEIPT: Have you physically received the returned item and verified its condition?")) {
                      const success = await updateReturnStatus(id, { 
                        status: 'delivered_to_seller', 
                        receivedAt: new Date().toISOString() 
                      });
                      if (success) {
                        toast.success("Receipt confirmed! Admin notified for refund processing.");
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-md shadow-purple-200 text-sm font-bold active:scale-95 border-b-2 border-purple-800"
                >
                  <FiCheck />
                  Confirm Receipt
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Return Overview */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiPackage className="text-primary-600 text-base" />
              Return Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Refund Amount</p>
                <p className="font-bold text-gray-800 text-lg">
                  {formatPrice(returnRequest.refundAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Items</p>
                <p className="font-semibold text-gray-800">
                  {returnRequest.items.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Refund Status</p>
                <StatusBadge
                  variant={
                    returnRequest.refundStatus === "processed"
                      ? "success"
                      : returnRequest.refundStatus === "failed"
                      ? "error"
                      : "warning"
                  }
                  className="text-xs">
                  {returnRequest.refundStatus}
                </StatusBadge>
              </div>
            </div>
          </div>

          {/* Original Order Link */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiShoppingBag className="text-primary-600 text-base" />
              Original Order
            </h2>
            <Link
              to={`/vendor/orders/${returnRequest.orderId}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm">
              <span>View Order: {returnRequest.orderId}</span>
              <FiArrowLeft className="rotate-180 text-xs" />
            </Link>
          </div>

          {/* Return Items */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiPackage className="text-primary-600 text-base" />
              Items Being Returned ({returnRequest.items.length})
            </h2>
            <div className="space-y-2">
              {returnRequest.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name || "Product"}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/100x100?text=Product";
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {item.name || "Unknown Product"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-600">
                        {formatPrice(item.price || 0)} × {item.quantity || 1}
                      </p>
                      {item.reason && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          {item.reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-sm text-gray-800">
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Return Reason */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiAlertCircle className="text-primary-600 text-base" />
              Return Reason
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="font-semibold text-sm text-gray-800">
                  {returnRequest.reason}
                </p>
              </div>
              {returnRequest.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {returnRequest.description}
                  </p>
                </div>
              )}
              {returnRequest.rejectionReason && (
                <div>
                  <p className="text-xs text-red-500 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                    {returnRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Return Images */}
          {returnRequest.images && returnRequest.images.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <FiCamera className="text-primary-600 text-base" />
                Return Images from Customer ({returnRequest.images.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {returnRequest.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => window.open(img, '_blank')}
                  >
                    <img 
                      src={img} 
                      alt={`Return Proof ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiImage className="text-white text-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pickup Proof (from Rider) */}
          {returnRequest.pickupImages && returnRequest.pickupImages.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 border-l-4 border-l-green-500">
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <FiCheckCircle className="text-green-600 text-base" />
                Pickup Proof from Rider ({returnRequest.pickupImages.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {returnRequest.pickupImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => window.open(img, '_blank')}
                  >
                    <img 
                      src={img} 
                      alt={`Pickup Proof ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiImage className="text-white text-xl" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-3 italic">These photos were taken by the delivery boy during pickup.</p>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiMail className="text-primary-600 text-base" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="font-semibold text-sm text-gray-800">
                  {returnRequest.customer.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <a
                  href={`mailto:${returnRequest.customer.email}`}
                  className="font-semibold text-xs text-blue-600 hover:text-blue-800 break-all">
                  {returnRequest.customer.email}
                </a>
              </div>
              {returnRequest.customer.phone && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <FiPhone className="text-xs" />
                    Phone
                  </p>
                  <a
                    href={`tel:${returnRequest.customer.phone}`}
                    className="font-semibold text-sm text-gray-800 hover:text-blue-600">
                    {returnRequest.customer.phone}
                  </a>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <FiPackage className="text-xs" />
                  Pickup Address
                </p>
                <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {returnRequest.pickupAddress || returnRequest.customer.address || "No address provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Logistics Information */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiTruck className="text-primary-600 text-base" />
              Logistics Information
            </h2>
            {returnRequest.deliveryBoyId ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <FiUser size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-none mb-1">Assigned Partner</p>
                    <p className="text-sm font-bold text-gray-800">
                      {typeof returnRequest.deliveryBoyId === 'object' 
                        ? returnRequest.deliveryBoyId.name 
                        : returnRequest.deliveryBoyId === 'DB-001' ? 'Rahul Singh' : "Rider ID: " + returnRequest.deliveryBoyId}
                    </p>
                    {typeof returnRequest.deliveryBoyId === 'object' && returnRequest.deliveryBoyId.phone && (
                      <a href={`tel:${returnRequest.deliveryBoyId.phone}`} className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 mt-0.5">
                        <FiPhone size={10} />
                        {returnRequest.deliveryBoyId.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Pickup Status</p>
                    <p className="text-xs font-bold text-gray-700 capitalize">{returnRequest.status === 'processing' ? 'In Progress' : returnRequest.status}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Handover OTP</p>
                    <p className="text-xs font-bold text-primary-600 font-mono tracking-widest">••••</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <FiInfo className="mx-auto text-2xl text-gray-300 mb-2" />
                <p className="text-[11px] text-gray-500 font-medium">Logistics partner will be assigned by Admin after approval.</p>
              </div>
            )}
          </div>

          {/* Refund Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiDollarSign className="text-primary-600 text-base" />
              Refund Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items Total</span>
                <span className="font-semibold">
                  {formatPrice(
                    returnRequest.items.reduce(
                      (sum, item) =>
                        sum + (item.price || 0) * (item.quantity || 1),
                      0
                    )
                  )}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-bold text-gray-800">Refund Amount</span>
                <span className="font-bold text-lg text-gray-800">
                  {formatPrice(returnRequest.refundAmount)}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Refund Status</p>
                <StatusBadge
                  variant={
                    returnRequest.refundStatus === "processed"
                      ? "success"
                      : returnRequest.refundStatus === "failed"
                      ? "error"
                      : "warning"
                  }>
                  {returnRequest.refundStatus}
                </StatusBadge>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiCalendar className="text-primary-600 text-base" />
              Return Journey
            </h2>
            <div className="py-2">
              <ReturnTimeline currentStatus={returnRequest.status} role="seller" />
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-100 italic">
              <div className="flex gap-2">
                <FiInfo className="text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-[10px] text-blue-800">
                  <span className="font-bold">Seller Note:</span> The "Delivered to Seller" status is only visible to you and the Admin. Customers will see "Return Completed" once you verify the item.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3">
              Quick Actions
            </h2>
            <div className="space-y-1.5">
              <Link
                to={`/vendor/orders/${returnRequest.orderId}`}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-semibold">
                <FiShoppingBag className="text-sm" />
                View Original Order
              </Link>
              <button
                onClick={() =>
                  (window.location.href = `mailto:${returnRequest.customer.email}`)
                }
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-semibold">
                <FiMail className="text-sm" />
                Email Customer
              </button>
              {returnRequest.customer.phone && (
                <button
                  onClick={() =>
                    (window.location.href = `tel:${returnRequest.customer.phone}`)
                  }
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-semibold">
                  <FiPhone className="text-sm" />
                  Call Customer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isRejectionModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsRejectionModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                  <FiAlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Reject Request</h3>
                  <p className="text-xs text-gray-500">Provide a reason for the customer</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Product was used, or original packaging is missing..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px] transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-2">
                    This message will be visible exactly as written to the customer.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsRejectionModalOpen(false);
                      setStatus(returnRequest.status);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRejection}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none">
                    Confirm Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReturnRequestDetail;
