import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
} from "react-icons/fi";

const VendorBottomNav = ({ isHidden }) => {
  const location = useLocation();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const checkKeyboard = () => {
      setTimeout(() => {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);
        
        // On Android, window resizes. On iOS, visual viewport changes.
        // The most reliable cross-platform way is checking if an input is focused.
        setIsKeyboardOpen(isInputFocused);
      }, 50); // Small delay to let focus events settle
    };

    // Check on window resize (Android keyboard typically triggers this)
    window.addEventListener('resize', checkKeyboard);
    
    // Check on focus events (iOS keyboard typically triggers this)
    window.addEventListener('focusin', checkKeyboard);
    window.addEventListener('focusout', checkKeyboard);
    
    // Also listen to visualViewport if available (modern mobile browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboard);
    }

    return () => {
      window.removeEventListener('resize', checkKeyboard);
      window.removeEventListener('focusin', checkKeyboard);
      window.removeEventListener('focusout', checkKeyboard);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkKeyboard);
      }
    };
  }, []);

  const navItems = [
    { path: "/vendor/dashboard", icon: FiHome, label: "Home" },
    { path: "/vendor/products", icon: FiPackage, label: "Products" },
    { path: "/vendor/orders", icon: FiShoppingBag, label: "Orders" },
    { path: "/vendor/earnings", icon: FiDollarSign, label: "Earnings" },
  ];

  const isActive = (path) => {
    if (path === "/vendor/dashboard") {
      return location.pathname === "/vendor/dashboard";
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
      color: "#2874F0", // Primary color
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const navContent = (
    <nav 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden ${isKeyboardOpen || isHidden ? 'hidden' : ''}`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1">
              <motion.div
                className={`relative flex items-center justify-center ${
                  active ? "text-[#2874F0]" : "text-[#878787]"
                }`}
                variants={iconVariants}
                initial="inactive"
                animate={active ? "active" : "inactive"}>
                <Icon
                  className="text-2xl"
                  style={{
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                  }}
                />
              </motion.div>
              <span
                className={`text-xs font-medium ${
                  active ? "text-primary-600" : "text-gray-500"
                }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  // Use portal to render outside of transformed containers
  return createPortal(navContent, document.body);
};

export default VendorBottomNav;

