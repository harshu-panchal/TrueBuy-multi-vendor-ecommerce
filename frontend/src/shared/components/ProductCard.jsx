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

  const hasDynamicAxes =
    Array.isArray(product?.variants?.attributes) &&
    product.variants.attributes.some((attr) => Array.isArray(attr?.values) && attr.values.length > 0);
  const hasSizeVariants = Array.isArray(product?.variants?.sizes) && product.variants.sizes.length > 0;
  const hasColorVariants = Array.isArray(product?.variants?.colors) && product.variants.colors.length > 0;
  const hasVariants = hasDynamicAxes || hasSizeVariants || hasColorVariants;

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
  const isOutOfStock = product.stock === "out_of_stock" || Number(product.stockQuantity || 0) <= 0;

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

    if (hasVariants) {
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
        className={`relative rounded-3xl overflow-hidden group cursor-pointer h-full flex flex-col border transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 ${
          isFlashSale 
            ? "bg-gradient-to-br from-white/90 to-red-50/80 backdrop-blur-md border-red-100 shadow-[0_4px_20px_-10px_rgba(239,68,68,0.1)]" 
            : "bg-white/70 backdrop-blur-lg border-white/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]"
        }`}
        {...longPressHandlers}
      >
        {/* Image Container */}
        <div className="relative h-44 lg:h-56 w-full overflow-hidden rounded-t-3xl bg-gray-50/50">
          {/* Discount Badge */}
          {product.originalPrice && (
            <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm backdrop-blur-md ${isFlashSale ? "bg-red-500/95 border border-red-400" : "bg-[#1a202c]/90 border border-gray-700"}`}>
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          )}

          {/* Flash Sale Badge */}
          {isFlashSale && (
            <div className="absolute top-3 left-20 z-10">
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1 animate-pulse border border-amber-300">
                <FiStar className="fill-white" />
                Hot Deal
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 1)" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className="p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-100 transition-all group/wishlist"
            >
              <FiHeart
                className={`text-[15px] transition-all duration-300 ${isFavorite
                  ? "text-red-500 fill-red-500"
                  : "text-gray-400 group-hover/wishlist:text-red-500"
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
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                <div className="bg-red-600 text-white text-[10px] md:text-xs font-black px-4 py-2 rounded-xl shadow-xl transform -rotate-12 border-2 border-white uppercase tracking-widest animate-pulse">
                  Sold Out
                </div>
              </div>
            )}

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

        {/* Product Details */}
        <div className="p-3.5 md:p-4.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-white/60">
          <div className="space-y-1.5">
            {/* Category / Type */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-blue-50/80 text-blue-600 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border border-blue-100">
                {product.parentCategoryName || product.categoryName || product.category || "General"}
              </span>
              {product.categoryName && product.parentCategoryName && (
                <>
                  <span className="text-[10px] text-gray-300 font-light translate-y-[-1px]">/</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider opacity-80">
                    {product.categoryName}
                  </span>
                </>
              )}
            </div>

            {/* Product Name */}
            <Link to={productLink} className="block group/title">
              <h3 className="font-semibold text-gray-900 tracking-tight line-clamp-1 text-[13px] md:text-[15px] group-hover/title:text-blue-600 transition-colors">
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
              disabled={isOutOfStock || isAdding}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-2.5 rounded-full font-bold text-[13px] sm:text-[14px] transition-all flex items-center justify-center gap-2 shadow-sm ${isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-[#1a202c] text-white hover:bg-black hover:shadow-lg hover:shadow-[#1a202c]/20 border border-transparent hover:border-gray-800"
                }`}
            >
              <FiShoppingBag size={14} className={isOutOfStock ? "opacity-50" : "opacity-90"} />
              <span>{isOutOfStock ? "Out of Stock" : hasVariants ? "View Details" : "Add to Cart"}</span>
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
