import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiX, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const NewOrderModal = ({ isOpen, onClose, orderData }) => {
  const navigate = useNavigate();

  if (!orderData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header with Animation */}
            <div className="bg-primary-600 p-8 text-center relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiShoppingBag className="text-white text-4xl" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-1">New Order Received!</h2>
              <p className="text-primary-100 text-sm">You have a new order to process</p>
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 text-sm font-medium">Order ID</span>
                  <span className="text-gray-900 font-bold">{orderData.orderId}</span>
                </div>
                {orderData.amount && (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-500 text-sm font-medium">Total Amount</span>
                    <span className="text-primary-600 font-bold">₹{orderData.amount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-medium">Items</span>
                  <span className="text-gray-900 font-semibold">{orderData.itemCount || 1} Products</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigate("/vendor/orders/all-orders");
                    onClose();
                  }}
                  className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98]"
                >
                  View Order Details
                  <FiArrowRight />
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-white text-gray-600 py-4 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Micro-animation elements */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-10 -right-10 w-40 h-40 border-4 border-primary-100 rounded-full pointer-events-none"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewOrderModal;
