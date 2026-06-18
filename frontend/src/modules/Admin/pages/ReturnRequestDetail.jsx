import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../../../shared/components/Badge';
import AnimatedSelect from '../components/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../utils/adminHelpers';
import { useReturnStore } from '../../../shared/store/returnStore';
import { getAllDeliveryBoys } from '../services/adminService';
import { 
  FiArrowLeft, FiCheck, FiX, FiPhone, FiMail, FiPackage, 
  FiCalendar, FiRefreshCw, FiShoppingBag, FiDollarSign, 
  FiAlertCircle, FiEdit, FiClock, FiTruck, FiUser, FiCamera, FiImage, FiCheckCircle, FiSearch
} from 'react-icons/fi';

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

const ReturnRequestDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    fetchReturnRequestById, 
    updateReturnStatus, 
    assignDeliveryToReturn, 
    processReturnRefund,
    inspectExchangeItem,
    shipReplacement,
    resolveInspectionFailure
  } = useReturnStore();
  const [returnRequest, setReturnRequest] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState('');
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const statusTransitions = {
    pending: ['approved', 'rejected'],
    approved: ['processing', 'completed', 'inspection_pending'],
    processing: ['completed', 'picked_up'],
    picked_up: ['delivered_to_seller', 'inspection_pending'],
    delivered_to_seller: ['inspection_pending', 'completed'],
    inspection_pending: ['approved', 'inspection_rejected'],
    inspection_rejected: [],
    replacement_shipped: ['completed'],
    rejected: [],
    completed: [],
  };

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      setIsLoadingDetail(true);
      setDetailError('');

      try {
        const data = await fetchReturnRequestById(id, 'admin');
        console.log('[Admin ReturnRequestDetail] fetched return request', data);

        if (!data) {
          console.warn('[Admin ReturnRequestDetail] return request not found or empty', { id, data });
          if (isMounted) {
            setReturnRequest(null);
            setDetailError('Return request not found.');
          }
          return;
        }

        console.log('[Admin ReturnRequestDetail] populated references', {
          customer: data?.customer,
          userId: data?.userId,
          vendor: data?.vendor,
          vendorId: data?.vendorId,
          productId: data?.productId,
          deliveryBoyId: data?.deliveryBoyId,
          assignedDeliveryBoy: data?.assignedDeliveryBoy,
          items: data?.items,
        });

        if (!data?.customer || !data?.customer?.name || !data?.customer?.email) {
          console.warn('[Admin ReturnRequestDetail] missing customer fields', {
            customer: data?.customer,
            userId: data?.userId,
          });
        }

        if (isMounted) {
          setReturnRequest(data);
          setStatus(data?.status || '');
        }
      } catch (error) {
        console.error('[Admin ReturnRequestDetail] failed to fetch return request', error);
        if (isMounted) {
          setDetailError('Unable to load return request details.');
          setReturnRequest(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingDetail(false);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [id, fetchReturnRequestById]);

  useEffect(() => {
    let isMounted = true;

    const loadDeliveryBoys = async () => {
      try {
        const rows = await fetchAssignableDeliveryBoys();
        if (isMounted) {
          setDeliveryBoys(rows);
        }
      } catch (error) {
        console.error('[Admin ReturnRequestDetail] failed to fetch delivery boys', error);
        if (isMounted) {
          setDeliveryBoys([]);
        }
      }
    };

    loadDeliveryBoys();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusUpdate = async (newStatus, action = '') => {
    const statusData = { status: newStatus };

    if (newStatus === 'approved' && action === 'approve') {
      statusData.refundStatus = 'pending';
    } else if (newStatus === 'completed' && action === 'process-refund') {
      statusData.refundStatus = 'processed';
    } else if (newStatus === 'completed' && !action) {
      statusData.refundStatus = 'processed';
    } else if (newStatus === 'approved' && !action) {
      if (returnRequest?.refundStatus !== 'processed') {
        statusData.refundStatus = 'pending';
      }
    }

    const success = await updateReturnStatus(id, statusData);
    if (success) {
      // Refresh local data
      const data = await fetchReturnRequestById(id);
      if (data) {
        setReturnRequest(data);
        setStatus(data.status);
      }
      setIsEditing(false);
    }
  };

  const handleStatusSave = () => {
    if (status !== returnRequest?.status) {
      handleStatusUpdate(status);
    } else {
      setIsEditing(false);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!selectedDeliveryBoyId) return;
    const success = await assignDeliveryToReturn(id, selectedDeliveryBoyId);
    if (success) {
      setIsAssignModalOpen(false);
      const data = await fetchReturnRequestById(id);
      if (data) setReturnRequest(data);
    }
  };

  const handleProcessRefund = async () => {
    const success = await processReturnRefund(id);
    if (success) {
      const data = await fetchReturnRequestById(id);
      if (data) setReturnRequest(data);
    }
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      pending: 'pending',
      approved: 'approved',
      inspection_pending: 'warning',
      inspection_rejected: 'error',
      replacement_shipped: 'processing',
      rejected: 'rejected',
      processing: 'processing',
      completed: 'completed',
      picked_up: 'processing',
      delivered_to_seller: 'success',
    };
    return statusMap[status] || 'pending';
  };

  if (isLoadingDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
        <FiAlertCircle className="mx-auto text-3xl text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-gray-800 mb-1">Return request unavailable</h2>
        <p className="text-sm text-gray-500 mb-4">
          {detailError || 'This return request may have been deleted or is no longer available.'}
        </p>
        <button
          onClick={() => navigate('/admin/return-requests')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
        >
          Back to Return Requests
        </button>
      </div>
    );
  }

  const items = Array.isArray(returnRequest?.items) ? returnRequest.items : [];
  const customer = returnRequest?.customer || {};
  const customerName = customer?.name || returnRequest?.userId?.name || 'Deleted Customer';
  const rawCustomerEmail = customer?.email || returnRequest?.userId?.email || '';
  const customerEmail = rawCustomerEmail && rawCustomerEmail !== 'N/A' ? rawCustomerEmail : '';
  const customerPhone = customer?.phone || returnRequest?.userId?.phone || '';
  const deliveryPartner = returnRequest?.deliveryBoyId || returnRequest?.assignedDeliveryBoy;
  const normalizedStatus = String(returnRequest?.status || '').toLowerCase();
  const canAssignPickup = normalizedStatus === 'approved' || normalizedStatus === 'approved_by_vendor';
  const allowedNextStatuses = statusTransitions[returnRequest?.status] || [];
  const editableStatusOptions = [returnRequest?.status, ...allowedNextStatuses].filter(Boolean).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{returnRequest.id}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                returnRequest.type === 'exchange' ? 'bg-indigo-100 text-indigo-700' : 'bg-primary-100 text-primary-700'
              }`}>
                {returnRequest.type === 'exchange' ? 'Exchange' : 'Return'}
              </span>
            </div>
            <p className="text-xs text-gray-500">Requested on {formatDateTime(returnRequest.requestDate)}</p>
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                <FiCheck className="text-sm" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setStatus(returnRequest.status);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
              >
                <FiX className="text-sm" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <StatusBadge variant={getStatusVariant(returnRequest.status)}>{returnRequest.status}</StatusBadge>
              {returnRequest.status === 'pending' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-xs font-bold">
                  <FiClock className="animate-pulse" />
                  WAITING FOR SELLER
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
                >
                  <FiEdit className="text-sm" />
                  Edit Status
                </button>
              )}
              {canAssignPickup && !deliveryPartner && (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  <FiTruck className="text-sm" />
                  Assign Pickup
                </button>
              )}
              {returnRequest.status === 'delivered_to_seller' && returnRequest.refundStatus === 'pending' && returnRequest.type !== 'exchange' && (
                <button
                  onClick={() => {
                    if (window.confirm('Process refund for this return request?')) {
                      handleProcessRefund();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                >
                  <FiRefreshCw className="text-sm" />
                  Process Refund
                </button>
              )}
              {returnRequest.status === 'inspection_pending' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-xs font-bold font-mono tracking-tighter shadow-sm">
                  <FiSearch className="animate-pulse" />
                  AWAITING SELLER QUALITY CHECK
                </div>
              )}
              {returnRequest.status === 'inspection_rejected' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs font-bold">
                  <FiAlertCircle />
                  INSPECTION FAILED (PENDING RESOLUTION)
                </div>
              )}
              {returnRequest.status === 'approved' && returnRequest.type === 'exchange' && (
                <button
                  onClick={() => {
                    const trk = window.prompt('Enter Forward Tracking Number:', `TRK-EXC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
                    if (trk) shipReplacement(id, trk);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-md"
                >
                  <FiTruck className="text-sm" />
                  Ship Replacement
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
                <p className="font-bold text-gray-800 text-lg">{formatCurrency(returnRequest.refundAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Items</p>
                <p className="font-semibold text-gray-800">{items.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Refund Status</p>
                <StatusBadge variant={returnRequest.refundStatus === 'processed' ? 'success' : returnRequest.refundStatus === 'failed' ? 'error' : 'pending'} className="text-xs">
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
              to={`/admin/orders/${returnRequest.orderId}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              <span>View Order: {returnRequest.orderId}</span>
              <FiArrowLeft className="rotate-180 text-xs" />
            </Link>
          </div>

          {/* Replacement Order Link */}
          {returnRequest.replacementOrderId && (
            <div className="bg-indigo-50 rounded-lg p-4 shadow-sm border border-indigo-200">
              <h2 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
                <FiRefreshCw className="text-indigo-600 text-base" />
                Replacement Order Generated
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">New Order ID</p>
                  <p className="text-lg font-black text-indigo-900">{returnRequest.replacementOrderId}</p>
                </div>
                <Link
                  to={`/admin/orders/${returnRequest.replacementOrderId}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-md"
                >
                  Manage Shipment
                </Link>
              </div>
            </div>
          )}

          {/* Return Items */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiPackage className="text-primary-600 text-base" />
              Items Being Returned ({items.length})
            </h2>
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                  No return items found. The related product may have been deleted.
                </div>
              ) : items.map((item, index) => (
                <div key={item?.id || item?._id || index} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                  {item?.image && (
                    <img
                      src={item?.image}
                      alt={item?.name || item?.title || 'Product'}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{item?.name || item?.title || 'Deleted Product'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-600">
                        {formatCurrency(item?.price || 0)} × {item?.quantity || 1}
                      </p>
                      {item?.reason && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          {item?.reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-sm text-gray-800">
                    {formatCurrency((item?.price || 0) * (item?.quantity || 1))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Return Reason */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiAlertCircle className="text-primary-600 text-base" />
              Return Overview & Governance
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Reason for Return</p>
                <p className="font-semibold text-sm text-gray-800">{returnRequest.reason}</p>
                {returnRequest.description && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mt-2">{returnRequest.description}</p>
                )}
              </div>

              {/* Inspection Failure Resolution UI */}
              {returnRequest.status === 'inspection_rejected' && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                        <FiAlertCircle />
                        <span>INSPECTION FAILED BY SELLER</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-red-200">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Seller's Notes:</p>
                        <p className="text-sm italic text-gray-700">"{returnRequest.inspectionNotes || 'No specific notes provided.'}"</p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                        <button 
                            onClick={() => resolveInspectionFailure(id, 'refund')}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 shadow-lg shadow-red-100"
                        >
                            Convert to Refund
                        </button>
                        <button 
                            onClick={() => resolveInspectionFailure(id, 'return')}
                            className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-xs hover:bg-gray-50"
                        >
                            Return Item to Customer
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Select a resolution to settle this exchange request.</p>
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
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group cursor-pointer"
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
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group cursor-pointer"
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
              <p className="text-[10px] text-gray-400 mt-3 italic">These photos were taken by the delivery partner during pickup.</p>
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
                <p className="font-semibold text-sm text-gray-800">{customer?.name || customerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                {customerEmail ? (
                  <a
                    href={`mailto:${customerEmail}`}
                    className="font-semibold text-xs text-blue-600 hover:text-blue-800 break-all"
                  >
                    {customerEmail}
                  </a>
                ) : (
                  <p className="font-semibold text-xs text-gray-500">Email unavailable</p>
                )}
              </div>
              {(customer?.phone || customerPhone) && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <FiPhone className="text-xs" />
                    Phone
                  </p>
                  <a
                    href={`tel:${customer?.phone || customerPhone}`}
                    className="font-semibold text-sm text-gray-800 hover:text-blue-600"
                  >
                    {customer?.phone || customerPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Logistics Information */}
          {deliveryPartner && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiTruck className="text-primary-600 text-base" />
                Logistics Partner
              </h2>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <FiUser size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-none">Assigned Rider</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800">
                    {typeof deliveryPartner === 'object' 
                      ? deliveryPartner?.name || 'Deleted Rider'
                      : deliveryPartner === 'DB-001' ? 'Rahul Singh' : "Rider ID: " + deliveryPartner}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">ID: {typeof deliveryPartner === 'object' ? deliveryPartner?.id || deliveryPartner?._id || 'N/A' : deliveryPartner}</p>
                </div>
              </div>

              {/* Vendor Monitoring Flag */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Seller Performance Audit</p>
                 <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-amber-700 font-bold">Inspection Rejection Rate</span>
                        <span className="px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded text-[10px] font-black">12%</span>
                    </div>
                    <div className="w-full bg-amber-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[12%]" />
                    </div>
                    <p className="text-[9px] text-amber-600 mt-2 font-medium">
                        <FiAlertCircle className="inline mr-1" />
                        Within normal range. No abuse flagged.
                    </p>
                 </div>
              </div>
            </div>
          )}

          {/* Forward Logistics (For Exchange) */}
          {returnRequest.type === 'exchange' && returnRequest.forwardTrackingNumber && (
             <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 border-l-4 border-l-indigo-500">
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <FiTruck className="text-indigo-600 text-base" />
                Forward Shipment (Replacement)
              </h2>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest leading-none mb-1">Tracking Number</p>
                  <p className="font-mono font-bold text-gray-800">{returnRequest.forwardTrackingNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Status</p>
                  <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded text-[10px] font-bold">IN TRANSIT</span>
                </div>
              </div>
            </div>
          )}
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
                  {formatCurrency(
                    items.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 1), 0)
                  )}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-bold text-gray-800">Refund Amount</span>
                <span className="font-bold text-lg text-gray-800">{formatCurrency(returnRequest.refundAmount)}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Refund Status</p>
                <StatusBadge variant={returnRequest.refundStatus === 'processed' ? 'success' : returnRequest.refundStatus === 'failed' ? 'error' : 'pending'}>
                  {returnRequest.refundStatus}
                </StatusBadge>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FiCalendar className="text-primary-600 text-base" />
              Status Timeline
            </h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">Request Submitted</p>
                  <p className="text-xs text-gray-500">{formatDateTime(returnRequest.requestDate)}</p>
                </div>
              </div>
              {returnRequest.status === 'approved' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Approved</p>
                    <p className="text-xs text-gray-500">{formatDateTime(returnRequest.updatedAt)}</p>
                  </div>
                </div>
              )}
              {returnRequest.status === 'processing' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Processing</p>
                    <p className="text-xs text-gray-500">{formatDateTime(returnRequest.updatedAt)}</p>
                  </div>
                </div>
              )}
              {returnRequest.status === 'completed' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Completed</p>
                    <p className="text-xs text-gray-500">{formatDateTime(returnRequest.updatedAt)}</p>
                  </div>
                </div>
              )}
              {returnRequest.status === 'rejected' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Rejected</p>
                    <p className="text-xs text-gray-500">{formatDateTime(returnRequest.updatedAt)}</p>
                  </div>
                </div>
              )}
              {returnRequest.status === 'inspection_rejected' && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-red-700">Inspection Failed</p>
                    <p className="text-xs text-gray-500">Awaiting Admin Resolution</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              <Link
                to={`/admin/orders/${returnRequest.orderId}`}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-semibold"
              >
                <FiShoppingBag className="text-sm" />
                View Original Order
              </Link>
              <button
                onClick={() => {
                  if (customerEmail) {
                    window.location.href = `mailto:${customerEmail}`;
                  }
                }}
                disabled={!customerEmail}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-semibold"
              >
                <FiMail className="text-sm" />
                Email Customer
              </button>
              {(customer?.phone || customerPhone) && (
                <button
                  onClick={() => window.location.href = `tel:${customer?.phone || customerPhone}`}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-semibold"
                >
                  <FiPhone className="text-sm" />
                  Call Customer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
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
              <p className="text-sm text-gray-500 mb-6">Select a rider to pickup this return item.</p>
              
              <div className="space-y-4">
                <AnimatedSelect
                  value={selectedDeliveryBoyId}
                  onChange={(e) => setSelectedDeliveryBoyId(e.target.value)}
                  options={[
                    { value: '', label: 'Select Delivery Boy' },
                    ...deliveryBoys.map((boy) => ({
                      value: String(boy.id || boy._id),
                      label: `${boy.name} (${boy.phone || 'N/A'})`,
                    })),
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
    </motion.div>
  );
};

export default ReturnRequestDetail;
