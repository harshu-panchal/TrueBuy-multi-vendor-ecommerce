import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiTruck, FiEye, FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import MobileLayout from "../components/Layout/MobileLayout";
import { useOrderStore } from '../../../shared/store/orderStore';
import { formatPrice } from '../../../shared/utils/helpers';
import { formatVariantLabel } from '../../../shared/utils/variant';
import PageTransition from '../../../shared/components/PageTransition';
import LazyImage from '../../../shared/components/LazyImage';

const MobileOrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder, fetchOrderById, lastError } = useOrderStore();
  const [isResolving, setIsResolving] = useState(true);
  const order = getOrder(orderId);
  const orderItems = Array.isArray(order?.items) ? order.items : [];
  const displayOrderId = order?.id || order?.orderId || orderId;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!order && orderId) {
        await fetchOrderById(orderId);
      }
      if (mounted) setIsResolving(false);
    })();
    return () => {
      mounted = false;
    };
  }, [order, orderId, fetchOrderById]);

  useEffect(() => {
    if (!isResolving && !order) {
      navigate('/home');
    }
  }, [isResolving, order, navigate]);

  if (isResolving) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <p className="text-gray-600">Loading order...</p>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Not Found</h2>
              {lastError ? (
                <p className="text-sm text-gray-500 mb-4">{lastError}</p>
              ) : null}
              <button
                onClick={() => navigate('/home')}
                className="gradient-green text-white px-6 py-3 rounded-xl font-semibold"
              >
                Go Home
              </button>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <PageTransition>
      <MobileLayout showBottomNav={false} showCartBar={false}>
        <div className="w-full min-h-screen pt-8 pb-24 lg:pt-16 bg-gray-50 flex flex-col items-center px-4">
          <div className="w-full max-w-lg lg:max-w-5xl">
            {/* Header Success Section - Centered on all views */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center justify-center mb-8 text-center"
            >
              <div className="w-20 h-20 gradient-green rounded-full flex items-center justify-center mb-4 shadow-glow-green relative">
                <FiCheckCircle className="text-white text-4xl relative z-10" />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute inset-0 bg-green-400 rounded-full"
                />
              </div>
              <h1 className="text-2xl lg:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Order Confirmed!</h1>
              <p className="text-gray-600 max-w-md text-sm lg:text-base">
                Thank you for your purchase. Your order <span className="font-bold text-gray-800">#{displayOrderId}</span> has been received.
              </p>
            </motion.div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-start">
              {/* Left Column: Order Summary Info */}
              <div className="space-y-4">
                <div className="glass-card rounded-2xl p-5 border border-white shadow-lg">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-primary-600 rounded-full" />
                    Order Summary
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Order Number</p>
                      <p className="text-lg font-black text-gray-900 tracking-tight">{displayOrderId}</p>
                    </div>

                    {order.trackingNumber && (
                      <div className="bg-primary-50 p-3 rounded-xl border border-primary-100 text-center">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-primary-400 mb-0.5">Tracking Number</p>
                        <p className="text-base font-black text-primary-600 tracking-tight">{order.trackingNumber}</p>
                      </div>
                    )}

                    <div className="space-y-3 pt-1">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100 text-sm">
                        <span className="text-gray-500 font-medium">Order Date</span>
                        <span className="font-bold text-gray-800">{formatDate(order.date || order.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100 text-sm">
                        <span className="text-gray-500 font-medium">Payment Method</span>
                        <span className="font-bold text-gray-800 capitalize px-2.5 py-0.5 bg-gray-100 rounded-full text-[11px]">
                          {order.paymentMethod || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-900 font-bold text-base">Total Amount</span>
                        <span className="font-black text-primary-600 text-2xl tracking-tight">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Items */}
              <div className="mt-6 lg:mt-0 space-y-4">
                <div className="glass-card rounded-2xl p-5 border border-white shadow-lg">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-accent-500 rounded-full" />
                    Items ({orderItems.length})
                  </h2>
                  <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-nano">
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm border border-gray-100">
                            <LazyImage
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{item.name}</h3>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500 font-medium">
                                {formatPrice(item.price)} <span className="text-[10px]">x</span> {item.quantity}
                              </p>
                              {formatVariantLabel(item?.variant) && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] uppercase font-bold rounded">
                                  {formatVariantLabel(item?.variant)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-gray-900 text-base">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {orderItems.length === 0 && (
                        <div className="text-center py-8">
                           <FiShoppingBag className="text-4xl text-gray-100 mx-auto mb-3" />
                           <p className="text-xs text-gray-500">No item details available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default MobileOrderConfirmation;

