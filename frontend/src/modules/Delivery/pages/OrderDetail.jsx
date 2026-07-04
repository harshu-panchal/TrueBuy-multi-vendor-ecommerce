import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiPackage,
  FiNavigation,
  FiCheckCircle,
  FiCheck,
  FiClock,
} from 'react-icons/fi';
import PageTransition from '../../../shared/components/PageTransition';
import toast from 'react-hot-toast';
import { useDeliveryAuthStore } from '../store/deliveryStore';
import RoutePreviewMap from '../../Admin/components/Map/RoutePreviewMap';

const DeliveryOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchOrderById, acceptOrder, completeOrder, resendDeliveryOtp, isLoadingOrder, isUpdatingOrderStatus, deliveryBoy } = useDeliveryAuthStore();
  const [order, setOrder] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [vendorPickupOtp, setVendorPickupOtp] = useState('');
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });

  const loadOrder = async () => {
    try {
      setLoadFailed(false);
      const response = await fetchOrderById(id);
      setOrder(response);
    } catch {
      setLoadFailed(true);
      setOrder(null);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id, fetchOrderById]);

  const handleAcceptOrder = async () => {
    if (!order || !['pending', 'processing', 'assigned_for_delivery'].includes(order.status)) return;
    const normalizedOtp = String(vendorPickupOtp || '').trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      toast.error('Please enter valid 6-digit Vendor OTP');
      return;
    }
    try {
      const updated = await acceptOrder(order.id, normalizedOtp);
      setOrder(updated);
      setVendorPickupOtp('');
      toast.success('Order picked up successfully');
    } catch {
      // Error toast handled by API interceptor.
    }
  };

  const handleCompleteOrder = async () => {
    if (!order || !['shipped', 'in-transit'].includes(order.status)) return;
    const normalizedOtp = String(deliveryOtp || '').trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    try {
      const updated = await completeOrder(order.id, normalizedOtp);
      setOrder(updated);
      setDeliveryOtp('');
      toast.success('Order marked as delivered');
    } catch {
      // Error toast handled by API interceptor.
    }
  };

  const handleResendOtp = async () => {
    if (!order || !['shipped', 'in-transit'].includes(order.status) || isResendingOtp) return;
    try {
      setIsResendingOtp(true);
      const result = await resendDeliveryOtp(order.id);
      toast.success(result?.message || 'Delivery OTP request processed');
    } catch {
      // Error toast handled by API interceptor.
    } finally {
      setIsResendingOtp(false);
    }
  };

  const openInGoogleMaps = (type) => {
    const originStr = deliveryBoy?.currentLocation?.lat 
      ? `${deliveryBoy.currentLocation.lat},${deliveryBoy.currentLocation.lng}` 
      : '';
      
    const vendorStr = order?.vendorAddress ? encodeURIComponent(order.vendorAddress) : '';
    const customerStr = order?.address ? encodeURIComponent(order.address) : '';

    let webUrl = `https://www.google.com/maps/dir/?api=1`;
    if (originStr) webUrl += `&origin=${originStr}`;

    if (type === 'vendor') {
      if (vendorStr) webUrl += `&destination=${vendorStr}`;
    } else if (type === 'customer') {
      if (customerStr) webUrl += `&destination=${customerStr}`;
    } else {
      // Full route
      if (customerStr) webUrl += `&destination=${customerStr}`;
      if (vendorStr) webUrl += `&waypoints=${vendorStr}`;
    }
    
    if (!originStr) webUrl += `&dir_action=navigate`;
    window.open(webUrl, '_blank');
  };

  if (isLoadingOrder) {
    return (
      <PageTransition>
        <div className="px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <div className="px-4 py-6 text-center space-y-3">
          <p className="text-gray-600">{loadFailed ? 'Unable to load order details' : 'Order not found'}</p>
          {loadFailed && (
            <button
              onClick={loadOrder}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold"
            >
              Retry
            </button>
          )}
        </div>
      </PageTransition>
    );
  }

  const vendorInitial = order?.vendorName ? order.vendorName.charAt(0).toUpperCase() : 'V';
  const customerInitial = order?.customer ? order.customer.charAt(0).toUpperCase() : 'C';

  return (
    <PageTransition>
      <div className="bg-gray-50 min-h-screen pb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/delivery/orders')} className="p-1 hover:bg-gray-100 rounded-full">
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">DRIVER ASSIGNED</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">STANDARD</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] font-extrabold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
            #{order.id.slice(-8).toUpperCase()}
          </div>
        </div>

        {/* Map Section */}
        <div className="relative w-full h-[280px] bg-gray-200">
          <RoutePreviewMap
            origin={deliveryBoy?.currentLocation?.lat ? deliveryBoy.currentLocation : null}
            waypoint={order.vendorLat && order.vendorLng ? { lat: order.vendorLat, lng: order.vendorLng } : order.vendorAddress}
            destination={order.shippingLat && order.shippingLng ? { lat: order.shippingLat, lng: order.shippingLng } : order.address}
            hideInternalUI={true}
            onRouteCalculated={setRouteInfo}
          />
          {/* Map Overlay Text - Top Right */}
          {routeInfo.distance && routeInfo.duration && (
            <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-3 text-[11px] font-black text-gray-700 z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center">
                  <FiMapPin className="text-purple-600 text-xs" />
                </div>
                <span>{routeInfo.distance}</span>
              </div>
              <div className="w-px h-4 bg-gray-200"></div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center">
                  <FiClock className="text-purple-600 text-xs" />
                </div>
                <span>{routeInfo.duration}</span>
              </div>
            </div>
          )}
          {/* Map Overlay Text - Bottom Center */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-5 py-2.5 rounded-full shadow-lg text-[11px] font-extrabold text-gray-600 flex items-center justify-center whitespace-nowrap z-10">
            {order.status === 'pending' || order.status === 'processing' || order.status === 'assigned_for_delivery' ? 'Start when you\'re ready to head to the pickup.' : 
             order.status === 'shipped' || order.status === 'in-transit' ? 'Head to the customer.' : 'Completed'}
          </div>
        </div>

        <div className="px-4 py-6 space-y-5 -mt-4 relative z-20">
          {/* Pickup Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-orange-50 relative ${['shipped', 'in-transit', 'completed'].includes(order.status) ? 'opacity-60' : ''}`}>
            {['shipped', 'in-transit', 'completed'].includes(order.status) && (
              <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-1 rounded-md">PICKED UP</div>
            )}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full ${['shipped', 'in-transit', 'completed'].includes(order.status) ? 'bg-green-100 text-green-600' : 'bg-orange-50 text-orange-500'} flex items-center justify-center flex-shrink-0`}>
                {['shipped', 'in-transit', 'completed'].includes(order.status) ? (
                  <FiCheck className="text-2xl font-bold" />
                ) : (
                  <span className="font-bold text-xl">{vendorInitial}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                  {['shipped', 'in-transit', 'completed'].includes(order.status) ? 'PICKUP DONE' : 'PICKUP FROM'}
                </span>
                <h3 className="text-lg font-black text-gray-800">{order.vendorName || 'Vendor'}</h3>
              </div>
            </div>
            
            <div className="space-y-4 ml-1">
              <div className="flex gap-4">
                <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-extrabold text-gray-400 tracking-wider mb-1">ADDRESS</p>
                  <p className="text-[13px] font-bold text-gray-700 leading-tight pr-4">{order.vendorAddress || 'Address unavailable'}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <FiPhone className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-extrabold text-gray-400 tracking-wider mb-1">PHONE</p>
                  <p className="text-[13px] font-bold text-gray-700 leading-tight">{order.vendorPhone || 'Phone unavailable'}</p>
                </div>
              </div>
            </div>

            <div className={`flex gap-3 mt-6 ${['shipped', 'in-transit', 'completed'].includes(order.status) ? 'pointer-events-none' : ''}`}>
              <button 
                onClick={() => openInGoogleMaps('vendor')}
                className="w-16 h-12 flex items-center justify-center rounded-2xl border-2 border-blue-50 text-blue-500 hover:bg-blue-50 transition-colors flex-shrink-0"
              >
                <FiNavigation size={18} className="transform -rotate-45" />
              </button>
              <button
                onClick={() => order.vendorPhone && window.open(`tel:${order.vendorPhone}`, '_self')}
                disabled={!order.vendorPhone}
                className="flex-1 h-12 bg-[#00c875] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#00b368] transition-colors disabled:opacity-50 shadow-sm shadow-[#00c875]/20"
              >
                <FiPhone />
                Call
              </button>
            </div>
          </motion.div>

          {/* Delivery Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 relative ${['pending', 'processing', 'assigned_for_delivery'].includes(order.status) ? 'opacity-50' : ''} ${order.status === 'completed' ? 'opacity-60' : ''}`}>
            {['pending', 'processing', 'assigned_for_delivery'].includes(order.status) && (
              <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-md">LOCKED</div>
            )}
            {order.status === 'completed' && (
              <div className="absolute top-4 right-4 bg-green-100 text-green-600 text-[10px] font-black px-2 py-1 rounded-md">DELIVERED</div>
            )}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-[#f4f1ff] text-[#9b83f0]'} flex items-center justify-center flex-shrink-0`}>
                {order.status === 'completed' ? (
                  <FiCheck className="text-2xl font-bold" />
                ) : (
                  <span className="font-bold text-xl">{customerInitial}</span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                  {order.status === 'completed' ? 'DELIVERED TO' : 'DELIVER TO'}
                </span>
                <h3 className="text-lg font-black text-gray-800">{order.customer}</h3>
              </div>
            </div>
            
            <div className="space-y-4 ml-1">
              <div className="flex gap-4">
                <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-extrabold text-gray-400 tracking-wider mb-1">ADDRESS</p>
                  <p className="text-[13px] font-bold text-gray-700 leading-tight pr-4">{order.address || 'Address unavailable'}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <FiPhone className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-extrabold text-gray-400 tracking-wider mb-1">PHONE</p>
                  <p className="text-[13px] font-bold text-gray-700 leading-tight">{order.phone || 'Phone unavailable'}</p>
                </div>
              </div>
            </div>

            <div className={`flex gap-3 mt-6 ${['pending', 'processing', 'assigned_for_delivery', 'completed'].includes(order.status) ? 'pointer-events-none' : ''}`}>
              <button 
                onClick={() => openInGoogleMaps('customer')}
                className="w-16 h-12 flex items-center justify-center rounded-2xl border-2 border-blue-50 text-blue-500 hover:bg-blue-50 transition-colors flex-shrink-0"
              >
                <FiNavigation size={18} className="transform -rotate-45" />
              </button>
              <button
                onClick={() => order.phone && window.open(`tel:${order.phone}`, '_self')}
                disabled={!order.phone || order.status === 'pending'}
                className="flex-1 h-12 bg-[#00c875] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#00b368] transition-colors disabled:opacity-50 shadow-sm shadow-[#00c875]/20"
              >
                <FiPhone />
                Call
              </button>
            </div>
          </motion.div>

          {/* Order Contents */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                <FiPackage className="text-gray-400 text-lg" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">ORDER CONTENTS</span>
                <h3 className="text-base font-black text-gray-800">{order.itemCount} Items in Task</h3>
              </div>
            </div>
            {order.items && order.items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 mt-2 border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                  {item.image ? (
                    <img src={item.image} alt={item.name || 'Item'} className="w-full h-full object-cover" />
                  ) : (
                    <FiPackage className="text-gray-300 text-lg" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name || 'Item'}</h4>
                  <span className="text-[10px] font-extrabold text-gray-500 tracking-wider">QTY: {item.quantity}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Trip Summary Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <span className="text-[10px] font-extrabold text-gray-400 tracking-wider block mb-4">TRIP</span>
            
            {/* Top Blue Box */}
            <div className="bg-[#f5f7ff] rounded-2xl p-4 flex items-center justify-between mb-6">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[9px] font-extrabold text-blue-400 tracking-wider mb-1">TRIP DISTANCE</span>
                <span className="text-sm font-black text-blue-900">{routeInfo.distance || order.distance || '--'}</span>
              </div>
              <div className="w-px h-8 bg-blue-100"></div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[9px] font-extrabold text-blue-400 tracking-wider mb-1">EST. TIME</span>
                <span className="text-sm font-black text-blue-900">{routeInfo.duration || '--'}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-3">
              <div className="absolute left-[17px] top-5 bottom-8 w-px border-l-2 border-dotted border-gray-200"></div>
              
              <div className="relative z-10 flex gap-4 mb-6">
                <div className="w-3 h-3 mt-1 rounded-full border-[3px] border-blue-500 bg-white"></div>
                <div>
                  <span className="text-[10px] font-extrabold text-gray-500 tracking-wider block mb-1">PICKUP</span>
                  <p className="text-xs font-bold text-gray-700 leading-snug">{order.vendorAddress || 'Address unavailable'}</p>
                </div>
              </div>
              
              <div className="relative z-10 flex gap-4">
                <div className="w-3 h-3 mt-1 rounded-full border-[3px] border-red-500 bg-white"></div>
                <div>
                  <span className="text-[10px] font-extrabold text-gray-500 tracking-wider block mb-1">DROPOFF</span>
                  <p className="text-xs font-bold text-gray-700 leading-snug">{order.address || 'Address unavailable'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Earnings Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <span className="text-green-500 font-bold text-lg">₹</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 tracking-wider">YOUR EARNING</span>
                <h3 className="text-xl font-black text-gray-800">
                  ₹{order.deliveryEarnings || ((order.deliveryBaseFee || 40) + ((parseFloat(routeInfo.distance) || 0) * (order.deliveryPerKmFee || 5))).toFixed(2)}
                </h3>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 mt-2 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-extrabold text-gray-500">Base Fee</span>
                <span className="text-[11px] font-black text-gray-800">₹{order.deliveryBaseFee || 40}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-gray-500">Distance ({routeInfo.distance || '0 km'} × ₹{order.deliveryPerKmFee || 5})</span>
                <span className="text-[11px] font-black text-gray-800">₹{((parseFloat(routeInfo.distance) || 0) * (order.deliveryPerKmFee || 5)).toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[9px] text-gray-400 font-semibold mt-3 text-center px-2">Net amount after platform commission. Credited to your wallet once the trip is completed.</p>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-2 space-y-4">
            {['pending', 'processing', 'assigned_for_delivery'].includes(order.status) && (
              <div className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={vendorPickupOtp}
                  onChange={(e) => setVendorPickupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit vendor pickup OTP"
                  className="w-full h-14 px-5 rounded-2xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base font-bold text-center tracking-widest"
                />
                <button
                  onClick={handleAcceptOrder}
                  disabled={isUpdatingOrderStatus || vendorPickupOtp.length !== 6}
                  className="w-full h-[52px] bg-blue-500 text-white rounded-full font-black text-xs tracking-wider flex items-center justify-center transition-colors hover:bg-blue-600 disabled:opacity-80 shadow-lg shadow-blue-500/30"
                >
                  {isUpdatingOrderStatus ? 'WAITING...' : 'CONFIRM PICKUP'}
                </button>
              </div>
            )}
            
            {['shipped', 'in-transit'].includes(order.status) && (
              <div className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={deliveryOtp}
                  onChange={(e) => setDeliveryOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit delivery OTP"
                  className="w-full h-14 px-5 rounded-2xl bg-white border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base font-bold text-center tracking-widest"
                />
                <button
                  onClick={handleCompleteOrder}
                  disabled={isUpdatingOrderStatus || deliveryOtp.length !== 6 || isResendingOtp}
                  className="w-full h-[52px] bg-[#d9d9d9] text-white rounded-full font-black text-xs tracking-wider flex items-center justify-center transition-colors hover:bg-gray-400 disabled:opacity-80"
                >
                  {isUpdatingOrderStatus ? 'PROCESSING...' : 'PROVIDE OTP & PHOTO TO COMPLETE'}
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={isResendingOtp || isUpdatingOrderStatus}
                  className="w-full h-[40px] border border-blue-500 text-blue-500 rounded-full font-bold text-xs tracking-wider flex items-center justify-center transition-colors hover:bg-blue-50 disabled:opacity-50 mt-2"
                >
                  {isResendingOtp ? 'SENDING...' : 'RESEND OTP'}
                </button>
              </div>
            )}
            
            <button className="w-full py-4 text-[11px] font-black text-[#ff4b4b] tracking-wider flex items-center justify-center gap-2 hover:text-red-600 transition-colors">
              <span className="text-base font-bold leading-none -mt-0.5">×</span> CANCEL TRIP
            </button>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};

export default DeliveryOrderDetail;


