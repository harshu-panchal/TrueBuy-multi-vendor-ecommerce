import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiClock, FiZap } from "react-icons/fi";
import ProductCard from "../../../../shared/components/ProductCard";
import { getDailyDeals } from "../../data/catalogData";

const DailyDealsSection = ({ products = null }) => {
  const fallback = getDailyDeals().slice(0, 5);
  const dailyDeals = Array.isArray(products) && products.length > 0
    ? products.slice(0, 5)
    : fallback;
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  // Countdown timer - resets daily
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const difference = endOfDay - now;

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (value) => {
    return value.toString().padStart(2, "0");
  };

  if (dailyDeals.length === 0) {
    return null;
  }

  return (
    <div className="relative my-6 mx-4 sm:mx-6 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 bg-white/40 backdrop-blur-xl">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-6">
        {/* Header with Badge */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#1a202c] rounded-full p-2.5">
                <FiZap className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#1a202c] tracking-tight">
                  Daily Deals
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">
                  Limited time offers
                </p>
              </div>
            </div>
            <Link
              to="/daily-deals"
              className="bg-white/60 hover:bg-white text-[#1a202c] text-xs font-semibold px-4 py-2 rounded-full shadow-sm transition-all border border-white">
              See All
            </Link>
          </div>

          {/* Prominent Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/60 text-[#1a202c] rounded-2xl px-3 py-2 min-w-[3rem] text-center shadow-sm border border-white">
                <div className="text-lg font-bold leading-none mb-1">{formatTime(timeLeft.hours)}</div>
                <div className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">Hrs</div>
              </div>
              <span className="text-gray-400 font-bold text-xl mb-3">:</span>
              <div className="bg-white/60 text-[#1a202c] rounded-2xl px-3 py-2 min-w-[3rem] text-center shadow-sm border border-white">
                <div className="text-lg font-bold leading-none mb-1">{formatTime(timeLeft.minutes)}</div>
                <div className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">Min</div>
              </div>
              <span className="text-gray-400 font-bold text-xl mb-3">:</span>
              <div className="bg-white/60 text-[#1a202c] rounded-2xl px-3 py-2 min-w-[3rem] text-center shadow-sm border border-white animate-pulse">
                <div className="text-lg font-bold leading-none mb-1">{formatTime(timeLeft.seconds)}</div>
                <div className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">Sec</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {dailyDeals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="h-full">
              <ProductCard product={product} isFlashSale={true} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyDealsSection;
