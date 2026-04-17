import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiShoppingCart, FiPackage } from 'react-icons/fi';

const WholesaleHome = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Wholesale Products',
      description: 'Browse wholesale listings from other vendors',
      icon: FiPackage,
      path: '/vendor/wholesale/products',
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      lightGradient: 'from-blue-50 via-blue-100/80 to-blue-50',
      shadowColor: 'shadow-blue-500/20',
      hoverShadow: 'hover:shadow-blue-500/30',
    },
    {
      title: 'B2B Cart',
      description: 'Review and place your wholesale orders',
      icon: FiShoppingCart,
      path: '/vendor/wholesale/cart',
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      lightGradient: 'from-purple-50 via-purple-100/80 to-purple-50',
      shadowColor: 'shadow-purple-500/20',
      hoverShadow: 'hover:shadow-purple-500/30',
    },
    {
      title: 'B2B Orders',
      description: 'Track wholesale orders (buy & sell)',
      icon: FiShoppingBag,
      path: '/vendor/wholesale/orders',
      gradient: 'from-green-500 via-green-600 to-green-700',
      lightGradient: 'from-green-50 via-green-100/80 to-green-50',
      shadowColor: 'shadow-green-500/20',
      hoverShadow: 'hover:shadow-green-500/30',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 sm:space-y-6"
    >
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">
          Wholesale Marketplace
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Buy wholesale products from other vendors without affecting B2C flows
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(item.path)}
              className="group relative overflow-hidden"
            >
              <div
                className={`
                  relative h-full
                  flex flex-col items-center justify-center
                  p-4 sm:p-6
                  bg-white
                  rounded-2xl sm:rounded-3xl
                  border border-gray-100/80
                  ${`bg-gradient-to-br ${item.lightGradient}`}
                  ${item.shadowColor} ${item.hoverShadow}
                  shadow-md sm:shadow-lg hover:shadow-2xl
                  transition-all duration-500 ease-out
                  active:scale-[0.98]
                  overflow-hidden
                `}
              >
                <div
                  className={`
                    absolute inset-0
                    bg-gradient-to-br ${item.gradient}
                    opacity-0 group-hover:opacity-10
                    transition-opacity duration-500
                  `}
                />

                <div
                  className={`
                    relative z-10
                    w-14 h-14 sm:w-20 sm:h-20
                    rounded-2xl sm:rounded-3xl
                    bg-gradient-to-br ${item.gradient}
                    flex items-center justify-center
                    mb-3 sm:mb-4
                    ${item.shadowColor}
                    shadow-lg sm:shadow-xl
                    group-hover:scale-110 group-hover:rotate-2
                    transition-all duration-500 ease-out
                  `}
                >
                  <Icon className="text-white text-xl sm:text-3xl" strokeWidth={2.5} />
                </div>

                <div className="relative z-10 text-center space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WholesaleHome;

