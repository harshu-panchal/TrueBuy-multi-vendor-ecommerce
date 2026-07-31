import { useState, useEffect } from 'react';
import { FiWifiOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineFallback = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <FiWifiOff className="text-4xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">No Internet Connection</h2>
          <p className="text-gray-500 font-medium mb-8">
            Please check your network settings and try again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineFallback;
