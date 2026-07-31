import { Link, useNavigate } from "react-router-dom";
import { useCartStore, useUIStore } from "../../../../shared/store/useStore";
import { useWishlistStore } from "../../../../shared/store/wishlistStore";
import { useAuthStore } from "../../../../shared/store/authStore";
import { appLogo } from "../../../../data/logos";
import SearchBar from "../../../../shared/components/SearchBar";
import { FiHeart, FiShoppingBag, FiUser, FiLogOut, FiGrid, FiBell, FiTag, FiChevronDown } from "react-icons/fi";
import { HiOutlineUserCircle } from "react-icons/hi";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserNotificationStore } from "../../store/userNotificationStore";

const DesktopHeader = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const itemCount = useCartStore((state) => state.getItemCount());
    const wishlistCount = useWishlistStore((state) => state.getItemCount());
    const unreadCount = useUserNotificationStore((state) => state.unreadCount);
    const ensureHydrated = useUserNotificationStore((state) => state.ensureHydrated);
    const toggleCart = useUIStore((state) => state.toggleCart);

    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        ensureHydrated();
    }, [ensureHydrated, isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate("/home");
    };

    return (
        <header className="hidden md:block sticky top-0 z-[999] bg-gradient-to-r from-[#e9eff5]/90 via-[#f4f7fb]/80 to-[#e9eff5]/90 backdrop-blur-xl shadow-sm border-b border-white/60">
            <div className="w-full px-6 lg:px-10 xl:px-16 h-20 flex items-center justify-between gap-8">
                {/* Logo */}
                <Link to="/home" className="flex-shrink-0 flex items-center gap-2 relative z-[1001] h-full">
                    {appLogo.src ? (
                        <img
                            src={appLogo.src}
                            alt={appLogo.alt}
                            className="h-12 lg:h-14 w-auto object-contain"
                        />
                    ) : (
                        <span className="text-2xl font-bold text-primary-600 text-nowrap">LOGO</span>
                    )}
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-6">
                    <Link to="/home" className="relative text-[#1a202c] font-semibold text-sm lg:text-base group">
                        Home
                        <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-red-500 rounded-full" />
                    </Link>
                    <Link to="/categories" className="text-[#1a202c] hover:text-blue-600 font-semibold text-sm lg:text-base flex items-center gap-1.5 transition-colors">
                        <div className="text-blue-600 opacity-80 drop-shadow-sm">
                          <FiGrid className="text-lg" />
                        </div>
                        Categories
                    </Link>
                    <Link to="/offers" className="text-[#1a202c] hover:text-blue-600 font-semibold text-sm lg:text-base flex items-center gap-1.5 transition-colors">
                        <div className="text-blue-600 opacity-80 drop-shadow-sm">
                          <FiTag className="text-lg" />
                        </div>
                        Offers
                    </Link>
                </nav>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl">
                    <SearchBar />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-5">
                    {/* Wishlist */}
                    <Link to="/wishlist" className="relative p-2 text-[#1a202c] hover:text-blue-600 transition-colors drop-shadow-sm">
                        <FiHeart className="text-2xl stroke-[1.5]" />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                                {wishlistCount > 9 ? "9+" : wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <button
                        onClick={toggleCart}
                        className="relative p-2 text-[#1a202c] hover:text-blue-600 transition-colors drop-shadow-sm"
                    >
                        <FiShoppingBag className="text-2xl stroke-[1.5]" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                                {itemCount > 9 ? "9+" : itemCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications */}
                    <Link
                        to={isAuthenticated ? "/notifications" : "/login"}
                        className="relative p-2 text-[#1a202c] hover:text-blue-600 transition-colors drop-shadow-sm mr-2"
                    >
                        <FiBell className="text-2xl stroke-[1.5]" />
                        {isAuthenticated && unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#9f1239] text-white text-xs font-bold flex items-center justify-center shadow-md">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                        {/* Little sparkle dots decoration */}
                        <div className="absolute -top-2 -right-3 w-1 h-1 bg-red-400 rounded-full blur-[1px]"></div>
                        <div className="absolute top-1 -right-4 w-1.5 h-1.5 bg-blue-300 rounded-full blur-[1px]"></div>
                        <div className="absolute bottom-0 -left-2 w-1 h-1 bg-yellow-300 rounded-full blur-[1px]"></div>
                    </Link>

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div ref={userMenuRef} className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/40 backdrop-blur-md rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),_0_2px_10px_rgba(0,0,0,0.05)] border border-white hover:bg-white/60 transition-all"
                            >
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full object-cover shadow-sm border border-white/50"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center text-white font-bold text-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] border border-[#334155]">
                                      {user?.name ? user.name.substring(0, 2).toUpperCase() : "DJ"}
                                    </div>
                                )}
                                <span className="hidden lg:block text-sm font-semibold text-[#1a202c] truncate max-w-[120px]">{user?.name || "Dev Jaiswal"}</span>
                                <FiChevronDown className="text-blue-600 text-sm hidden lg:block drop-shadow-sm" />
                            </button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-[60] min-w-[200px]"
                                    >
                                        <div className="px-3 py-2 border-b border-gray-200 mb-2">
                                            <p className="font-semibold text-gray-800 text-sm">
                                                {user?.name || "User"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {user?.email || ""}
                                            </p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left w-full"
                                        >
                                            <FiUser className="text-gray-500" />
                                            <span className="text-gray-700 text-sm">Profile</span>
                                        </Link>
                                        <Link
                                            to="/orders"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left w-full"
                                        >
                                            <FiShoppingBag className="text-gray-500" />
                                            <span className="text-gray-700 text-sm">Orders</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors text-left w-full text-red-600 mt-1"
                                        >
                                            <FiLogOut className="text-red-500" />
                                            <span className="text-sm">Logout</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/login" className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DesktopHeader;
