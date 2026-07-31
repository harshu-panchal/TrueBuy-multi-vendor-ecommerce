import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiGrid, FiSearch, FiHeart, FiUser } from "react-icons/fi";
import { useWishlistStore } from "../../../../shared/store/wishlistStore";
import { useAuthStore } from "../../../../shared/store/authStore";

const MobileBottomNav = () => {
  const location = useLocation();
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const { isAuthenticated } = useAuthStore();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const MIN_KEYBOARD_HEIGHT = 150;
    const initialHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      if (initialHeight - currentHeight > MIN_KEYBOARD_HEIGHT) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  const navItems = [
    { path: "/home", icon: FiHome, label: "Home" },
    { path: "/categories", icon: FiGrid, label: "Categories" },
    { path: "/search", icon: FiSearch, label: "Search" },
    {
      path: "/wishlist",
      icon: FiHeart,
      label: "Wishlist",
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    {
      path: isAuthenticated ? "/profile" : "/login",
      icon: FiUser,
      label: "Account",
    },
  ];

  const isActive = (path) => {
    if (path === "/home") {
      return location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  // Animation variants for icon
  const iconVariants = {
    inactive: {
      scale: 1,
      color: "#878787",
    },
    active: {
      scale: 1.1,
      color: "#7C3AED", // Primary Buttons color
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const navContent = (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl z-[9999] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 md:hidden overflow-visible pb-safe">
      <div className="flex items-center justify-between h-[70px] px-2 relative overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const isSearch = item.label === "Search";

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 relative h-full ${isSearch ? "-mt-8" : ""}`}>
              <motion.div
                className={`relative flex items-center justify-center ${
                  isSearch 
                    ? "w-[56px] h-[56px] rounded-full bg-[#1a202c] shadow-lg shadow-slate-900/20 text-white border-[6px] border-white z-20" 
                    : "w-14 h-10"
                }`}
                whileTap={{ scale: 0.9 }}>
                
                {/* Active Indicator Background for non-search */}
                {active && !isSearch && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-100 rounded-[18px]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                {/* Subtle blobs for inactive items */}
                {!active && !isSearch && (
                   <div className="absolute top-3 right-3 w-4 h-4 rounded-full mix-blend-multiply bg-slate-200/50"></div>
                )}

                {/* Icon */}
                <motion.div
                  className="relative z-10 flex items-center justify-center"
                  initial={false}
                  animate={{ scale: active && !isSearch ? 1.1 : 1 }}>
                  <Icon
                    className={`text-[22px] transition-all duration-300 ${
                      isSearch 
                        ? "text-white stroke-[2.5]" 
                        : active 
                          ? "text-[#1a202c] fill-[#1a202c] stroke-[#1a202c]" 
                          : "text-[#64748b] stroke-[1.5] fill-transparent"
                    }`}
                  />
                </motion.div>

                {/* Badge */}
                {item.badge && (
                  <motion.span
                    key={item.badge}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full border-2 border-white shadow-sm z-20 flex items-center justify-center bg-red-500">
                    <span className="text-[9px] font-bold text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  </motion.span>
                )}
              </motion.div>
              
              {/* Label */}
              <span className={`text-[10px] font-medium tracking-tight mt-1 ${active ? "text-[#1a202c]" : "text-[#64748b]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  // Use portal to render outside of transformed containers (like PageTransition)
  if (isKeyboardOpen) return null;
  return createPortal(navContent, document.body);
};

export default MobileBottomNav;
