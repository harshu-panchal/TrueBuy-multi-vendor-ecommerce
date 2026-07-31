import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit,
  FiCheck,
  FiX,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCalendar,
  FiTag,
  FiPackage,
  FiClock,
  FiMail
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Badge from '../../../shared/components/Badge';
import AnimatedSelect from '../components/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../utils/adminHelpers';
import { getOrderById, updateOrderStatus, getAllDeliveryBoys, assignDeliveryBoy } from '../services/adminService';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      setIsLoading(true);
      try {
        const [response, boysRes] = await Promise.all([
          getOrderById(id),
          getAllDeliveryBoys({ page: 1, limit: 100, status: "active", applicationStatus: "approved", availableOnly: true })
        ]);
        
        const o = response.data;
        const boysRows = boysRes?.data?.deliveryBoys || [];
        setDeliveryBoys(boysRows);

        // Normalize data to match UI structure
        const normalizedOrder = {
          ...o,
          id: o.orderId || o._id,
          customer: {
            name: o.userId?.name || 'Unknown',
            email: o.userId?.email || '',
            phone: o.userId?.phone || ''
          },
          date: o.createdAt
        };

        setOrder(normalizedOrder);
        setStatus(o.status);
      } catch (error) {
        console.error("Fetch order detail error:", error);
        toast.error('Order not found');
        navigate('/admin/orders/all-orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [id, navigate]);

  const handleStatusUpdate = async () => {
    try {
      await updateOrderStatus(id, status);
      setOrder({ ...order, status });
      setIsEditing(false);
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleAssignDelivery = async (subOrderId, deliveryBoyId) => {
    try {
      await assignDeliveryBoy(subOrderId, deliveryBoyId);
      setOrder((prev) => ({
        ...prev,
        subOrders: prev.subOrders.map((so) =>
          so.subOrderId === subOrderId || so._id === subOrderId
            ? { ...so, deliveryBoyId: deliveryBoyId }
            : so
        )
      }));
      toast.success('Delivery partner assigned');
    } catch (error) {
      console.error("Assign error:", error);
      toast.error('Failed to assign delivery partner');
    }
  };

  if (isLoading || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

  // Handle items - could be a number or an array
  const subOrders = order.subOrders || [];
  const itemsCount = subOrders.reduce((total, so) => total + (so.items?.length || 0), 0);
  const hasItems = itemsCount > 0;

  // Calculate order breakdown
  const subtotal = order.subtotal ?? (order.total * 0.95);
  const shipping = order.shipping ?? (order.total * 0.05);
  const tax = order.tax ?? 0;
  const discount = order.discount ?? 0;

  // Get payment method display name
  const getPaymentMethodName = (method) => {
    if (!method) return 'N/A';
    const methods = {
      card: 'Credit/Debit Card',
      cash: 'Cash on Delivery',
      upi: 'UPI',
      wallet: 'Digital Wallet',
      bank: 'Bank Transfer'
    };
    return methods[method.toLowerCase()] || method;
  };

  // Resolve product image safely from the order payload
  const getProductImage = (item) => {
    if (item.image) {
      return item.image;
    }
    if (item.productId?.images?.[0]) {
      return item.productId.images[0];
    }

    // Return placeholder
    return 'https://via.placeholder.com/100x100?text=Product';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-lg text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{order.id}</h1>
            <p className="text-xs text-gray-500">{formatDateTime(order.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleStatusUpdate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <FiCheck className="text-sm" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setStatus(order.status);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <FiX className="text-sm" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <Badge variant={order.status}>{order.status}</Badge>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <FiEdit className="text-sm" />
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Overview Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            {isEditing ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Order Status
                </label>
                <AnimatedSelect
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={statusOptions.map((option) => ({
                    value: option,
                    label: option.charAt(0).toUpperCase() + option.slice(1),
                  }))}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Total</p>
                  <p className="font-bold text-gray-800 text-lg">{formatCurrency(order.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Items</p>
                  <p className="font-semibold text-gray-800">{itemsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Payment</p>
                  <p className="text-xs font-semibold text-gray-800 capitalize">
                    {getPaymentMethodName(order.paymentMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Payment Status</p>
                  <Badge variant={order.paymentStatus === 'paid' ? 'delivered' : order.paymentStatus === 'pending' ? 'pending' : 'cancelled'} className="text-xs">
                    {order.paymentStatus || (order.paymentMethod === 'cash' ? 'Pending' : 'Paid')}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Order Items via SubOrders */}
          {hasItems && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiPackage className="text-primary-600 text-base" />
                Product Orders ({itemsCount} items)
              </h2>
              <div className="space-y-4">
                {subOrders.map((subOrder) => (
                  <div key={subOrder._id || subOrder.subOrderId} className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 flex justify-between items-center border-b border-gray-100 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-xs font-semibold text-gray-600 mr-2">Product Order ID:</span>
                          <span className="text-xs font-bold text-primary-600">{subOrder.subOrderId}</span>
                        </div>
                        <Badge variant={subOrder.status === 'delivered' ? 'delivered' : 'pending'} className="text-[10px] px-1.5 py-0.5">
                          {subOrder.status}
                        </Badge>
                      </div>
                      {['pending', 'processing', 'shipped'].includes(subOrder.status?.toLowerCase()) && (
                        <div className="flex items-center gap-2">
                          <AnimatedSelect
                            name="deliveryBoyId"
                            value={String(subOrder.deliveryBoyId?._id || subOrder.deliveryBoyId || "")}
                            onChange={(e) => handleAssignDelivery(subOrder.subOrderId || subOrder._id, e.target.value)}
                            options={[
                              { value: "", label: "Unassigned" },
                              ...deliveryBoys.map((boy) => ({
                                value: String(boy.id || boy._id),
                                label: `${boy.name} (${boy.phone || "N/A"})`,
                              })),
                            ]}
                            className="text-xs py-1 px-2 pr-8 h-8 min-w-[180px]"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-2">
                      {(subOrder.items || []).map((item) => (
                        <div key={item._id || item.productId || item.name} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                          <img
                            src={getProductImage(item)}
                            alt={item.name || 'Product'}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">{item.name || 'Unknown Product'}</p>
                            <p className="text-xs text-gray-500">
                              Product ID: <span className="font-mono">{item.productId || 'N/A'}</span>
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {formatCurrency(item.price || 0)} x {item.quantity || 1}
                            </p>
                          </div>
                          <p className="font-bold text-sm text-gray-800">
                            {formatCurrency((item.price || 0) * (item.quantity || 1))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer & Shipping Combined Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div>
                <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                  <FiMail className="text-primary-600 text-base" />
                  Customer
                </h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-semibold text-sm text-gray-800">{order.customer?.name || order.shippingAddress?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-xs text-gray-800 break-all">{order.customer?.email || order.shippingAddress?.email || 'N/A'}</p>
                  </div>
                  {(order.customer?.phone || order.shippingAddress?.phone) && (
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FiPhone className="text-xs" />
                        Phone
                      </p>
                      <p className="font-semibold text-sm text-gray-800">{order.customer?.phone || order.shippingAddress?.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div>
                  <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                    <FiMapPin className="text-primary-600 text-base" />
                    Shipping Address
                  </h2>
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-gray-800">{order.shippingAddress.name || 'N/A'}</p>
                    {order.shippingAddress.address && (
                      <p className="text-gray-700">{order.shippingAddress.address}</p>
                    )}
                    {(order.shippingAddress.city || order.shippingAddress.state || order.shippingAddress.zipCode) && (
                      <p className="text-gray-700">
                        {[
                          order.shippingAddress.city,
                          order.shippingAddress.state,
                          order.shippingAddress.zipCode
                        ].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {order.shippingAddress.country && (
                      <p className="text-gray-700">{order.shippingAddress.country}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tracking & Delivery Compact */}
          {(order.trackingNumber || order.estimatedDelivery || order.deliveredDate || order.deliveredAt) && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <FiTruck className="text-primary-600 text-base" />
                Tracking & Delivery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {order.trackingNumber && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Tracking Number</p>
                    <p className="font-semibold text-xs text-gray-800 font-mono">{order.trackingNumber}</p>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <FiClock className="text-xs" />
                      Est. Delivery
                    </p>
                    <p className="font-semibold text-xs text-gray-800">{formatDateTime(order.estimatedDelivery)}</p>
                  </div>
                )}
                {(order.deliveredDate || order.deliveredAt) && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                      <FiPackage className="text-xs" />
                      Delivered
                    </p>
                    <p className="font-semibold text-xs text-gray-800">
                      {formatDateTime(order.deliveredDate || order.deliveredAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <FiTag className="text-xs" />
                    Discount
                    {order.couponCode && (
                      <span className="text-xs bg-green-100 px-1.5 py-0.5 rounded">({order.couponCode})</span>
                    )}
                  </span>
                  <span className="font-semibold">-{formatCurrency(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">{formatCurrency(shipping)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-lg text-gray-800">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <FiCalendar className="text-primary-600 text-base" />
              Timeline
            </h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">Order Placed</p>
                  <p className="text-xs text-gray-500">{formatDateTime(order.date)}</p>
                </div>
              </div>
              {order.status === 'processing' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Processing</p>
                    <p className="text-xs text-gray-500">Being prepared</p>
                  </div>
                </div>
              )}
              {order.status === 'shipped' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Shipped</p>
                    {order.shippedDate && (
                      <p className="text-xs text-gray-500">{formatDateTime(order.shippedDate)}</p>
                    )}
                  </div>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Delivered</p>
                    {(order.deliveredDate || order.deliveredAt) && (
                      <p className="text-xs text-gray-500">{formatDateTime(order.deliveredDate || order.deliveredAt)}</p>
                    )}
                  </div>
                </div>
              )}
              {order.status === 'cancelled' && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">Cancelled</p>
                    {(order.cancelledDate || order.cancelledAt) && (
                      <p className="text-xs text-gray-500">{formatDateTime(order.cancelledDate || order.cancelledAt)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              {order.trackingNumber && (
                <button
                  onClick={() => window.open(`/track-order/${order.id}`, '_blank')}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-semibold"
                >
                  <FiTruck className="text-sm" />
                  Track Order
                </button>
              )}
              {order.customer?.email && (
                <button
                  onClick={() => window.location.href = `mailto:${order.customer.email}`}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-semibold"
                >
                  <FiMail className="text-sm" />
                  Email Customer
                </button>
              )}
              {(order.customer?.phone || order.shippingAddress?.phone) && (
                <button
                  onClick={() => window.location.href = `tel:${order.customer?.phone || order.shippingAddress?.phone}`}
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
    </motion.div>
  );
};

export default OrderDetail;

