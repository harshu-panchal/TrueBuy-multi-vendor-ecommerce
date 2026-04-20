import { FiHeart, FiShoppingBag, FiStar, FiTrash2, FiTruck } from "react-icons/fi";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore, useUIStore } from "../store/useStore";
import { useWishlistStore } from "../store/wishlistStore";
import { formatPrice, getPlaceholderImage } from "../utils/helpers";
import toast from "react-hot-toast";
import LazyImage from "./LazyImage";
import { useState, useRef } from "react";
import useLongPress from "../../modules/UserApp/hooks/useLongPress";
import LongPressMenu from "../../modules/UserApp/components/Mobile/LongPressMenu";
import FlyingItem from "../../modules/UserApp/components/Mobile/FlyingItem";
import { getVariantSignature } from "../utils/variant";


const ProductCard = ({ product, hideRating = false, isFlashSale = false }) => {
  const navigate = useNavigate();
  const [activeColorIdx, setActiveColorIdx] = useState(0);

  const productLink = `/product/${product.id}`;
  const { items, addItem, removeItem } = useCartStore();
  const triggerCartAnimation = useUIStore(
    (state) => state.triggerCartAnimation
  );
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const hasNoVariant = (cartItem) => !getVariantSignature(cartItem?.variant || {});
  const isFavorite = isInWishlist(product.id);
  const isInCart = items.some(
    (item) => item.id === product.id && hasNoVariant(item)
  );
  const [isAdding, setIsAdding] = useState(false);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showFlyingItem, setShowFlyingItem] = useState(false);
  const [flyingItemPos, setFlyingItemPos] = useState({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  });
  const buttonRef = useRef(null);
  const cartIconRef = useRef(null);

  const handleAddToCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const hasDynamicAxes =
      Array.isArray(product?.variants?.attributes) &&
      product.variants.attributes.some((attr) => Array.isArray(attr?.values) && attr.values.length > 0);
    const hasSizeVariants = Array.isArray(product?.variants?.sizes) && product.variants.sizes.length > 0;
    const hasColorVariants = Array.isArray(product?.variants?.colors) && product.variants.colors.length > 0;
    if (hasDynamicAxes || hasSizeVariants || hasColorVariants) {
      toast.error("Please select variant on product page");
      navigate(productLink);
      return;
    }

    const isLargeScreen = window.innerWidth >= 1024;

    if (!isLargeScreen) {
      setIsAdding(true);

      // Get button position
      const buttonRect = buttonRef.current?.getBoundingClientRect();
      const startX = buttonRect ? buttonRect.left + buttonRect.width / 2 : 0;
      const startY = buttonRect ? buttonRect.top + buttonRect.height / 2 : 0;

      // Get cart bar position (prefer cart bar over header icon)
      setTimeout(() => {
        const cartBar = document.querySelector("[data-cart-bar]");
        let endX = window.innerWidth / 2;
        let endY = window.innerHeight - 100;

        if (cartBar) {
          const cartRect = cartBar.getBoundingClientRect();
          endX = cartRect.left + cartRect.width / 2;
          endY = cartRect.top + cartRect.height / 2;
        } else {
          // Fallback to cart icon in header
          const cartIcon = document.querySelector("[data-cart-icon]");
          if (cartIcon) {
            const cartRect = cartIcon.getBoundingClientRect();
            endX = cartRect.left + cartRect.width / 2;
            endY = cartRect.top + cartRect.height / 2;
          }
        }

        setFlyingItemPos({
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
        });
        setShowFlyingItem(true);
      }, 50);

      setTimeout(() => setIsAdding(false), 600);
    }

    const addedToCart = addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      stockQuantity: product.stockQuantity,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
    });
    if (!addedToCart) return;
    triggerCartAnimation();
    toast.success("Added to cart!");
  };

  const handleRemoveFromCart = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    removeItem(product.id, {});
    toast.success("Removed from cart!");
  };

  const handleLongPress = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setShowLongPressMenu(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name}`,
        url: window.location.origin + productLink,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + productLink);
      toast.success("Link copied to clipboard");
    }
  };

  const longPressHandlers = useLongPress(handleLongPress, 500);

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      const addedToWishlist = addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      if (addedToWishlist) {
        toast.success("Added to wishlist");
      }
    }
  };

  // Calculate sold percentage for flash sale (mock logic)
  const soldPercentage = product.stockQuantity ? Math.min(95, Math.floor(100 - (product.stockQuantity / 2))) : 75;

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ y: -8, transition: { duration: 0.4, ease: "easeOut" } }}
        className={`rounded-2xl overflow-hidden group cursor-pointer h-full flex flex-col border transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] ${
          isFlashSale 
            ? "bg-[#ffffff] border-amber-500 shadow-lg" 
            : "bg-white border-gray-100/80"
        }`}
        {...longPressHandlers}
      >
        {/* Image Container */}
        <div className="relative h-44 lg:h-52 w-full overflow-hidden rounded-t-2xl bg-gray-50">
          {/* Discount Badge */}
          {product.originalPrice && (
            <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm backdrop-blur-md ${isFlashSale ? "bg-red-600/90" : "bg-blue-600/90"}`}>
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          )}

          {/* Flash Sale Badge */}
          {isFlashSale && (
            <div className="absolute top-3 left-20 z-10">
              <div className="bg-amber-400 text-gray-900 text-[8px] font-black px-2 py-1 rounded-lg shadow-sm uppercase tracking-tighter flex items-center gap-1 animate-pulse">
                <FiStar className="fill-current" />
                Hot Deal
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className="p-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg shadow-black/5 border border-white/20 transition-all group/wishlist"
            >
              <FiHeart
                className={`text-[15px] transition-all duration-300 ${isFavorite
                  ? "text-red-500 fill-red-500"
                  : "text-gray-600 group-hover/wishlist:text-red-500"
                  }`}
              />
            </motion.button>
          </div>

          {/* Product Image */}
          <Link to={productLink} className="block h-full w-full">
            <img
              src={product.image || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 zoom-image"
              style={{ willChange: "transform" }}
              onError={(e) => {
                e.target.src = getPlaceholderImage(400, 500, "Product");
              }}
            />
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          {/* Stock Urgency Tag */}
          {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <div className="absolute bottom-3 left-3 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-sm">
              Only {product.stockQuantity} left!
            </div>
          )}
        </div>

        {/* Product Details - ~35% Height Area */}
        <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Category / Type */}
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider">
                {product.parentCategoryName || product.categoryName || product.category || "General"}
              </span>
              {product.categoryName && product.parentCategoryName && (
                <>
                  <span className="text-[10px] text-gray-300 font-light translate-y-[-1px]">/</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-80">
                    {product.categoryName}
                  </span>
                </>
              )}
            </div>

            {/* Product Name */}
            <Link to={productLink} className="block group/title">
              <h3 className="font-semibold text-gray-800 line-clamp-1 text-xs md:text-sm group-hover/title:text-blue-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Color Swatches (if available) */}
            <div className="min-h-[22px] flex items-center gap-1.5 py-1">
              {product.variants?.colors && product.variants.colors.length > 0 ? (
                <>
                  {product.variants.colors.slice(0, 4).map((color, idx) => {
                    const colorMap = {
                      red: "#ef4444",
                      blue: "#3b82f6",
                      green: "#22c55e",
                      yellow: "#eab308",
                      black: "#18181b",
                      white: "#ffffff",
                      gray: "#71717a",
                      brown: "#78350f",
                      pink: "#ec4899",
                      purple: "#a855f7",
                      orange: "#f97316",
                      navy: "#1e3a8a",
                      silver: "#e5e7eb",
                      gold: "#d4af37",
                    };
                    const colorCode = color.startsWith("#")
                      ? color
                      : colorMap[color.toLowerCase()] || "#d1d5db";

                    const isVeryLight = ["white", "#ffffff", "silver", "#e5e7eb"].includes(color.toLowerCase());

                    return (
                      <button
                        key={idx}
                        type="button"
                        onMouseEnter={() => setActiveColorIdx(idx)}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(productLink);
                        }}
                        className={`w-3 h-3 rounded-full border transition-all duration-300 transform-gpu cursor-pointer flex-shrink-0 ${activeColorIdx === idx
                          ? "ring-1 ring-gray-900 ring-offset-2 scale-110"
                          : "hover:scale-125"
                          } ${isVeryLight ? "border-gray-300 shadow-inner" : "border-gray-200"
                          } hover:ring-1 hover:ring-gray-300 hover:ring-offset-1`}
                        style={{ backgroundColor: colorCode }}
                        title={color}
                      />
                    );
                  })}
                  {product.variants.colors.length > 4 && (
                    <span className="text-[10px] font-bold text-gray-400 pl-0.5">
                      +{product.variants.colors.length - 4}
                    </span>
                  )}
                </>
              ) : (
                // Spacer to maintain height if no colors
                <div className="h-3.5 invisible" />
              )}
            </div>

            {/* Ratings */}
            {!hideRating && product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`text-[10px] ${i < Math.floor(product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-gray-500">
                  {Number(product.rating || 0).toFixed(1)} <span className="font-medium opacity-60">({product.reviewCount || 0})</span>
                </span>
              </div>
            )}

            {/* Price section */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
              <span className="text-sm md:text-lg font-black text-gray-900 tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] md:text-xs text-gray-600/90 line-through decoration-gray-900/30 font-medium whitespace-nowrap">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            {/* Urgency Indicator (Flash Sale Only) */}
            {isFlashSale && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold tracking-tight ${isFlashSale ? "text-gray-900/80" : "text-gray-700"}`}>
                    🔥 {soldPercentage}% sold
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden bg-gray-100`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${soldPercentage}%` }}
                    transition={{ duration: 1,  ease: "easeOut" }}
                    className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.2)]"
                  />
                </div>
              </div>
            )}


          </div>

          {/* Interaction Zone */}
          <div className="mt-auto pt-4">
            <motion.button
              ref={buttonRef}
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === "out_of_stock" || isAdding}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-2.5 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-sm ${product.stock === "out_of_stock"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-[#0f172a] text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]"
                }`}
            >
              <FiShoppingBag size={14} />
              <span>{product.stock === "out_of_stock" ? "Out of Stock" : "Add to Cart"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <LongPressMenu
        isOpen={showLongPressMenu}
        onClose={() => setShowLongPressMenu(false)}
        position={menuPosition}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleFavorite}
        onShare={handleShare}
        isInWishlist={isFavorite}
      />

      {showFlyingItem && (
        <FlyingItem
          image={product.image}
          startPosition={flyingItemPos.start}
          endPosition={flyingItemPos.end}
          onComplete={() => setShowFlyingItem(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
